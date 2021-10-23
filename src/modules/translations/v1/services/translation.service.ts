import { writeToString } from '@fast-csv/format';
import { APP_DATA, TASKS } from '@constants';
import { InjectQueue } from '@nestjs/bull';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { TranslationsResponseDto, TranslationForAppQuery, TranslationQueryDto } from '../dto/translation.dto';
import { Namespace } from '../../schemas/namespace.schema';
import { NamespaceService } from './namespace.service';
import { TranslationKeyService } from './translationkey.service';
import { TranslationTextService } from './translationtext.services';
import { ITranslationsResponse, ITranslationsAppResponse } from '../interfaces/translation.interface';
import Cache from 'cache-manager';
import { TranslationText } from '../../schemas/translationtext.schema';
import { parseCsvBuffer } from '@core/utils/csv';
import { Languages } from '@modules/translations/enums/languages';
import { getLanguageCodeByLabel, getLanguageLabel } from '@utils/language';
import { createError } from '@core/errors/node';
import { KeyTranslationRow } from '../typings/translation.typings';
import { PaginatedResultDto } from '@core/dto/pagination';
import { LanguageList } from '../../enums/languages';
import { TranslationProducerService } from './translation.producer.service';

@Injectable()
export class TranslationService {
    constructor(
        private readonly namespaceService: NamespaceService,
        private readonly translationKeyService: TranslationKeyService,
        private readonly translationTextService: TranslationTextService,
        private readonly translationProducer: TranslationProducerService,
        @InjectQueue(TASKS.queue.TRANSLATION) private translationQueue: Queue,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }

    async uploadTranslationsCsv(file: Express.Multer.File, namespace: string): Promise<void> {
        let error: Error, translations: Record<string, Record<Languages, string>> = {}, translationKeys: string[] = [];

        try {
            let count = 0;
            const wrongLanguages: string[] = [];
            await parseCsvBuffer<Record<string, string>, Record<Languages, string>>(
                file,
                {
                    headers: true,
                    discardUnmappedColumns: true,
                    trim: true
                },
                {
                    transform: (row) => {
                        const transformedRow: Partial<Record<Languages, string>> = {}

                        for (let key in row) {
                            let rowKey = key;

                            if (rowKey !== APP_DATA.KEY_HEADER) {
                                rowKey = getLanguageCodeByLabel(key)
                                if (!rowKey && key && count == 0) {
                                    wrongLanguages.push(key)
                                }
                            } else {
                                translationKeys.push(row[key])
                            }
                            transformedRow[rowKey] = row[key]
                        }
                        return transformedRow;
                    },
                    validate: (row) => {
                        if (count == 0) {
                            const keyArr = Object.keys(row).filter(v => ['undefined', APP_DATA.KEY_HEADER].indexOf(v) == -1);
                            if ('undefined' in row) {
                                const errMsg = wrongLanguages.length ? `Wrong language names: ${wrongLanguages.join(", ")}` : 'Empty headers are not allowed';

                                error = createError('MISSING_OR_INCORRECT_COLUMNS_CSV', errMsg)
                                return false;
                            }
                            if (keyArr.length == 0) {
                                error = createError('MISSING_OR_INCORRECT_COLUMNS_CSV', 'Atleast 1 language should be present')
                                return false;
                            }
                        }
                        else {
                            count++;
                        }
                        translations[row[APP_DATA.KEY_HEADER]] = {
                            ...row
                        }

                        delete translations[row[APP_DATA.KEY_HEADER]][APP_DATA.KEY_HEADER]

                        return true;
                    }
                });

        } catch (err) {
            throw error || err
        }

        await this.namespaceService.createOrUpdateNamespace(namespace);

        await this.translationKeyService.createOrUpdateMultipleKeys(namespace, translationKeys);
        await this.translationTextService.createOrUpdateMultipleTranslations(namespace, translations);
        await this.translationQueue.add(TASKS.tasks.UPDATE_TRANSLATION_CACHE, {
            namespace: namespace
        });
    }

    async searchAllTranslationsInNamespace(query: TranslationQueryDto): Promise<PaginatedResultDto<KeyTranslationRow>> {
        this.translationProducer.produceEvent('update-single-translation', {
            "name" : "hello"
        });
        return await this.translationTextService.searchAllTranslationsInNamespace(query)
    }

    /**
     * gets translations from cache, if last_fetched_time is given then only 
     * the namespace which has been updated is returned. Else we send nothing
     * @param payload 
     * @returns {}
     */
    public getTranslationsForApp = async (payload: TranslationForAppQuery): Promise<ITranslationsAppResponse> => {
        try {
            let { namespaces, language } = payload;
            const langCode:string = getLanguageCodeByLabel(language);
            const cachedValue: ITranslationsResponse = await this.getCachedTranslations(namespaces, langCode)
            let response: ITranslationsAppResponse = {}

            // fetch only the namespaces which are updated after last_fetched_timestamp
            if (payload.last_fetched_timestamp) {
                const updatedNamespaces: Namespace[] = await this.namespaceService.getUpdatedNamespaces(
                    namespaces, payload.last_fetched_timestamp
                )
                namespaces = updatedNamespaces.map((item) => item.name)
            }

            // if none are updated then return
            if (!namespaces.length) return;

            namespaces.forEach((key) => {
                const data: Record<string, string> = cachedValue[`${key}_${langCode}`];
                if (data) {
                    response = { ...response, [key]: { [langCode]: data } }
                }
            });
            // to do add isemptyobject
            if (!Object.keys(response).length) throw new Error(`No data for ${namespaces} and ${langCode}`)
            return response;
        } catch (err) {
            throw err
        }
    }

    /**
     * This gets data from cached values depending on namespace and language combination
     * @param {string[]} namespaces 
     * @param {string} langCode 
     * @returns 
     */
    async getCachedTranslations(namespaces: string[], langCode: string): Promise<ITranslationsResponse> {
        try {
            const cacheKeys: string[] = namespaces.map((name) => `${name}_${langCode}`);
            const cachedData:Promise<Record<string, string>[]> = await this.cacheManager.mget(cacheKeys);
            const response:ITranslationsResponse = {}

            for (let i=0; i<cacheKeys.length; i++) {
                response[cacheKeys[i]] = cachedData[i]
            }
            return response;
        } catch (err) {
            throw new Error(`Failed to fetch cached translations`)
        }
    }

    async updateCachedTranslations(data: ITranslationsResponse) {
        try {
            for (const [key, value] of Object.entries(data)) {
                await this.cacheManager.set(key, value, {
                    ttl: APP_DATA.TRANSLATION_CACHE_EXPIRY,
                });
            }
            return
        } catch (err) {
            throw new Error(`Failed to update cached translations`)
        }
    }

    /**
     * Forms the translation response required for client
     * @param translations 
     */
    getTranslationResponse(translations: TranslationText[]): ITranslationsResponse {
        try {
            if (!translations || !translations.length) throw new Error(`No translations found`);
            const response: ITranslationsResponse = translations.reduce((acc, curVal) => {
                const key: string = curVal.key;
                if (acc[key]) {
                    acc[key] = { ...acc[key], [curVal.lang]: curVal.text }
                } else {
                    acc[key] = { [curVal.lang]: curVal.text }
                }
                return acc;
            }, {})
            return response;
        } catch (err) {
            throw err;
        }
    }

    async getAllTranslations(namespace = APP_DATA.DEFAULT_NAMESPACE): Promise<KeyTranslationRow[]> {
        let next = true, page = 1, size = 100;
        let translations: KeyTranslationRow[] = [];

        while (next) {
            const { hasNext, data } = await this.translationTextService.searchAllTranslationsInNamespace({
                namespace,
                page,
                size
            });

            next = hasNext;
            translations = [...translations, ...data];
            page++;
        }

        return translations;
    }

    async getTranslationsAsCsvString(namespace = APP_DATA.DEFAULT_NAMESPACE): Promise<string> {
        const trans = await this.getAllTranslations(namespace);
        const headers: string[] = [APP_DATA.KEY_HEADER]
        const data: Array<Array<string>> = [headers];

        LanguageList.map((code) => {
            headers.push(getLanguageLabel(code));
        })

        trans.forEach(({ key, translations }) => {
            const row: string[] = [key];

            LanguageList.map((code) => {
                row.push(translations[code]);
            });
            data.push(row);
        })

        return await writeToString(data);
    }

}


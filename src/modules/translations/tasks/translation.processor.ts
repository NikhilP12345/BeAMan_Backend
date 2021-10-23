import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { TranslationTextService } from '../v1/services/translationtext.services';
import { TranslationKeyService } from '../v1/services/translationkey.service';
import { TranslationText } from '../schemas/translationtext.schema';
import { ITranslationsResponse } from '../v1/interfaces/translation.interface';
import { ValidateNested } from 'class-validator';
import { TranslationService } from '../v1/services/translation.service';
import { TASKS } from '@constants'

@Processor(TASKS.queue.TRANSLATION)
export class TranslationProcessor {
    constructor(
        private readonly translationTextService: TranslationTextService,
        private readonly translationKeyService: TranslationKeyService,
        private readonly translationService: TranslationService,

    ) { }

    private readonly logger = new Logger(TranslationProcessor.name);

    @Process(TASKS.tasks.UPDATE_TRANSLATION_CACHE)
    async updateTranslationCache(job: Job) {
        
        try {
            this.logger.log(`Received message in ${TASKS.queue.TRANSLATION} data: ${JSON.stringify(job.data)}`);

            if (!job || !job.data) {
                this.logger.error(`Undefined message ${TASKS.queue.TRANSLATION}`);
            }

            const namespace: string = job.data.namespace;
            const translationValues: TranslationText[] =
                await this.translationTextService.getTranslationsByNamespace(namespace);
            
            const cacheValue: ITranslationsResponse =
                await this.createTranslationCacheData(namespace, translationValues);
            await this.translationService.updateCachedTranslations(cacheValue);
            this.logger.log(`Caching completed for namespace ${namespace}`);
        } catch (err) {
            this.logger.error(
                `error at updateTranslationCache queue task : ${err.message}`,
            );
        }
    }

    /**
     * Fetches the existing cached value and appends the updated namespace key-value data
     * @param {string} namespace
     * @param {TranslationText[]} translationValues
     * @returns cache value
     */
    @ValidateNested({ each: true })
    async createTranslationCacheData(
        namespace: string,
        translationValues: TranslationText[],
    ): Promise<ITranslationsResponse> {
        try {
            if (!namespace || !translationValues || !translationValues.length) {
                throw new Error(
                    `Undefined namespace or translation values in createTranslation`,
                );
            }

            let cacheValue: ITranslationsResponse = {};
            translationValues.forEach((item) => {
                const key: string = `${namespace}_${item.lang}`;
                const value: Record<string, string> = { [item.key]: item.text };
                cacheValue[key] = cacheValue[key]
                    ? { ...cacheValue[key], ...value }
                    : { ...value };
            });

            return cacheValue;
        } catch (err) {
            throw err;
        }
    }
}

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { TranslationsResponseDto, TranslationQueryDto, TranslationAggregateItem } from "../dto/translation.dto";
import { TranslationText, TranslationTextDocument } from "../../schemas/translationtext.schema";
import { Languages } from "@modules/translations/enums/languages";
import { KeyTranslationRow, KeyTranslations } from "../typings/translation.typings";
import { PaginatedResultDto } from "@core/dto/pagination";
import { getPaginatedResults } from "@core/utils/pagination";



@Injectable()
export class TranslationTextService {
    constructor(
        @InjectModel(TranslationText.name) private translationTextModel: Model<TranslationTextDocument>
    ) {
        this.translationTextModel.syncIndexes();
    }

    
    async searchAllTranslationsInNamespace({query, namespace, page = 1, size = 10}: TranslationQueryDto): Promise<PaginatedResultDto<KeyTranslationRow>> {
        
        const result: KeyTranslationRow[] = [];

        const findQuery: FilterQuery<TranslationTextDocument> = {
            namespace,
            lang: Languages.ENGLISH
        };

        if (query) {
            findQuery['$text'] = {
                $search: query,
                $caseSensitive: false
            };
        }
        const {hasNext, hasPrevious, data} = await getPaginatedResults<TranslationTextDocument>(this.translationTextModel.find(findQuery).sort({updated_at: -1}), page, size)

        const keys = data.map(v => v.key);


        const translationsAggregation: TranslationAggregateItem[] = await this.translationTextModel.aggregate([]).match({
            key: {
                $in: keys
            }
        }).group({
            _id: "$key",
            translations: { $push:  { lang: "$lang", text: "$text"} }
        });

        translationsAggregation.forEach(({_id, translations}) => {
            const trans: Partial<KeyTranslations> = {};
            translations.forEach(({lang, text}) => {
                trans[lang] = text
            })
            result.push({
                key: _id,
                translations: trans
            })
        })
        
        return {data: result, hasNext, hasPrevious};
    }

    /**
     * retruns the translations for all the keys of namespace with pagination
     * @param {TranslationQueryDto} payload 
     * @returns 
     */

     async getTranslationsByNamespace(namespace:string): Promise<TranslationText[]> {
        try {
            const translations: TranslationText[] = await this.translationTextModel.find({namespace});
            return translations;
        } catch (err) {
            throw err;
        }
    }

    async getTranslationTexts(payload: TranslationQueryDto): Promise<TranslationsResponseDto> {
        try {
            const query: any = {};
            const skip: number = payload.page * payload.size;
            let next:boolean = false;
            if (payload.query) query['key'] = payload.query;
            const translations: TranslationText[] = await this.translationTextModel.find(query).skip(skip).limit(payload.size + 1);
            if(translations && translations.length > 0) next = true;
            return 
        } catch (err) {
            throw err;
        }
    }


    async createOrUpdateMultipleTranslations(namespace: string, translations: Record<string, Record<Languages, string>>): Promise<void> {
        const transactions = []

        for (let key in translations) {
            for (let language in translations[key]) {
                transactions.push({
                    updateOne: {
                        filter: { key, lang: language, namespace },
                        update: { key, lang: language, namespace, text: translations[key][language] },
                        upsert: true
                    }
                })
            }
        }
        await this.translationTextModel.bulkWrite(transactions, {ordered: false});
    }



}
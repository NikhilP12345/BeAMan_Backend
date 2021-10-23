import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { PaginationDto } from "@core/dto/pagination";
import { Model } from "mongoose";
import { TranslationKey, TranslationKeyDocument } from "../../schemas/translationkey.schema";
import { scrollCollection } from "@core/utils/mongoose";
import { APP_DATA, MONGO_ERROR_CODES } from '@constants'
import { createError } from "@core/errors/node";



@Injectable()
export class TranslationKeyService{
    constructor(
        @InjectModel(TranslationKey.name) private translationKeyModel: Model<TranslationKeyDocument>
    ){
        this.translationKeyModel.syncIndexes();
    }
    
    async getTranslationKeysByNamespace(namespace: string): Promise<string[]> {
        try {
            if(!namespace) { throw new Error(`Undefined namespace in getTranslationKeysByNamespace`)}
            let translationKeys: string[] = [];

            await this.scrollTranslationKeys(namespace, async (keys) => {
                keys.forEach((item) => {
                    translationKeys.push(item.name)
                });
            })

            return translationKeys
        } catch(err) {
            throw err
        }
    }

    async scrollTranslationKeys (namespace: string, callback: (doc: TranslationKeyDocument[]) => Promise<void>, pageSize = APP_DATA.PAGE_LIMIT) {
        await scrollCollection<TranslationKeyDocument>(this.translationKeyModel.find({namespace}).sort({updated_at: -1}), callback, pageSize)
    }
    
    async searchTranslationKeys(query:any, pagination?:PaginationDto):Promise<TranslationKey[]> {
        try {
            return this.translationKeyModel.find({query}).skip(pagination.page*pagination.size).limit(pagination.size);
        } catch(err) {
            throw new Error(`Failed to search Translation Texts`)
        }
    }


    async createOrUpdateMultipleKeys(namespace: string, keys: string[]): Promise<void>{
        try {
            const updateTranslationKeyArr = keys.map(key => ({
                updateOne: {
                    filter: {name: key, namespace},
                    update: {name: key, namespace},
                    upsert: true
                }
            }));
            await this.translationKeyModel.bulkWrite(updateTranslationKeyArr);
        } catch (err) {
            if (err.code == MONGO_ERROR_CODES.DUPLICATE_ENTITY) {
                throw createError('DUPLICATE_ENTRIES', 'Some of the keys are already present in other namespace')
            }
            throw err;
        }
    }



}
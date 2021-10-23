import { Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LanguageList } from '../enums/languages';

export type TranslationTextDocument = TranslationText & Document;

@Schema({
    timestamps: {
        updatedAt: 'updated_at',
        createdAt: 'created_at',
    },
})
export class TranslationText {

  @Prop({required: true})
  key: string;

  @Prop({required: true})
  namespace: string;

  @Prop({required: true})
  text: string;

  @Prop({required: true, enum: LanguageList })
  lang: string;

}

const TranslationTextSchema = SchemaFactory.createForClass(TranslationText);
TranslationTextSchema.index({ key: 1, lang: 1 }, { name: "key_lang_unique", unique: true });
TranslationTextSchema.index({ namespace: 1, key: 1, lang: 1, updated_at: 1 }, { name: "namespace_key_lang_search" });
TranslationTextSchema.index({ key: 'text', text: 'text' }, { name: "text_search", default_language: 'none'});

export {TranslationTextSchema};


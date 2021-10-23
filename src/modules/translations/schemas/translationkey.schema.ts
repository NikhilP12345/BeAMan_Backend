import { Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TranslationKeyDocument = TranslationKey & Document;

@Schema({
    timestamps: {
        updatedAt: 'updated_at',
        createdAt: 'created_at',
    },
})
export class TranslationKey {

  @Prop({unique: true, required:true})
  name: string;

  @Prop({required: true})
  namespace: string;

}

export const TranslationKeySchema = SchemaFactory.createForClass(TranslationKey);
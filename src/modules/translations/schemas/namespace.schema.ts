import { Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';

export type NamespaceDocument = Namespace & Document;

@Schema({
    timestamps: {
        updatedAt: 'updated_at',
        createdAt: 'created_at',
    },
})
export class Namespace {

  @Prop()
  _id: String

  @Prop({unique: true, required:true})
  name: string; // Immutable. Should not be changed

}

export const NamespaceSchema = SchemaFactory.createForClass(Namespace);


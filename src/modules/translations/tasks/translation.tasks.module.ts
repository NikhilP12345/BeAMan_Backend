import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CsvModule } from 'nest-csv-parser';
import { Namespace, NamespaceSchema } from '../schemas/namespace.schema';
import {
    TranslationKey,
    TranslationKeySchema,
} from '../schemas/translationkey.schema';
import {
    TranslationText,
    TranslationTextSchema,
} from '../schemas/translationtext.schema';
import { BullModule } from '@nestjs/bull';
import { TranslationProcessor } from './translation.processor';
import { TASKS } from "@constants";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Namespace.name, schema: NamespaceSchema },
        ]),
        MongooseModule.forFeature([
            { name: TranslationKey.name, schema: TranslationKeySchema },
        ]),
        MongooseModule.forFeature([
            { name: TranslationText.name, schema: TranslationTextSchema },
        ]),
        CsvModule,
        BullModule.registerQueue({
            name: TASKS.queue.TRANSLATION,
        })
    ],
    providers: [
        TranslationProcessor
    ],
})
export class TranslationTasksModule { }

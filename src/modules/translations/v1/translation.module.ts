import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
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
import { TranslationController } from './translation.controller';
import { NamespaceService } from './services/namespace.service';
import { TranslationKeyService } from './services/translationkey.service';
import { TranslationTextService } from './services/translationtext.services';
import { TranslationProcessor } from '../tasks/translation.processor';
import { TranslationService } from './services/translation.service';
import { TASKS } from '@constants';
import { ClientProxyFactory, ClientsModule, Transport } from '@nestjs/microservices';
import { TranslationProducerService } from './services/translation.producer.service';
import { ConfigService } from '@nestjs/config';

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
        }),
        // ClientsModule.register([
        //     { name: TASKS.service.TRANSLATION_SERVICE, transport: Transport.RMQ},
        // ]),
    ],

    controllers: [TranslationController],
    providers: [
        NamespaceService,
        TranslationKeyService,
        TranslationTextService,
        TranslationProcessor,
        TranslationService,
        TranslationProducerService,
        {
            provide: TASKS.service.TRANSLATION_SERVICE,
            useFactory: (configService: ConfigService) => {
              const queueOptions = configService.get('rabbitmq');
              return ClientProxyFactory.create(queueOptions);
            },
            inject: [ConfigService],
          }  
    ],
})
export class TranslationModule { }

import { CacheModule, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import * as RedisStore from 'cache-manager-redis-store';
import config from '../src/config/config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongoModule } from '@database/mongo/mongo.module';
import { TranslationModule } from '@modules/translations/v1/translation.module';
import { TASKS } from '@constants';
import { ClientProxyFactory } from '@nestjs/microservices';

@Module({
  imports: [
    MongoModule,
    TranslationModule,
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
          store: RedisStore,
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password'),
          isGlobal: true,
      }),
      inject: [ConfigService],
  }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: configService.get('redis'),
      }),
      inject: [ConfigService],
    })
  ],
  providers:[
    {
      provide: TASKS.service.TRANSLATION_SERVICE,
      useFactory: (configService: ConfigService) => {
        const queueOptions = configService.get('rabbitmq');
        return ClientProxyFactory.create(queueOptions);
      },
      inject: [ConfigService],
    }
  ]
})
export class AppModule {}

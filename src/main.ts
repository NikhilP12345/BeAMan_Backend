// external
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {ConfigService} from '@nestjs/config';

// modules
import { AppModule } from './app.module';

// interceptors
import ResponseInterceptor from '@core/interceptors/response';
import {LtExceptionsFilter} from '@core/filters/exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({origin: true});
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }));
  app.useGlobalFilters(new LtExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  const configService = app.get(ConfigService);
  await app.listen(configService.get('port'));
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api/v1');
  app.use(helmet());
  app.use(compression());
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Customer Service Messaging App')
    .setDescription('Messaging App API description')
    .setVersion('1.0')
    .addTag('Messaging App')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(8080);
}
bootstrap();

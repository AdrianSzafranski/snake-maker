import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  app.useLogger(new Logger());

  app.enableCors({
    origin: 'http://localhost:4200', // Możesz tu dodać adresy, które mają mieć dostęp
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Włącz transformację
    whitelist: true, // Usuwa pola, które nie są w DTO
  }));

  await app.listen(3000);
}
bootstrap();

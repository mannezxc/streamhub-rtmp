import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'node:process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
  });
  await app.listen(1337);
}
bootstrap();

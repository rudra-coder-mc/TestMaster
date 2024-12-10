import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ORIGIN_URL } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: ORIGIN_URL,
    credentials: true, // Allow cookies to be sent with the request
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Explicitly set allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  });
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();

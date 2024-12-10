import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:3000', // Replace with your frontend URL
    credentials: true, // Allow cookies to be sent with the request
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Explicitly set allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  });
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();

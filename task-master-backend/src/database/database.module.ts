import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MONGO_URL } from 'src/config';

@Module({
  imports: [MongooseModule.forRoot(MONGO_URL)],
})
export class DatabaseModule {}

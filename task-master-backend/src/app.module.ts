import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { TaskModule } from './task/task.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/AuthGuard';

@Module({
  imports: [AuthModule, UsersModule, DatabaseModule, TaskModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard, // Make AuthGuard global
    },
  ],
})
export class AppModule {}

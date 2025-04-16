import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService, GridFsModule } from './shared';
import { RedisCacheModule } from './shared/cache';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppThrottlerModule } from './shared/throttler/throttler.module';
import { UsersModule } from './modules';
import { ExamsModule } from './modules/exams';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.mongoUri,
      }),
      inject: [ConfigService],
    }),
    RedisCacheModule,
    AppThrottlerModule,
    UsersModule,
    ExamsModule,
    GridFsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

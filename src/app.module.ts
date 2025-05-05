import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService, GridFsModule } from './shared';
import { RedisCacheModule } from './shared/cache';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppThrottlerModule } from './shared/throttler/throttler.module';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import { UsersModule } from './modules';
import { ExamsModule } from './modules/exams';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.mongoUri,
        connectionFactory: (connection) => {
          connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
          });
          connection.on('connected', () => {
            console.log('MongoDB connected successfully');
          });
          return connection;
        },
        // Connection options for better reliability
        connectTimeoutMS: 10000, // 10 seconds
        socketTimeoutMS: 45000, // 45 seconds
        serverSelectionTimeoutMS: 5000, // 5 seconds
        maxPoolSize: 10,
        minPoolSize: 2,
        retryWrites: true,
        retryReads: true,
      }),
      inject: [ConfigService],
    }),
    RedisCacheModule.register(),
    // Import ThrottlerModule directly to ensure ThrottlerGuard is available
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ([
        {
          ttl: configService.get('THROTTLE_TTL', 60).getOrDefault(60), // Default 60 seconds
          limit: configService.get('THROTTLE_LIMIT', 100).getOrDefault(100), // Default 100 requests per TTL
        },
      ]),
    }),
    // Import CacheModule globally
    CacheModule.register({
      isGlobal: true,
      ttl: 30, // Default TTL of 30 seconds
      max: 1000, // Maximum number of items in cache
    }),
    UsersModule,
    ExamsModule,
    GridFsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Provide ThrottlerGuard globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Provide CacheInterceptor globally
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}

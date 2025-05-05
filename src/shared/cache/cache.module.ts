import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '../config';
import { ConfigService } from '../config/services/config.service';
import { CacheService } from './services/cache.service';
import { DynamicModule } from '@nestjs/common';

@Module({})
export class RedisCacheModule {
  static register(): DynamicModule {
    return {
      module: RedisCacheModule,
      imports: [
        CacheModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            // Use memory store with configurable TTL
            console.log('Using memory cache store');
            return {
              ttl: configService.redisTtl,
              isGlobal: true,
              max: 1000,
            };
          },
        }),
      ],
      providers: [CacheService],
      exports: [CacheModule, CacheService],
    };
  }
}

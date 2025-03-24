import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '../config';
import { ConfigService } from '../config/services/config.service';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ([
        {
          ttl: configService.get<number>('THROTTLE_TTL', 60).getOrDefault(60), // Default 60 seconds
          limit: configService.get<number>('THROTTLE_LIMIT', 100).getOrDefault(100), // Default 100 requests per TTL
        },
      ]),
    }),
  ],
  exports: [ThrottlerModule],
})
export class AppThrottlerModule {}

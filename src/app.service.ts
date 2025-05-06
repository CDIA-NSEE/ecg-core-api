import { Injectable } from '@nestjs/common';
import { ConfigService } from './shared';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    @InjectConnection() private readonly mongoConnection: Connection,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getHealth() {
    const mongoStatus = this.mongoConnection.readyState === 1 ? 'up' : 'down';
    
    // Check Redis connection
    let redisStatus = 'down';
    try {
      await this.cacheManager.set('health-check', 'test', 10);
      const testResult = await this.cacheManager.get('health-check');
      if (testResult === 'test') {
        redisStatus = 'up';
      }
    } catch (error) {
      redisStatus = 'down';
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: this.configService.get('NODE_ENV', 'development').getOrDefault('development'),
      services: {
        api: 'up',
        database: mongoStatus,
        cache: redisStatus,
      },
      version: '1.0.0',
    };
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { Maybe } from '../monads';
import { ConfigType } from '@nestjs/config';
import configuration from './configuration';

@Injectable()
export class ConfigService {
  private readonly config: ConfigType<typeof configuration>;

  constructor(configService: NestConfigService) {
    this.config = configService.get<ConfigType<typeof configuration>>(
      'app',
      { infer: true },
    );
  }

  get<T>(key: string, defaultValue?: T): Maybe<T> {
    return Maybe.of(this.config?.[key] ?? defaultValue);
  }

  getOrThrow<T>(key: string): T {
    const maybeValue = this.get<T>(key);
    if (maybeValue.isNone()) {
      throw new Error(`Configuration key "${key}" is required but not found`);
    }
    return maybeValue.getOrElse(null as T);
  }

  getOrDefault<T>(key: string, defaultValue: T): T {
    return this.get<T>(key).getOrElse(defaultValue);
  }

  // Convenience getters for common configuration values
  get mongoUri(): string {
    return this.getOrThrow<string>('MONGODB_URI');
  }

  get port(): number {
    return this.getOrDefault<number>('PORT', 3000);
  }

  get nodeEnv(): string {
    return this.getOrDefault<string>('NODE_ENV', 'development');
  }

  get redisUrl(): string | undefined {
    return this.get<string>('REDIS_URL').getOrElse(undefined);
  }

  get redisTtl(): number {
    return this.getOrDefault<number>('REDIS_TTL', 3600);
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }
}

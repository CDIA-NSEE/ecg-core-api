import { CacheService } from '../services/cache.service';
import { ConfigService } from '../../config/services/config.service';

export function Cached(keyPrefix: string, ttl?: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheService = this.cacheService as CacheService;
      const configService = this.configService as ConfigService;

      if (!cacheService || !configService) {
        return originalMethod.apply(this, args);
      }

      const key = cacheService.buildKey(
        keyPrefix,
        propertyKey,
        ...args.map(String),
      );

      const cachedValue = await cacheService.get(key);
      if (cachedValue !== undefined) {
        return cachedValue;
      }

      const result = await originalMethod.apply(this, args);
      await cacheService.set(
        key,
        result,
        ttl || configService.redisTtl,
      );

      return result;
    };

    return descriptor;
  };
}

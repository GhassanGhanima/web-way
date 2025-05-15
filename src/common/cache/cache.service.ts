import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    // Fix: Handle null return value
    const value = await this.cacheManager.get<T>(key);
    return value === null ? undefined : value;
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  /**
   * Clear all cache
   */
  async reset(): Promise<void> {
    try {
      // For Redis-based cache manager
      const store = this.cacheManager['store'];
      if (store && typeof store['reset'] === 'function') {
        await store['reset']();
        return;
      }
      
      // Fallback for other cache managers
      if (typeof this.cacheManager['clear'] === 'function') {
        await this.cacheManager['clear']();
        return;
      }
      
      // For cache managers with flush method
      if (typeof this.cacheManager['flush'] === 'function') {
        await this.cacheManager['flush']();
        return;
      }
      
      console.warn('Cache reset not available with current cache provider');
    } catch (error) {
      console.error('Failed to reset cache:', error);
    }
  }
}
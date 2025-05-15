import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../cache/cache.service';
import { Reflector } from '@nestjs/core';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from '../decorators/cache.decorator';

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(
    private cacheService: CacheService,
    private reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    // Skip caching for mutations (POST, PUT, DELETE requests)
    const request = context.switchToHttp().getRequest();
    if (!this.isRequestCacheable(request)) {
      return next.handle();
    }

    // Get cache key from decorator or generate from request
    const cacheKey = this.getCacheKey(context);
    
    // Try to get from cache
    const cachedResponse = await this.cacheService.get(cacheKey);
    if (cachedResponse) {
      return of(cachedResponse);
    }

    // Get TTL from decorator if set
    const ttl = this.reflector.get(CACHE_TTL_METADATA, context.getHandler());

    // If not in cache, execute handler and store response
    return next.handle().pipe(
      tap(response => {
        this.cacheService.set(cacheKey, response, ttl);
      }),
    );
  }

  private isRequestCacheable(request: any): boolean {
    // Only cache GET requests
    const isGetRequest = request.method === 'GET';
    
    // Don't cache requests with query params that affect results
    const hasNoCacheHeader = request.headers['cache-control'] !== 'no-cache';
    
    return isGetRequest && hasNoCacheHeader;
  }

  private getCacheKey(context: ExecutionContext): string {
    // Try to get cache key from decorator
    const customCacheKey = this.reflector.get(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );

    if (customCacheKey) {
      return customCacheKey;
    }

    // Generate key from request
    const request = context.switchToHttp().getRequest();
    return `${request.url}`;
  }
}

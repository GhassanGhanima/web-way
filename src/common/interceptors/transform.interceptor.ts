import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  meta?: Record<string, any>;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    return next.handle().pipe(
      map(data => {
        const responseTime = Date.now() - startTime;

        // Skip transformation for specific endpoints like file downloads
        if (request.url.includes('/cdn/script/load/') || request.url.includes('/loader.js')) {
          return data;
        }

        return {
          data,
          meta: {
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            responseTime: `${responseTime}ms`,
          },
        };
      }),
    );
  }
}

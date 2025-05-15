import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggingService } from './logging.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, ip, headers } = req;
    const userAgent = headers['user-agent'] || '';
    const className = context.getClass().name;
    const handlerName = context.getHandler().name;

    const now = Date.now();
    this.loggingService.log(
      `Incoming Request: ${method} ${url}`,
      'LoggingInterceptor',
      {
        ip,
        userAgent,
        handler: `${className}.${handlerName}`,
      },
    );

    return next
      .handle()
      .pipe(
        tap({
          next: (val) => {
            const responseTime = Date.now() - now;
            this.loggingService.log(
              `Response: ${method} ${url} ${responseTime}ms`,
              'LoggingInterceptor',
              {
                handler: `${className}.${handlerName}`,
              },
            );
          },
          error: (err) => {
            const responseTime = Date.now() - now;
            this.loggingService.error(
              `Request Error: ${method} ${url} ${responseTime}ms`,
              err.stack,
              'LoggingInterceptor',
              {
                error: err.message,
                handler: `${className}.${handlerName}`,
              },
            );
          },
        }),
      );
  }
}

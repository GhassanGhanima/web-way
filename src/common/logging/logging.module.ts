import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogService } from './audit-log.service';
import { LoggingInterceptor } from './logging.interceptor';
import { LoggingService } from './logging.service';

@Module({
  imports: [ConfigModule],
  providers: [
    LoggingService,
    AuditLogService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [LoggingService, AuditLogService],
})
export class LoggingModule {}

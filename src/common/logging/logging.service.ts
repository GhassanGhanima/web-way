import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import { createLogger, format, transports } from 'winston';

@Injectable()
export class LoggingService implements LoggerService {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    const logLevel = this.configService.get<string>('LOG_LEVEL') || 'info';
    
    this.logger = createLogger({
      level: logLevel,
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json(),
      ),
      defaultMeta: { service: 'accessibility-tool' },
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.timestamp(),
            format.printf(
              ({ timestamp, level, message, context, ...meta }) =>
                `${timestamp} ${level} [${context || 'Application'}]: ${message} ${
                  Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
                }`,
            ),
          ),
        }),
        // In a real production environment, we would add file transports
        // or other logging backends like Elasticsearch, Loggly, etc.
      ],
    });
  }

  log(message: string, context?: string, ...meta: any[]): void {
    this.logger.info(message, { context, ...meta });
  }

  error(message: string, trace?: string, context?: string, ...meta: any[]): void {
    this.logger.error(message, { trace, context, ...meta });
  }

  warn(message: string, context?: string, ...meta: any[]): void {
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, ...meta: any[]): void {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, ...meta: any[]): void {
    this.logger.verbose(message, { context, ...meta });
  }
}

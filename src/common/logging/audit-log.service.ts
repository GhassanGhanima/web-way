import { Injectable } from '@nestjs/common';
import { LoggingService } from './logging.service';

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  PAYMENT = 'payment',
  SUBSCRIPTION = 'subscription',
  INTEGRATION = 'integration',
  ADMIN = 'admin',
}

@Injectable()
export class AuditLogService {
  constructor(private loggingService: LoggingService) {}

  log(
    userId: string,
    action: AuditAction,
    resource: string,
    resourceId?: string,
    details?: any,
  ): void {
    this.loggingService.log(
      `Audit: User ${userId} performed ${action} on ${resource}${
        resourceId ? ` ${resourceId}` : ''
      }`,
      'AuditLog',
      {
        userId,
        action,
        resource,
        resourceId,
        details,
        timestamp: new Date(),
      },
    );

    // In a real implementation, this would also write to a database
    // to enable searching and filtering audit logs
  }
}

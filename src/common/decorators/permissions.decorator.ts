import { SetMetadata } from '@nestjs/common';

export enum Permission {
  // User permissions
  USER_READ = 'user:read',
  USER_CREATE = 'user:create',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  
  // Subscription permissions
  SUBSCRIPTION_READ = 'subscription:read',
  SUBSCRIPTION_CREATE = 'subscription:create',
  SUBSCRIPTION_UPDATE = 'subscription:update',
  SUBSCRIPTION_DELETE = 'subscription:delete',
  
  // Plan permissions
  PLAN_READ = 'plan:read',
  PLAN_CREATE = 'plan:create',
  PLAN_UPDATE = 'plan:update',
  PLAN_DELETE = 'plan:delete',
  
  // Integration permissions
  INTEGRATION_READ = 'integration:read',
  INTEGRATION_CREATE = 'integration:create',
  INTEGRATION_UPDATE = 'integration:update',
  INTEGRATION_DELETE = 'integration:delete',
  
  // Analytics permissions
  ANALYTICS_READ = 'analytics:read',
  ANALYTICS_EXPORT = 'analytics:export',
  
  // Role permissions
  ROLE_READ = 'role:read',
  ROLE_CREATE = 'role:create',
  ROLE_UPDATE = 'role:update',
  ROLE_DELETE = 'role:delete',
  ROLE_ASSIGN = 'role:assign',
  
  // Permission permissions
  PERMISSION_READ = 'permission:read',
  PERMISSION_ASSIGN = 'permission:assign',
}

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: Permission[]) => SetMetadata(PERMISSIONS_KEY, permissions);

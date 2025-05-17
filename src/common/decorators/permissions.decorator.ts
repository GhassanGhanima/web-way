import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export enum Permission {
  // Existing permissions
  USER_READ = 'user:read',
  USER_CREATE = 'user:create',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  
  ROLE_READ = 'role:read',
  ROLE_CREATE = 'role:create',
  ROLE_UPDATE = 'role:update',
  ROLE_DELETE = 'role:delete',
  ROLE_ASSIGN = 'role:assign',
  
  PERMISSION_READ = 'permission:read',
  PERMISSION_ASSIGN = 'permission:assign',
  
  PLAN_READ = 'plan:read',
  PLAN_CREATE = 'plan:create',
  PLAN_UPDATE = 'plan:update',
  PLAN_DELETE = 'plan:delete',
  
  SUBSCRIPTION_READ = 'subscription:read',
  SUBSCRIPTION_CREATE = 'subscription:create',
  SUBSCRIPTION_UPDATE = 'subscription:update',
  SUBSCRIPTION_DELETE = 'subscription:delete',
  
  INTEGRATION_READ = 'integration:read',
  INTEGRATION_CREATE = 'integration:create',
  INTEGRATION_UPDATE = 'integration:update',
  INTEGRATION_DELETE = 'integration:delete',
  
  ANALYTICS_READ = 'analytics:read',
  ANALYTICS_EXPORT = 'analytics:export',
  
  // Add FAQ permissions
  FAQ_READ = 'faq:read',
  FAQ_CREATE = 'faq:create',
  FAQ_UPDATE = 'faq:update',
  FAQ_DELETE = 'faq:delete',
}

export const Permissions = (...permissions: Permission[]) => SetMetadata(PERMISSIONS_KEY, permissions);

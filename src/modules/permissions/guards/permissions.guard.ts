import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '@app/common/decorators/permissions.decorator';
import { RolesService } from '../../roles/roles.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rolesService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    // Add detailed logging
    console.log('PermissionsGuard - Required permissions:', requiredPermissions);
    console.log('PermissionsGuard - User:', user ? `ID: ${user.id}, Email: ${user.email}` : 'No user');
    
    if (!user || !user.id) {
      console.log('PermissionsGuard - No user found in request');
      throw new ForbiddenException('Authentication required');
    }

    // Check if permissions are already in the JWT token
    if (user.permissions && Array.isArray(user.permissions)) {
      console.log('PermissionsGuard - User permissions from JWT:', user.permissions);
      const hasRequiredPermission = requiredPermissions.some(permission => 
        user.permissions.includes(permission)
      );
      
      console.log('PermissionsGuard - Has required permission:', hasRequiredPermission);
      return hasRequiredPermission;
    }
    
    // If not in token, fetch from database
    console.log('PermissionsGuard - Fetching user roles from database');
    const userRoles = await this.rolesService.findUserRoles(user.id);
    console.log('PermissionsGuard - Fetched roles:', userRoles.map(r => r.name).join(', '));
    
    // Extract all permissions from user's roles
    const userPermissions = new Set<string>();
    
    userRoles.forEach(role => {
      if (role.permissions) {
        role.permissions.forEach(permission => 
          userPermissions.add(permission.name)
        );
      }
    });
    
    console.log('PermissionsGuard - User permissions from DB:', Array.from(userPermissions));
    
    // Check if user has any of the required permissions
    const hasPermission = requiredPermissions.some(permission => 
      userPermissions.has(permission)
    );
    
    console.log('PermissionsGuard - Has required permission:', hasPermission);
    
    if (!hasPermission) {
      throw new ForbiddenException(
        `User lacks required permission(s): ${requiredPermissions.join(', ')}`
      );
    }
    
    return hasPermission;
  }
}
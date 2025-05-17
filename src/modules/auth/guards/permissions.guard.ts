import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '@app/common/decorators/permissions.decorator';
import { RolesService } from '@app/modules/roles/roles.service';

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
    if (!user || !user.id) {
      return false;
    }

    // Get user with roles and permissions
    const userWithRoles = await this.rolesService.findUserRoles(user.id);

    // Extract all permissions from user's roles
    const userPermissions = new Set<string>();
    
    userWithRoles.forEach(role => 
      role.permissions.forEach(permission => 
        userPermissions.add(permission.name)
      )
    );

    // Check if user has any of the required permissions
    return requiredPermissions.some(permission => userPermissions.has(permission));
  }
}
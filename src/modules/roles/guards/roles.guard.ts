import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from '@app/common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    // Detailed logging for debugging
    console.log('RolesGuard - Required roles:', requiredRoles);
    console.log('RolesGuard - User:', user ? `ID: ${user.id}, Email: ${user.email}` : 'No user');
    console.log('RolesGuard - User roles:', user?.roles || 'None');
    
    if (!user || !user.roles) {
      console.log('RolesGuard - No user or roles found in request');
      throw new ForbiddenException('User has no roles assigned');
    }
    
    const hasRequiredRole = requiredRoles.some(role => 
      user.roles.includes(role) || user.roles.some(userRole => 
        typeof userRole === 'object' ? userRole.name === role : userRole === role
      )
    );
    
    console.log('RolesGuard - Has required role:', hasRequiredRole);
    
    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `User lacks required role(s): ${requiredRoles.join(', ')}`
      );
    }
    
    return hasRequiredRole;
  }
}

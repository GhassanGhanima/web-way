import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PERMISSIONS_KEY } from '@app/common/decorators/permissions.decorator';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
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
    const userWithRoles = await this.rolesRepository
      .createQueryBuilder('role')
      .innerJoin('role.users', 'user', 'user.id = :userId', { userId: user.id })
      .leftJoinAndSelect('role.permissions', 'permission')
      .getMany();

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
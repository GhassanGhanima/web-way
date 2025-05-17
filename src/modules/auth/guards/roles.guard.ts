import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role as RoleEnum, ROLES_KEY } from '@app/common/decorators/roles.decorator';
import { Role } from '../entities/role.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.id) {
      return false;
    }

    // Get user's roles from the database
    const userRoles = await this.rolesRepository
      .createQueryBuilder('role')
      .innerJoin('role.users', 'user', 'user.id = :userId', { userId: user.id })
      .getMany();

    // Extract role names
    const roleNames = userRoles.map(role => role.name);
    
    // Check if user has any of the required roles
    return requiredRoles.some(role => roleNames.includes(role));
  }
}

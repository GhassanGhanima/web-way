import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { CreateRoleDto } from './dtos/create-role.dto';
import { UpdateRoleDto } from './dtos/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find({
      relations: ['permissions'],
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    
    return role;
  }

  async findByName(name: string): Promise<Role | null> {
    return this.rolesRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.rolesRepository.create(createRoleDto);
    return this.rolesRepository.save(role);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    await this.rolesRepository.update(id, updateRoleDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    await this.rolesRepository.remove(role);
  }

  async assignPermissions(id: string, permissionIds: string[]): Promise<Role> {
    const role = await this.findOne(id);
    const permissions = await this.permissionsRepository.findByIds(permissionIds);
    
    role.permissions = permissions;
    return this.rolesRepository.save(role);
  }

  /**
   * Find all roles with their permissions for a specific user
   * @param userId User ID to find roles for
   * @returns Array of role entities with permissions
   */
  async findUserRoles(userId: string): Promise<Role[]> {
    return this.rolesRepository
      .createQueryBuilder('role')
      .innerJoin('role.users', 'user', 'user.id = :userId', { userId })
      .leftJoinAndSelect('role.permissions', 'permission')
      .getMany();
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find({ relations: ['permissions'] });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({ 
      where: { id },
      relations: ['permissions'] 
    });
    
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    
    return role;
  }

  async create(roleData: Partial<Role>): Promise<Role> {
    const role = this.rolesRepository.create(roleData);
    return this.rolesRepository.save(role);
  }

  async update(id: string, roleData: Partial<Role>): Promise<Role> {
    const role = await this.findOne(id);
    
    // Update basic properties
    Object.assign(role, roleData);
    
    return this.rolesRepository.save(role);
  }

  async assignPermissions(roleId: string, permissionIds: string[]): Promise<Role> {
    const role = await this.findOne(roleId);
    const permissions = await this.permissionsRepository.findByIds(permissionIds);
    
    role.permissions = permissions;
    return this.rolesRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    await this.rolesRepository.remove(role);
  }
}
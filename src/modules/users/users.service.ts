import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { Role } from '../roles/entities/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ 
      relations: ['roles', 'roles.permissions'] 
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ 
      where: { id },
      relations: ['roles', 'roles.permissions']
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async findOneWithFullDetails(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ 
      where: { id },
      relations: [
        'roles', 
        'roles.permissions', 
        'integrations', 
        'childUsers'
      ]
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { email },
      relations: ['roles', 'roles.permissions']
    });
  }

  async findUsersByRole(roleName: string): Promise<User[]> {
    return this.usersRepository.createQueryBuilder('user')
      .innerJoinAndSelect('user.roles', 'role', 'role.name = :roleName', { roleName })
      .leftJoinAndSelect('user.roles', 'allRoles')
      .leftJoinAndSelect('allRoles.permissions', 'permissions')
      .getMany();
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Create a new user
    const user = this.usersRepository.create(createUserDto);
    
    // Assign default USER role if no role is specified
    if (!user.roles || user.roles.length === 0) {
      const defaultRole = await this.rolesRepository.findOne({ 
        where: { name: 'user' } 
      });
      
      if (defaultRole) {
        user.roles = [defaultRole];
      } else {
        console.warn('Default user role not found! User will have no roles.');
        user.roles = [];
      }
    }

    // Hash the password before saving
    await user.hashPassword();

    // Save user with role assignment
    return this.usersRepository.save(user);
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findOne(id);
    
    // Update user fields
    Object.keys(updateData).forEach(key => {
      // Don't allow password updates through this method
      if (key !== 'password' && key !== 'roles') {
        user[key] = updateData[key];
      }
    });
    
    return this.usersRepository.save(user);
  }

  async updatePassword(id: string, password: string): Promise<void> {
    const user = await this.findOne(id);
    user.password = password;
    await user.hashPassword();
    await this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async assignRoles(id: string, roleIds: string[]): Promise<User> {
    const user = await this.findOne(id);
    const roles = await this.rolesRepository.findByIds(roleIds);
    
    user.roles = roles;
    return this.usersRepository.save(user);
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }

  /**
   * Find all users created by a specific admin user
   * @param parentAdminId ID of the parent admin user
   * @returns Array of user entities
   */
  async findByParentAdmin(parentAdminId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { parentAdminId },
      relations: ['roles', 'roles.permissions'],
    });
  }
}

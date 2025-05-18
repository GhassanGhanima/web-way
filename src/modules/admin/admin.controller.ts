import { Controller, Get, Post, Body, Param, Query, UseGuards, Version, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/roles.guard';
import { PermissionsGuard } from '../permissions/guards/permissions.guard';
import { Roles, Role } from '@app/common/decorators/roles.decorator';
import { Permissions, Permission } from '@app/common/decorators/permissions.decorator';
import { AdminService } from './admin.service';
import { CreateUserDto } from '../users/dtos/create-user.dto'; 
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Request } from 'express';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly usersService: UsersService
  ) {}

  @Get('dashboard')
  @Version('1')
  @Permissions(Permission.ANALYTICS_READ, Permission.USER_READ, Permission.SUBSCRIPTION_READ)
  @ApiOperation({ summary: 'Get admin dashboard data' })
  @ApiResponse({
    status: 200,
    description: 'Returns admin dashboard data',
  })
  getDashboardData(): Promise<any> {
    return this.adminService.getDashboardData();
  }

  @Get('/users/stats')
  @Version('1')
  @Permissions(Permission.USER_READ)
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns user statistics',
  })
  getUserStats(): Promise<any> {
    return this.adminService.getUserStats();
  }

  @Get('subscriptions/stats')
  @Version('1')
  @Permissions(Permission.SUBSCRIPTION_READ)
  @ApiOperation({ summary: 'Get subscription statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns subscription statistics',
  })
  getSubscriptionStats(): Promise<any> {
    return this.adminService.getSubscriptionStats();
  }

  @Get('revenue')
  @Version('1')
  @Permissions(Permission.SUBSCRIPTION_READ)
  @ApiOperation({ summary: 'Get revenue statistics' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: Date,
    description: 'Start date for the revenue period',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: Date,
    description: 'End date for the revenue period',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns revenue statistics',
  })
  getRevenueStats(
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ): Promise<any> {
    return this.adminService.getRevenueStats(startDate, endDate);
  }

  @Post('system/config')
  @Version('1')
  @Permissions(Permission.ROLE_UPDATE)
  @ApiOperation({ summary: 'Update system configuration' })
  @ApiResponse({
    status: 200,
    description: 'System configuration updated',
  })
  updateSystemConfig(@Body() config: Record<string, any>): Promise<any> {
    return this.adminService.updateSystemConfig(config);
  }

  @Post('users')
  @Version('1')
  @Permissions(Permission.USER_CREATE)
  @ApiOperation({ summary: 'Create a user as an admin' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: User,
  })
  async createUser(@Body() createUserDto: CreateUserDto, @Req() req: Request): Promise<User> {
    const admin = req.user as any;
    
    // Create a new user with the current admin as parent
    const user = await this.usersService.create({
      ...createUserDto,
      parentAdminId: admin.id,
    });
    
    return user;
  }

  @Get('users')
  @Version('1')
  @Permissions(Permission.USER_READ)
  @ApiOperation({ summary: 'Get users created by this admin' })
  @ApiResponse({
    status: 200,
    description: 'Returns users',
    type: [User],
  })
  async getUsers(@Req() req: Request): Promise<User[]> {
    const admin = req.user as any;
    
    // Super admin can see all users, regular admin can only see their created users
    if (admin.roles.includes(Role.SUPER_ADMIN)) {
      return this.usersService.findAll();
    } else {
      return this.usersService.findByParentAdmin(admin.id);
    }
  }
}
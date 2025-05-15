import { Controller, Get, Post, Body, Param, Query, UseGuards, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '@app/common/decorators/roles.decorator';
import { AdminService } from './admin.service';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @Version('1')
  @ApiOperation({ summary: 'Get admin dashboard data' })
  @ApiResponse({
    status: 200,
    description: 'Returns admin dashboard data',
  })
  getDashboardData(): Promise<any> {
    return this.adminService.getDashboardData();
  }

  @Get('users/stats')
  @Version('1')
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
  @ApiOperation({ summary: 'Update system configuration' })
  @ApiResponse({
    status: 200,
    description: 'System configuration updated',
  })
  updateSystemConfig(@Body() config: Record<string, any>): Promise<any> {
    return this.adminService.updateSystemConfig(config);
  }
}

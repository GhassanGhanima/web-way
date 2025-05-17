import { Controller, Get, Post, Body, Query, UseGuards, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/roles.guard';
import { PermissionsGuard } from '../permissions/guards/permissions.guard';
import { Roles, Role } from '@app/common/decorators/roles.decorator';
import { Permissions, Permission } from '@app/common/decorators/permissions.decorator';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('usage')
  @Version('1')
  @Permissions(Permission.ANALYTICS_READ)
  @ApiOperation({ summary: 'Get usage report' })
  @ApiQuery({
    name: 'integrationId',
    required: false,
    type: String,
    description: 'Integration ID to filter report',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: Date,
    description: 'Start date for the report period',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: Date,
    description: 'End date for the report period',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns usage report data',
  })
  getUsageReport(
    @Query('integrationId') integrationId?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ): Promise<any> {
    return this.reportsService.getUsageReport(integrationId, startDate, endDate);
  }

  @Get('subscription')
  @Version('1')
  @Permissions(Permission.SUBSCRIPTION_READ)
  @ApiOperation({ summary: 'Get subscription report' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: Date,
    description: 'Start date for the report period',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: Date,
    description: 'End date for the report period',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns subscription report data',
  })
  getSubscriptionReport(
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ): Promise<any> {
    return this.reportsService.getSubscriptionReport(startDate, endDate);
  }

  @Post('export')
  @Version('1')
  @Permissions(Permission.ANALYTICS_EXPORT)
  @ApiOperation({ summary: 'Export report data' })
  @ApiResponse({
    status: 200,
    description: 'Returns exported report data',
  })
  exportReport(@Body() exportOptions: any): Promise<any> {
    return this.reportsService.exportReport(exportOptions);
  }

  @Post('schedule')
  @Version('1')
  @Roles(Role.ADMIN)
  @Permissions(Permission.ANALYTICS_EXPORT)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Schedule a report' })
  @ApiResponse({
    status: 200,
    description: 'Report scheduled successfully',
  })
  scheduleReport(@Body() scheduleOptions: any): Promise<any> {
    return this.reportsService.scheduleReport(scheduleOptions);
  }
}

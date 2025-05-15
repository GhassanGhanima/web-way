import { Body, Controller, Get, Post, Query, Req, UseGuards, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { AnalyticsService } from './analytics.service';
import { UsageEvent } from './entities/usage-event.entity';
import { RecordEventDto } from './dtos/record-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '@app/common/decorators/roles.decorator';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('event')
  @Version('1')
  @ApiOperation({ summary: 'Record a usage event' })
  @ApiResponse({
    status: 201,
    description: 'The event has been successfully recorded',
    type: UsageEvent,
  })
  recordEvent(
    @Body() recordEventDto: RecordEventDto,
    @Req() request: Request,
  ): Promise<UsageEvent> {
    const ipAddress = request.ip || '127.0.0.1';
    const userAgent = request.headers['user-agent'] || '';
    
    return this.analyticsService.recordEvent(recordEventDto, ipAddress, userAgent);
  }

  @Get('stats')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get analytics statistics' })
  @ApiQuery({
    name: 'integrationId',
    required: true,
    type: String,
    description: 'Integration ID to get stats for',
  })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: Date,
    description: 'Start date for the stats period',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: Date,
    description: 'End date for the stats period',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns analytics statistics',
  })
  getStats(
    @Query('integrationId') integrationId: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ): Promise<any> {
    return this.analyticsService.getEventStats(integrationId, startDate, endDate);
  }

  @Get('dashboard')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get analytics dashboard data' })
  @ApiResponse({
    status: 200,
    description: 'Returns dashboard analytics data',
  })
  getDashboardData(): Promise<any> {
    // For demonstration - would implement comprehensive dashboard stats
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    const endDate = new Date();
    
    // This is a placeholder - would need to be implemented to return system-wide stats
    return Promise.resolve({
      totalEvents: 1000,
      totalActiveIntegrations: 50,
      mostActiveFeatures: [
        { feature: 'contrast', count: 250 },
        { feature: 'screenReader', count: 180 },
        { feature: 'keyboardNavigation', count: 150 },
      ],
    });
  }
}

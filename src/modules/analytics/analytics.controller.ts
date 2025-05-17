import { Body, Controller, Get, Post, Query, Req, UseGuards, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { AnalyticsService } from './analytics.service';
import { UsageEvent } from './entities/usage-event.entity';
import { RecordEventDto } from './dtos/record-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles, Role } from '@app/common/decorators/roles.decorator';
import { Permissions, Permission } from '@app/common/decorators/permissions.decorator';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('events')
  @Version('1')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.ANALYTICS_READ)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get usage events' })
  @ApiQuery({
    name: 'integrationId',
    required: false,
    type: String,
    description: 'Filter events by integration ID',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: Date,
    description: 'Start date for events',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: Date,
    description: 'End date for events',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns usage events',
    type: [UsageEvent],
  })
  getEvents(
    @Query('integrationId') integrationId?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ): Promise<UsageEvent[]> {
    return this.analyticsService.getEvents(integrationId, startDate, endDate);
  }

  @Post('events')
  @Version('1')
  @ApiOperation({ summary: 'Record usage event' })
  @ApiResponse({
    status: 201,
    description: 'Event recorded successfully',
    type: UsageEvent,
  })
  recordEvent(@Body() eventData: RecordEventDto, @Req() request: Request): Promise<UsageEvent> {
    const clientIp = request.ip;
    const userAgent = request.headers['user-agent'];
    return this.analyticsService.recordEvent(eventData, clientIp, userAgent);
  }

  @Get('summary')
  @Version('1')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.ANALYTICS_READ)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get analytics summary' })
  @ApiQuery({
    name: 'integrationId',
    required: false,
    type: String,
    description: 'Filter summary by integration ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns analytics summary',
  })
  getSummary(@Query('integrationId') integrationId?: string): Promise<any> {
    return this.analyticsService.getSummary(integrationId);
  }

  @Post('export')
  @Version('1')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.ANALYTICS_EXPORT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export analytics data' })
  @ApiResponse({
    status: 200,
    description: 'Returns exported analytics data',
  })
  exportData(@Body() exportOptions: any): Promise<any> {
    return this.analyticsService.exportData(exportOptions);
  }
}

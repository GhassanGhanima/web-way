import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@app/modules/roles/guards/roles.guard';
import { PermissionsGuard } from '@app/modules/permissions/guards/permissions.guard';
import { Roles } from '@app/common/decorators/roles.decorator';
import { Permissions } from '@app/common/decorators/permissions.decorator';
import { Role } from '@app/common/decorators/roles.decorator';
import { Permission } from '@app/common/decorators/permissions.decorator';
import { WidgetsService } from './widgets.service';
import { CreateWidgetConfigDto } from './dto/create-widget-config.dto';
import { UpdateWidgetConfigDto } from './dto/update-widget-config.dto';
import { ReorderFeaturesDto } from './dto/reorder-features.dto';
import { WidgetConfig } from './entities/widget-config.entity';

@ApiTags('widgets')
@Controller('widgets')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class WidgetsController {
  constructor(private readonly widgetsService: WidgetsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Permissions(Permission.INTEGRATION_CREATE)
  @ApiOperation({ summary: 'Create a new widget configuration' })
  @ApiResponse({
    status: 201,
    description: 'The widget configuration has been successfully created',
    type: WidgetConfig,
  })
  create(@Req() req, @Body() createWidgetConfigDto: CreateWidgetConfigDto): Promise<WidgetConfig> {
    return this.widgetsService.create(req.user.id, createWidgetConfigDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.USER)
  @Permissions(Permission.INTEGRATION_READ)
  @ApiOperation({ summary: 'Find all widget configurations for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns all widget configurations',
    type: [WidgetConfig],
  })
  findAll(@Req() req): Promise<WidgetConfig[]> {
    return this.widgetsService.findAll(req.user.id);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.USER)
  @Permissions(Permission.INTEGRATION_READ)
  @ApiOperation({ summary: 'Find a widget configuration by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the widget configuration',
    type: WidgetConfig,
  })
  findOne(@Param('id') id: string, @Req() req): Promise<WidgetConfig> {
    return this.widgetsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Permissions(Permission.INTEGRATION_UPDATE)
  @ApiOperation({ summary: 'Update a widget configuration' })
  @ApiResponse({
    status: 200,
    description: 'The widget configuration has been successfully updated',
    type: WidgetConfig,
  })
  update(
    @Param('id') id: string,
    @Req() req,
    @Body() updateWidgetConfigDto: UpdateWidgetConfigDto,
  ): Promise<WidgetConfig> {
    return this.widgetsService.update(id, req.user.id, updateWidgetConfigDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Permissions(Permission.INTEGRATION_DELETE)
  @ApiOperation({ summary: 'Delete a widget configuration' })
  @ApiResponse({
    status: 200,
    description: 'The widget configuration has been successfully deleted',
  })
  remove(@Param('id') id: string, @Req() req): Promise<void> {
    return this.widgetsService.remove(id, req.user.id);
  }

  @Patch(':id/reorder')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Permissions(Permission.INTEGRATION_UPDATE)
  @ApiOperation({ summary: 'Reorder widget features' })
  @ApiResponse({
    status: 200,
    description: 'The widget features have been successfully reordered',
    type: WidgetConfig,
  })
  reorderFeatures(
    @Param('id') id: string,
    @Req() req,
    @Body() reorderDto: ReorderFeaturesDto,
  ): Promise<WidgetConfig> {
    return this.widgetsService.reorderFeatures(id, req.user.id, reorderDto);
  }
}
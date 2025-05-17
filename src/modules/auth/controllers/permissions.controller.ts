import { Controller, Get, UseGuards, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Roles, Role as RoleEnum } from '@app/common/decorators/roles.decorator';
import { Permissions, Permission } from '@app/common/decorators/permissions.decorator';
import { PermissionsService } from '../services/permissions.service';
import { Permission as PermissionEntity } from '../entities/permission.entity';

@ApiTags('permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(RoleEnum.ADMIN)
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @Version('1')
  @Permissions(Permission.PERMISSION_READ)
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({
    status: 200,
    description: 'Returns all permissions',
    type: [PermissionEntity],
  })
  findAll(): Promise<PermissionEntity[]> {
    return this.permissionsService.findAll();
  }
}
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@app/modules/auth/guards/roles.guard';
import { PermissionsGuard } from '@app/modules/auth/guards/permissions.guard';
import { Roles, Role } from '@app/common/decorators/roles.decorator';
import { Permissions, Permission as PermissionEnum } from '@app/common/decorators/permissions.decorator';
import { PermissionsService } from '../permissions.service';
import { Permission } from '../entities/permission.entity';
import {UpdatePermissionDto} from './../dtos/update-permission.dto';
import { CreatePermissionDto } from '../dtos/create-permission.dto';

@ApiTags('permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @Version('1')
  @Permissions(PermissionEnum.PERMISSION_READ)
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({
    status: 200,
    description: 'Returns all permissions',
    type: [Permission],
  })
  findAll(): Promise<Permission[]> {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @Version('1')
  @Permissions(PermissionEnum.PERMISSION_READ)
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a permission by ID',
    type: Permission,
  })
  @ApiResponse({
    status: 404,
    description: 'Permission not found',
  })
  findOne(@Param('id') id: string): Promise<Permission> {
    return this.permissionsService.findOne(id);
  }

  @Post()
  @Version('1')
  @Permissions(PermissionEnum.PERMISSION_ASSIGN)
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({
    status: 201,
    description: 'The permission has been successfully created',
    type: Permission,
  })
  create(@Body() createPermissionDto: CreatePermissionDto): Promise<Permission> {
    return this.permissionsService.create(createPermissionDto);
  }

  @Put(':id')
  @Version('1')
  @Permissions(PermissionEnum.PERMISSION_ASSIGN)
  @ApiOperation({ summary: 'Update a permission' })
  @ApiResponse({
    status: 200,
    description: 'The permission has been successfully updated',
    type: Permission,
  })
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @Version('1')
  @Permissions(PermissionEnum.PERMISSION_ASSIGN)
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiResponse({
    status: 200,
    description: 'The permission has been successfully deleted',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.permissionsService.remove(id);
  }
}
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Roles, Role as RoleEnum } from '@app/common/decorators/roles.decorator';
import { Permissions, Permission } from '@app/common/decorators/permissions.decorator';
import { RolesService } from '../services/roles.service';
import { Role } from '../entities/role.entity';

@ApiTags('roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(RoleEnum.ADMIN)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Version('1')
  @Permissions(Permission.ROLE_READ)
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({
    status: 200,
    description: 'Returns all roles',
    type: [Role],
  })
  findAll(): Promise<Role[]> {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Version('1')
  @Permissions(Permission.ROLE_READ)
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a role by ID',
    type: Role,
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  findOne(@Param('id') id: string): Promise<Role> {
    return this.rolesService.findOne(id);
  }

  @Post()
  @Version('1')
  @Permissions(Permission.ROLE_CREATE)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({
    status: 201,
    description: 'The role has been successfully created',
    type: Role,
  })
  create(@Body() roleData: Partial<Role>): Promise<Role> {
    return this.rolesService.create(roleData);
  }

  @Put(':id')
  @Version('1')
  @Permissions(Permission.ROLE_UPDATE)
  @ApiOperation({ summary: 'Update a role' })
  @ApiResponse({
    status: 200,
    description: 'The role has been successfully updated',
    type: Role,
  })
  update(@Param('id') id: string, @Body() roleData: Partial<Role>): Promise<Role> {
    return this.rolesService.update(id, roleData);
  }

  @Post(':id/permissions')
  @Version('1')
  @Permissions(Permission.ROLE_ASSIGN, Permission.PERMISSION_ASSIGN)
  @ApiOperation({ summary: 'Assign permissions to a role' })
  @ApiResponse({
    status: 200,
    description: 'Permissions assigned successfully',
    type: Role,
  })
  assignPermissions(
    @Param('id') id: string, 
    @Body() data: { permissionIds: string[] }
  ): Promise<Role> {
    return this.rolesService.assignPermissions(id, data.permissionIds);
  }

  @Delete(':id')
  @Version('1')
  @Permissions(Permission.ROLE_DELETE)
  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({
    status: 200,
    description: 'The role has been successfully deleted',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.rolesService.remove(id);
  }
}
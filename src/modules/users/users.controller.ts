import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Version, Req, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/roles.guard';
import { PermissionsGuard } from '../permissions/guards/permissions.guard';
import { Roles, Role } from '@app/common/decorators/roles.decorator';
import { Permissions, Permission } from '@app/common/decorators/permissions.decorator';
import { Request } from 'express';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor) // Add this line to automatically apply serialization
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.USER_READ)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Returns all users',
    type: [User],
  })
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Version('1')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.USER_READ)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a user by ID',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Post()
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.USER_CREATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created',
    type: User,
  })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @Version('1')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.USER_UPDATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated',
    type: User,
  })
  update(@Param('id') id: string, @Body() updateData: Partial<User>): Promise<User> {
    return this.usersService.update(id, updateData);
  }

  @Delete(':id')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.USER_DELETE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  @Post(':id/roles')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.USER_UPDATE, Permission.ROLE_ASSIGN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign roles to a user' })
  @ApiResponse({
    status: 200,
    description: 'Roles assigned successfully',
    type: User,
  })
  assignRoles(
    @Param('id') id: string,
    @Body() data: { roleIds: string[] }
  ): Promise<User> {
    return this.usersService.assignRoles(id, data.roleIds);
  }

  @Get('me')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detailed information about the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Returns the authenticated user details',
    type: User,
  })
  getUserDetails(@Req() request: Request): Promise<User> {
    const userId = (request.user as any).id;
    return this.usersService.findOne(userId);
  }

  @Get(':id/details')
  @Version('1')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.USER_READ)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get complete user details including all relations' })
  @ApiResponse({
    status: 200,
    description: 'Returns complete user details with all related data',
    type: User,
  })
  getUserFullDetails(@Param('id') id: string): Promise<User> {
    return this.usersService.findOneWithFullDetails(id);
  }
}

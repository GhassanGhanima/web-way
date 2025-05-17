import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { Subscription } from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dtos/create-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles, Role } from '@app/common/decorators/roles.decorator';
import { Permissions, Permission } from '@app/common/decorators/permissions.decorator';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.SUBSCRIPTION_READ)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all subscriptions' })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'Filter subscriptions by user ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all subscriptions',
    type: [Subscription],
  })
  findAll(@Query('userId') userId?: string): Promise<Subscription[]> {
    return this.subscriptionsService.findAll(userId);
  }

  @Get(':id')
  @Version('1')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.SUBSCRIPTION_READ)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a subscription by ID',
    type: Subscription,
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found',
  })
  findOne(@Param('id') id: string): Promise<Subscription> {
    return this.subscriptionsService.findOne(id);
  }

  @Post()
  @Version('1')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.SUBSCRIPTION_CREATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({
    status: 201,
    description: 'The subscription has been successfully created',
    type: Subscription,
  })
  create(@Body() createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Post(':id/cancel')
  @Version('1')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.SUBSCRIPTION_UPDATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a subscription' })
  @ApiResponse({
    status: 200,
    description: 'The subscription has been successfully canceled',
    type: Subscription,
  })
  cancel(@Param('id') id: string): Promise<Subscription> {
    return this.subscriptionsService.cancel(id);
  }

  @Delete(':id')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.SUBSCRIPTION_DELETE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a subscription' })
  @ApiResponse({
    status: 200,
    description: 'The subscription has been successfully deleted',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.subscriptionsService.remove(id);
  }
}

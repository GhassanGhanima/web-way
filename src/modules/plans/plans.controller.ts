import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { Plan } from './entities/plan.entity';
import { CreatePlanDto } from './dtos/create-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '@app/common/decorators/roles.decorator';

@ApiTags('plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Get all active subscription plans' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive plans in the result',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all subscription plans',
    type: [Plan],
  })
  findAll(@Query('includeInactive') includeInactive = false): Promise<Plan[]> {
    return this.plansService.findAll(includeInactive === true);
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({ summary: 'Get plan by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a plan by ID',
    type: Plan,
  })
  @ApiResponse({
    status: 404,
    description: 'Plan not found',
  })
  findOne(@Param('id') id: string): Promise<Plan> {
    return this.plansService.findOne(id);
  }

  @Post()
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new subscription plan' })
  @ApiResponse({
    status: 201,
    description: 'The plan has been successfully created',
    type: Plan,
  })
  create(@Body() createPlanDto: CreatePlanDto): Promise<Plan> {
    return this.plansService.create(createPlanDto);
  }

  @Put(':id')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a subscription plan' })
  @ApiResponse({
    status: 200,
    description: 'The plan has been successfully updated',
    type: Plan,
  })
  update(@Param('id') id: string, @Body() updateData: Partial<Plan>): Promise<Plan> {
    return this.plansService.update(id, updateData);
  }

  @Delete(':id')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a subscription plan' })
  @ApiResponse({
    status: 200,
    description: 'The plan has been successfully deleted',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.plansService.remove(id);
  }

  @Get('compare')
  @Version('1')
  @ApiOperation({ summary: 'Compare multiple plans' })
  @ApiQuery({
    name: 'planIds',
    required: false,
    isArray: true,
    description: 'IDs of plans to compare',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns plans for comparison',
    type: [Plan],
  })
  comparePlans(@Query('planIds') planIds: string[] = []): Promise<Plan[]> {
    return this.plansService.comparePlans(planIds);
  }
}

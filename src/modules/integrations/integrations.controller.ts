import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
import { Integration } from './entities/integration.entity';
import { CreateIntegrationDto } from './dtos/create-integration.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '@app/common/decorators/roles.decorator';

@ApiTags('integrations')
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all integrations' })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'Filter integrations by user ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all integrations',
    type: [Integration],
  })
  findAll(@Query('userId') userId?: string): Promise<Integration[]> {
    return this.integrationsService.findAll(userId);
  }

  @Get(':id')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get integration by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns an integration by ID',
    type: Integration,
  })
  @ApiResponse({
    status: 404,
    description: 'Integration not found',
  })
  findOne(@Param('id') id: string): Promise<Integration> {
    return this.integrationsService.findOne(id);
  }

  @Post()
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new integration' })
  @ApiResponse({
    status: 201,
    description: 'The integration has been successfully created',
    type: Integration,
  })
  create(@Body() createIntegrationDto: CreateIntegrationDto): Promise<Integration> {
    return this.integrationsService.create(createIntegrationDto);
  }

  @Put(':id')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an integration' })
  @ApiResponse({
    status: 200,
    description: 'The integration has been successfully updated',
    type: Integration,
  })
  update(@Param('id') id: string, @Body() updateData: Partial<Integration>): Promise<Integration> {
    return this.integrationsService.update(id, updateData);
  }

  @Delete(':id')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an integration' })
  @ApiResponse({
    status: 200,
    description: 'The integration has been successfully deleted',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.integrationsService.remove(id);
  }

  @Post(':id/verify')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify domain ownership' })
  @ApiResponse({
    status: 200,
    description: 'Domain verification completed',
    type: Integration,
  })
  verifyDomain(
    @Param('id') id: string,
    @Body() body: { verificationCode: string },
  ): Promise<Integration> {
    return this.integrationsService.verifyDomain(id, body.verificationCode);
  }
}

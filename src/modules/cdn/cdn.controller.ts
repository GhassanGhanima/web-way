import { Controller, Get, Post, Body, Param, Query, Headers, UseGuards, Version, Res, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiHeader } from '@nestjs/swagger';
import { Response } from 'express';
import { CdnService } from './cdn.service';
import { ScriptAsset, ScriptType } from './entities/script-asset.entity';
import { CreateScriptAssetDto } from './dtos/create-script-asset.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/roles.guard';
import { PermissionsGuard } from '../permissions/guards/permissions.guard';
import { Roles, Role } from '@app/common/decorators/roles.decorator';
import { Permissions, Permission } from '@app/common/decorators/permissions.decorator';
import { CdnSecurityGuard } from './guards/cdn-security.guard';
import { WidgetsService } from '../widgets/widgets.service';

@ApiTags('cdn')
@Controller('cdn')
export class CdnController {
  constructor(
    private readonly cdnService: CdnService,
    private readonly widgetsService: WidgetsService,
  ) {}

  @Get('scripts')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.INTEGRATION_READ)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all script assets' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ScriptType,
    description: 'Filter by script type',
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Filter to active scripts only',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all script assets',
    type: [ScriptAsset],
  })
  findAllScripts(
    @Query('type') type?: ScriptType,
    @Query('activeOnly') activeOnly = true,
  ): Promise<ScriptAsset[]> {
    return this.cdnService.findAllScripts(type, activeOnly);
  }

  @Post('scripts')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.INTEGRATION_CREATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new script asset' })
  @ApiResponse({
    status: 201,
    description: 'The script asset has been successfully created',
    type: ScriptAsset,
  })
  createScript(@Body() createScriptDto: CreateScriptAssetDto): Promise<ScriptAsset> {
    return this.cdnService.createScript(createScriptDto);
  }

  @Get('loader.js')
  @Version('1')
  @ApiOperation({ summary: 'Get widget loader script' })
  @ApiResponse({
    status: 200,
    description: 'Returns the widget loader JavaScript',
  })
  async getLoaderScript(
    @Query('apiKey') apiKey: string,
    @Query('domain') domain: string,
    @Res() res: Response,
  ): Promise<void> {
    if (!apiKey) {
      throw new BadRequestException('API key is required');
    }
    
    // Get domain from referer if not provided
    if (!domain && res.req.headers.referer) {
      try {
        const url = new URL(res.req.headers.referer);
        domain = url.hostname;
      } catch (error) {
        // If we can't parse the referrer, that's fine
      }
    }
    
    // Validate API key and domain
    const validation = await this.widgetsService.validateDomainAndSubscription(apiKey, domain);
    
    if (!validation.isValid) {
      // Return a script that displays an error message
      const errorScript = this.cdnService.generateErrorScript(validation.message || 'Invalid API key');
      res.type('application/javascript');
      res.send(errorScript);
      return;
    }
    
    // Return the loader script
    const script = await this.cdnService.getWidgetLoaderScript(apiKey, validation.widgetConfig);
    res.type('application/javascript');
    res.send(script);
  }

  @Get('widget.js')
  @Version('1')
  @ApiOperation({ summary: 'Get widget script' })
  @ApiResponse({
    status: 200,
    description: 'Returns the widget JavaScript',
  })
  async getWidgetScript(
    @Query('apiKey') apiKey: string,
    @Res() res: Response,
  ): Promise<void> {
    if (!apiKey) {
      throw new BadRequestException('API key is required');
    }
    
    // Get domain from referer if available
    let domain = '';
    if (res.req.headers.referer) {
      try {
        const url = new URL(res.req.headers.referer);
        domain = url.hostname;
      } catch (error) {
        // If we can't parse the referrer, that's fine
      }
    }
    
    // Validate API key and domain
    const validation = await this.widgetsService.validateDomainAndSubscription(apiKey, domain);
    
    if (!validation.isValid) {
      // Return a script that displays an error message
      const errorScript = this.cdnService.generateErrorScript(validation.message || 'Invalid API key');
      res.type('application/javascript');
      res.send(errorScript);
      return; // Just use return without a value
    }
    
    // Return the widget script
    const script = await this.cdnService.getWidgetScript(validation.widgetConfig);
    res.type('application/javascript');
    res.send(script);
  }

  @Get('scripts/:id')
  @Version('1')
  @UseGuards(CdnSecurityGuard)
  @ApiOperation({ summary: 'Get script content' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Script asset ID',
  })
  @ApiQuery({
    name: 'apiKey',
    required: true,
    type: String,
    description: 'Integration API key',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the script content',
  })
  async loadScript(
    @Param('id') id: string,
    @Query('apiKey') apiKey: string,
    @Res() res: Response,
  ): Promise<void> {
    const { content, contentType, integrity } = await this.cdnService.getScriptContent(id, apiKey);
    
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Integrity', integrity);
    
    res.status(HttpStatus.OK).send(content);
  }
}

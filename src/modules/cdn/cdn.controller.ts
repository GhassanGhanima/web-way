import { Controller, Get, Post, Body, Param, Query, Headers, UseGuards, Version, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiHeader } from '@nestjs/swagger';
import { Response } from 'express';
import { CdnService } from './cdn.service';
import { ScriptAsset, ScriptType } from './entities/script-asset.entity';
import { CreateScriptAssetDto } from './dtos/create-script-asset.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '@app/common/decorators/roles.decorator';
import { CdnSecurityGuard } from './guards/cdn-security.guard';

@ApiTags('cdn')
@Controller('cdn')
export class CdnController {
  constructor(private readonly cdnService: CdnService) {}

  @Get('scripts')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
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
    return this.cdnService.findAllScripts(type, String(activeOnly) === 'true');
  }

  @Post('scripts')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
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

  @Get('script/load/:id')
  @Version('1')
  @UseGuards(CdnSecurityGuard)
  @ApiOperation({ summary: 'Load a script by ID' })
  @ApiParam({
    name: 'id',
    description: 'Script asset ID',
  })
  @ApiQuery({
    name: 'apiKey',
    required: true,
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
    
    // Set proper cache headers
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Integrity', integrity);
    
    res.status(HttpStatus.OK).send(content);
  }

  @Get('loader.js')
  @Version('1')
  @ApiOperation({ summary: 'Get the script loader for a domain' })
  @ApiQuery({
    name: 'apiKey',
    required: true,
    description: 'Integration API key',
  })
  @ApiHeader({
    name: 'Origin',
    required: true,
    description: 'Domain origin requesting the loader',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the loader script',
  })
  async getLoader(
    @Query('apiKey') apiKey: string,
    @Headers('origin') origin: string,
    @Res() res: Response,
  ): Promise<void> {
    // Extract domain from origin
    const domain = origin.replace(/^https?:\/\//, '').split(':')[0];
    
    const loaderScript = await this.cdnService.generateScriptLoader(apiKey, domain);
    
    // Set proper headers
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    res.status(HttpStatus.OK).send(loaderScript);
  }
}

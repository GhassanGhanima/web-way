import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { ScriptAsset, ScriptType } from './entities/script-asset.entity';
import { CreateScriptAssetDto } from './dtos/create-script-asset.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { IntegrationsService } from '../integrations/integrations.service';

@Injectable()
export class CdnService {
  private readonly scriptStoragePath: string;

  constructor(
    @InjectRepository(ScriptAsset)
    private scriptAssetsRepository: Repository<ScriptAsset>,
    private configService: ConfigService,
    private integrationsService: IntegrationsService,
    private subscriptionsService: SubscriptionsService,
  ) {
    this.scriptStoragePath = this.configService.get<string>('cdn.storagePath') || 'assets/scripts';
  }

  async findAllScripts(type?: ScriptType, activeOnly = true): Promise<ScriptAsset[]> {
    const query: any = {};
    
    if (type) {
      query.type = type;
    }
    
    if (activeOnly) {
      query.isActive = true;
    }
    
    return this.scriptAssetsRepository.find({ where: query });
  }

  async findScript(id: string): Promise<ScriptAsset> {
    const script = await this.scriptAssetsRepository.findOne({ where: { id } });
    if (!script) {
      throw new NotFoundException(`Script asset with ID ${id} not found`);
    }
    return script;
  }

  async findScriptByNameAndVersion(name: string, version: string): Promise<ScriptAsset> {
    const script = await this.scriptAssetsRepository.findOne({ 
      where: { name, version } 
    });
    
    if (!script) {
      throw new NotFoundException(`Script asset ${name}@${version} not found`);
    }
    
    return script;
  }

  async findLatestScriptByName(name: string): Promise<ScriptAsset> {
    const script = await this.scriptAssetsRepository.findOne({ 
      where: { name, isLatest: true } 
    });
    
    if (!script) {
      throw new NotFoundException(`Latest script for ${name} not found`);
    }
    
    return script;
  }

  async createScript(createScriptDto: CreateScriptAssetDto): Promise<ScriptAsset> {
    if (createScriptDto.isLatest) {
      // If this is set as latest, unset any existing latest version
      await this.scriptAssetsRepository.update(
        { name: createScriptDto.name, isLatest: true },
        { isLatest: false }
      );
    }
    
    const script = this.scriptAssetsRepository.create(createScriptDto);
    return this.scriptAssetsRepository.save(script);
  }

  async updateScript(id: string, updateData: Partial<ScriptAsset>): Promise<ScriptAsset> {
    const script = await this.findScript(id);
    
    if (updateData.isLatest) {
      // If setting as latest, unset any existing latest version
      await this.scriptAssetsRepository.update(
        { name: script.name, isLatest: true },
        { isLatest: false }
      );
    }
    
    await this.scriptAssetsRepository.update(id, updateData);
    return this.findScript(id);
  }

  async getScriptContent(scriptId: string, apiKey: string): Promise<{ content: string; contentType: string; integrity: string }> {
    // Validate API key and check authorization
    const integration = await this.integrationsService.findByApiKey(apiKey);
    if (!integration) {
      throw new UnauthorizedException('Invalid API key');
    }
    
    // Get the script asset
    const script = await this.findScript(scriptId);
    
    // Check if user has required subscription plan for this script
    if (script.requiredPlan) {
      const hasAccess = await this.checkPlanAccess(integration.userId, script.requiredPlan);
      if (!hasAccess) {
        throw new UnauthorizedException('Your subscription plan does not include access to this feature');
      }
    }
    
    // Update integration last usage timestamp
    await this.integrationsService.updateLastUsed(integration.id);
    
    // Read file content
    try {
      const filePath = path.join(this.scriptStoragePath, script.filePath);
      const content = await fs.readFile(filePath, 'utf8');
      
      return {
        content,
        contentType: 'application/javascript',
        integrity: script.integrityHash,
      };
    } catch (error) {
      throw new NotFoundException(`Script file not found: ${error.message}`);
    }
  }

  async generateScriptLoader(apiKey: string, domain: string): Promise<string> {
    // Validate API key and domain
    const integration = await this.integrationsService.validateDomain(apiKey, domain);
    
    // Generate a time-limited token
    const token = this.generateToken(integration.id);
    
    // Create loader script that will securely load the accessibility tools
    const loaderScript = `
    // Accessibility Tool Loader
    (function() {
      var token = "${token}";
      var apiKey = "${apiKey}";
      var cdnBase = "${this.configService.get('cdn.baseUrl')}";
      
      // Load the core script
      var script = document.createElement('script');
      script.async = true;
      script.src = cdnBase + '/v1/script/load/core?token=' + token + '&apiKey=' + apiKey;
      script.integrity = "${integration.settings.integrityHash || ''}";
      script.crossOrigin = "anonymous";
      
      // Add error handling
      script.onerror = function() {
        console.error('Failed to load accessibility script');
      };
      
      document.head.appendChild(script);
    })();
    `;
    
    return loaderScript;
  }

  /**
   * Alias for generateScriptLoader for compatibility
   */
  async generateLoader(apiKey: string, origin: string): Promise<string> {
    return this.generateScriptLoader(apiKey, origin);
  }

  private async checkPlanAccess(userId: string, requiredPlan: string): Promise<boolean> {
    // Implementation would check if the user's subscription includes this plan level
    const subscriptions = await this.subscriptionsService.findAll(userId);
    
    // Simple check - would need to be replaced with actual plan hierarchy logic
    return subscriptions.some(sub => 
      sub.status === 'active' && 
      sub.planId.includes(requiredPlan) // Simplified example
    );
  }

  private generateToken(integrationId: string): string {
    // Create a token that expires in 1 hour
    const payload = {
      integrationId,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    };
    
    // Sign the payload with our secret key
    const secretKey = this.configService.get<string>('cdn.tokenSecret');
    if (!secretKey) {
      throw new Error('Token secret is not defined in the configuration');
    }
    return crypto
      .createHmac('sha256', secretKey)
      .update(JSON.stringify(payload))
      .digest('hex') + '.' + Buffer.from(JSON.stringify(payload)).toString('base64');
  }
}

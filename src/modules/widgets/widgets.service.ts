import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { WidgetConfig, WidgetPosition, WidgetFeatureType } from './entities/widget-config.entity';
import { IntegrationsService } from '../integrations/integrations.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CreateWidgetConfigDto } from './dto/create-widget-config.dto';
import { UpdateWidgetConfigDto } from './dto/update-widget-config.dto';
import { ReorderFeaturesDto } from './dto/reorder-features.dto';

@Injectable()
export class WidgetsService {
  constructor(
    @InjectRepository(WidgetConfig)
    private widgetConfigRepository: Repository<WidgetConfig>,
    private integrationsService: IntegrationsService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  /**
   * Find all widget configurations for a user
   * @param userId User ID
   * @returns Array of widget configurations
   */
  async findAll(userId: string): Promise<WidgetConfig[]> {
    // Get all widget configs for integrations owned by this user
    const integrations = await this.integrationsService.findByUserId(userId);
    const integrationIds = integrations.map(i => i.id);
    
    if (integrationIds.length === 0) {
      return [];
    }
    
    return this.widgetConfigRepository.find({
      where: {
        integrationId: In(integrationIds)
      }
    });
  }

  /**
   * Find a widget configuration by ID
   * @param id Widget config ID
   * @param userId User ID for authorization check
   * @returns Widget configuration
   */
  async findOne(id: string, userId: string): Promise<WidgetConfig> {
    const widgetConfig = await this.widgetConfigRepository.findOne({
      where: { id },
      relations: ['integration', 'integration.user'],
    });
    
    if (!widgetConfig) {
      throw new NotFoundException(`Widget configuration with ID ${id} not found`);
    }
    
    // Check if user has access to this widget config
    if (widgetConfig.integration.user.id !== userId && 
        widgetConfig.integration.user.parentAdminId !== userId) {
      throw new ForbiddenException('You do not have access to this widget configuration');
    }
    
    return widgetConfig;
  }

  /**
   * Find a widget configuration by integration ID
   * @param integrationId Integration ID
   * @returns Widget configuration or null if not found
   */
  async findByIntegrationId(integrationId: string): Promise<WidgetConfig | null> {
    return this.widgetConfigRepository.findOne({
      where: { integrationId },
    });
  }

  /**
   * Create a new widget configuration
   * @param userId User ID for authorization
   * @param createWidgetConfigDto Widget configuration data
   * @returns Created widget configuration
   */
  async create(userId: string, createWidgetConfigDto: CreateWidgetConfigDto): Promise<WidgetConfig> {
    // Verify integration exists and user has access
    const integration = await this.integrationsService.findOne(createWidgetConfigDto.integrationId);
    
    if (integration.userId !== userId && integration.user.parentAdminId !== userId) {
      throw new ForbiddenException('You do not have access to this integration');
    }
    
    // Verify subscription is active
    const isActive = await this.subscriptionsService.isSubscriptionActive(integration.userId);
    
    if (!isActive) {
      throw new BadRequestException('Subscription is not active. Please renew your subscription.');
    }
    
    // Check if a widget config already exists for this integration
    const existingConfig = await this.findByIntegrationId(createWidgetConfigDto.integrationId);
    
    if (existingConfig) {
      throw new BadRequestException('A widget configuration already exists for this integration');
    }
    
    // Create widget config
    const widgetConfig = this.widgetConfigRepository.create(createWidgetConfigDto);
    return this.widgetConfigRepository.save(widgetConfig);
  }

  /**
   * Update a widget configuration
   * @param id Widget config ID
   * @param userId User ID for authorization
   * @param updateWidgetConfigDto Updated widget data
   * @returns Updated widget configuration
   */
  async update(id: string, userId: string, updateWidgetConfigDto: UpdateWidgetConfigDto): Promise<WidgetConfig> {
    const widgetConfig = await this.findOne(id, userId);
    
    // Verify subscription is active
    const isActive = await this.subscriptionsService.isSubscriptionActive(widgetConfig.integration.userId);
    
    if (!isActive) {
      throw new BadRequestException('Subscription is not active. Please renew your subscription.');
    }
    
    // Update fields
    Object.assign(widgetConfig, updateWidgetConfigDto);
    
    return this.widgetConfigRepository.save(widgetConfig);
  }

  /**
   * Remove a widget configuration
   * @param id Widget config ID
   * @param userId User ID for authorization
   */
  async remove(id: string, userId: string): Promise<void> {
    const widgetConfig = await this.findOne(id, userId);
    await this.widgetConfigRepository.remove(widgetConfig);
  }

  /**
   * Reorder widget features
   * @param id Widget config ID
   * @param userId User ID for authorization
   * @param reorderDto Feature order data
   * @returns Updated widget configuration
   */
  async reorderFeatures(id: string, userId: string, reorderDto: ReorderFeaturesDto): Promise<WidgetConfig> {
    const widgetConfig = await this.findOne(id, userId);
    
    // Verify all features exist
    const availableFeatures = Object.values(WidgetFeatureType);
    for (const feature of reorderDto.featureOrder) {
      if (!availableFeatures.includes(feature as WidgetFeatureType)) {
        throw new BadRequestException(`Invalid feature: ${feature}`);
      }
    }
    
    // Update feature order
    widgetConfig.featureOrder = reorderDto.featureOrder;
    
    return this.widgetConfigRepository.save(widgetConfig);
  }

  /**
   * Validate domain and subscription status
   * @param apiKey API key from the request
   * @param domain Domain from the request
   * @returns Validation result with widget config if valid
   */
  async validateDomainAndSubscription(apiKey: string, domain: string): Promise<{
    isValid: boolean;
    widgetConfig?: WidgetConfig;
    message?: string;
  }> {
    try {
      // Find integration by API key
      const integration = await this.integrationsService.findByApiKey(apiKey);
      
      if (!integration) {
        return { isValid: false, message: 'Invalid API key' };
      }
      
      // Check if domain is authorized
      if (!this.isDomainAuthorized(integration, domain)) {
        return { isValid: false, message: 'Domain not authorized for this API key' };
      }
      
      // Verify subscription is active
      const isActive = await this.subscriptionsService.isSubscriptionActive(integration.userId);
      
      if (!isActive) {
        return { isValid: false, message: 'Subscription is not active. Please renew your subscription.' };
      }
      
      // Get widget config
      const widgetConfig = await this.findByIntegrationId(integration.id);
      
      if (!widgetConfig) {
        // Create default widget config if none exists
        const defaultConfig = this.widgetConfigRepository.create({
          integrationId: integration.id,
          position: WidgetPosition.BOTTOM_RIGHT,
          theme: 'auto',
          features: {
            contrast: true,
            fontSize: true,
            readingGuide: true,
            textToSpeech: true,
            keyboardNavigation: true,
          },
        });
        
        return { 
          isValid: true, 
          widgetConfig: await this.widgetConfigRepository.save(defaultConfig) 
        };
      }
      
      return { isValid: true, widgetConfig };
    } catch (error) {
      console.error('Error validating domain and subscription:', error);
      return { isValid: false, message: 'Internal server error' };
    }
  }

  /**
   * Check if a domain is authorized for an integration
   * @param integration Integration entity
   * @param domain Domain to check
   * @returns Boolean indicating if domain is authorized
   */
  private isDomainAuthorized(integration: any, domain: string): boolean {
    // Check if domain matches integration domain
    if (integration.domain === domain) {
      return true;
    }
    
    // Check if domain is in authorized URLs
    if (integration.authorizedUrls && Array.isArray(integration.authorizedUrls)) {
      for (const url of integration.authorizedUrls) {
        // Perform domain comparison (handle subdomains etc.)
        if (this.domainsMatch(url, domain)) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Compare domains for matching
   * @param authorizedUrl Authorized URL pattern
   * @param requestDomain Domain from request
   * @returns Boolean indicating if domains match
   */
  private domainsMatch(authorizedUrl: string, requestDomain: string): boolean {
    try {
      // Extract domain from URL
      const authorizedDomain = new URL(authorizedUrl.startsWith('http') ? authorizedUrl : `https://${authorizedUrl}`).hostname;
      
      // Exact match
      if (authorizedDomain === requestDomain) {
        return true;
      }
      
      // Wildcard subdomain match (*.example.com)
      if (authorizedDomain.startsWith('*.')) {
        const baseDomain = authorizedDomain.substring(2);
        return requestDomain.endsWith(baseDomain) && requestDomain.includes('.');
      }
      
      return false;
    } catch (error) {
      console.error('Error matching domains:', error);
      return false;
    }
  }
}
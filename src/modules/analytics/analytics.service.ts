import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { UsageEvent, EventType } from './entities/usage-event.entity';
import { RecordEventDto } from './dtos/record-event.dto';
import { IntegrationsService } from '../integrations/integrations.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(UsageEvent)
    private usageEventsRepository: Repository<UsageEvent>,
    private integrationsService: IntegrationsService,
    private configService: ConfigService,
  ) {}

  /**
   * Get events with optional filters
   */
  async getEvents(
    integrationId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<UsageEvent[]> {
    const query = this.usageEventsRepository.createQueryBuilder('event');
    
    if (integrationId) {
      query.where('event.integrationId = :integrationId', { integrationId });
    }
    
    if (startDate && endDate) {
      query.andWhere('event.timestamp BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.andWhere('event.timestamp >= :startDate', { startDate });
    } else if (endDate) {
      query.andWhere('event.timestamp <= :endDate', { endDate });
    }
    
    return query.orderBy('event.timestamp', 'DESC').getMany();
  }

  /**
   * Record a new usage event
   */
  async recordEvent(
    recordEventDto: RecordEventDto,
    ipAddress: string | undefined,
    userAgent: string | undefined,
  ): Promise<UsageEvent> {
    // Get integration by API key
    const integration = await this.integrationsService.findByApiKey(recordEventDto.apiKey);
    
    if (!integration) {
      throw new Error('Invalid API key');
    }
    
    // Anonymize IP address for privacy if it exists
    const anonymizedIp = ipAddress ? this.anonymizeIp(ipAddress) : null;
    
    // Create and save the event - Fix for TypeScript error
    const event:any = new UsageEvent();
    event.integrationId = integration.id;
    event.eventType = recordEventDto.eventType;
    event.timestamp = new Date();
    event.pageUrl = recordEventDto.pageUrl;
    event.ipAddress = anonymizedIp;
    event.userAgent = userAgent || null;
    event.eventData = recordEventDto.eventData || {};
    
    // Update last used timestamp for the integration
    await this.integrationsService.updateLastUsed(integration.id);
    
    return this.usageEventsRepository.save(event);
  }

  /**
   * Get analytics summary
   */
  async getSummary(integrationId?: string): Promise<any> {
    // Default to last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    if (integrationId) {
      // Get stats for specific integration
      return this.getEventStats(integrationId, startDate, endDate);
    } else {
      // Get aggregated stats across all integrations
      const totalEvents = await this.usageEventsRepository.count({
        where: {
          timestamp: Between(startDate, endDate),
        },
      });

      // Get event counts by type
      const eventsCountByType = await this.usageEventsRepository
        .createQueryBuilder('event')
        .select('event.eventType', 'type')
        .addSelect('COUNT(*)', 'count')
        .where('event.timestamp BETWEEN :startDate AND :endDate', { startDate, endDate })
        .groupBy('event.eventType')
        .getRawMany();
      
      return {
        totalEvents,
        byType: eventsCountByType,
        period: {
          start: startDate,
          end: endDate,
        }
      };
    }
  }

  /**
   * Export analytics data
   */
  async exportData(exportOptions: any): Promise<any> {
    const { integrationId, startDate, endDate, format = 'json' } = exportOptions;
    
    // Get events based on filters
    const events = await this.getEvents(
      integrationId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
    
    // In a real implementation, this would format the data according to the requested format
    // For now, just return the data with format indicator
    return {
      format,
      data: events,
      exportedAt: new Date(),
      meta: {
        count: events.length,
        filters: {
          integrationId,
          startDate,
          endDate,
        }
      }
    };
  }

  /**
   * Get detailed event statistics
   */
  async getEventStats(integrationId: string, startDate: Date, endDate: Date): Promise<any> {
    // Get event counts by type
    const eventsCountByType = await this.usageEventsRepository
      .createQueryBuilder('event')
      .select('event.eventType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('event.integrationId = :integrationId', { integrationId })
      .andWhere('event.timestamp BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('event.eventType')
      .getRawMany();
    
    // Get most used features
    const mostUsedFeatures = await this.usageEventsRepository
      .createQueryBuilder('event')
      .select("event.eventData->>'feature'", 'feature')
      .addSelect('COUNT(*)', 'count')
      .where('event.integrationId = :integrationId', { integrationId })
      .andWhere('event.eventType = :eventType', { eventType: EventType.FEATURE_USED })
      .andWhere('event.timestamp BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy("event.eventData->>'feature'")
      .orderBy('"count"', 'DESC')
      .limit(10)
      .getRawMany();
    
    // Get daily usage counts
    const dailyUsage = await this.usageEventsRepository
      .createQueryBuilder('event')
      .select('DATE(event.timestamp)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('event.integrationId = :integrationId', { integrationId })
      .andWhere('event.timestamp BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('DATE(event.timestamp)')
      .orderBy('date', 'ASC')
      .getRawMany();
    
    return {
      total: await this.usageEventsRepository.count({
        where: {
          integrationId,
          timestamp: Between(startDate, endDate),
        },
      }),
      byType: eventsCountByType,
      mostUsedFeatures,
      dailyUsage,
    };
  }

  /**
   * Anonymize IP address
   */
  private anonymizeIp(ip: string): string {
    // IPv4 anonymization - keep only the first two octets
    if (ip.includes('.')) {
      const parts = ip.split('.');
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.0.0`;
      }
    }
    
    // IPv6 anonymization - keep only the first half
    if (ip.includes(':')) {
      const parts = ip.split(':');
      if (parts.length >= 4) {
        return `${parts.slice(0, 4).join(':')}::`;
      }
    }
    
    return ip;
  }

  /**
   * Generate loader script for accessibility tools
   */
  async generateLoader(apiKey: string, origin: string): Promise<string> {
    // Validate API key and domain
    const integration = await this.integrationsService.validateDomain(apiKey, origin);
    
    // Generate a time-limited token
    const token = this.generateToken(integration.id);
    
    // Create loader script that will securely load the accessibility tools
    const loaderScript = `
    // Accessibility Tool Loader
    (function() {
      var token = "${token}";
      var apiKey = "${apiKey}";
      var cdnBase = "${this.configService.get('cdn.baseUrl', '/api/cdn')}";
      
      // Load the core script
      var script = document.createElement('script');
      script.async = true;
      script.src = cdnBase + '/v1/script/load/core?token=' + token + '&apiKey=' + apiKey;
      script.integrity = "${integration.settings?.integrityHash || ''}";
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
   * Generate a token for secure access
   */
  private generateToken(integrationId: string): string {
    // Generate a JWT or other token for secure access
    const timestamp = Math.floor(Date.now() / 1000);
    const expiresAt = timestamp + 3600; // Token valid for 1 hour
    
    // In a real implementation, this would use a proper JWT library
    const tokenData = {
      integrationId,
      timestamp,
      expiresAt
    };
    
    return Buffer.from(JSON.stringify(tokenData)).toString('base64');
  }
}

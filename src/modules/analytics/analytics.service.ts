import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { UsageEvent, EventType } from './entities/usage-event.entity';
import { RecordEventDto } from './dtos/record-event.dto';
import { IntegrationsService } from '../integrations/integrations.service';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(UsageEvent)
    private usageEventsRepository: Repository<UsageEvent>,
    private integrationsService: IntegrationsService,
  ) {}

  async recordEvent(recordEventDto: RecordEventDto, ipAddress: string, userAgent: string): Promise<UsageEvent> {
    // Get integration by API key
    const integration = await this.integrationsService.findByApiKey(recordEventDto.apiKey);
    
    if (!integration) {
      throw new Error('Invalid API key');
    }
    
    // Anonymize IP address for privacy
    const anonymizedIp = this.anonymizeIp(ipAddress);
    
    // Create and save the event
    const event = this.usageEventsRepository.create({
      integrationId: integration.id,
      eventType: recordEventDto.eventType,
      timestamp: new Date(),
      pageUrl: recordEventDto.pageUrl,
      ipAddress: anonymizedIp,
      userAgent,
      eventData: recordEventDto.eventData || {},
    });
    
    // Update last used timestamp for the integration
    await this.integrationsService.updateLastUsed(integration.id);
    
    return this.usageEventsRepository.save(event);
  }

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

  private anonymizeIp(ip: string): string {
    // Simple anonymization by replacing last octet with xxx
    return ip.replace(/\d+$/, 'xxx');
  }
}

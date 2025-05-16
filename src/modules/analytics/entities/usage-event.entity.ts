import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@app/common/entities/base.entity';
import { Column, Entity, Index } from 'typeorm';

export enum EventType {
  PAGE_VIEW = 'page_view',
  FEATURE_USED = 'feature_used',
  SCRIPT_LOADED = 'script_loaded',
  ERROR = 'error',
  USER_PREFERENCE = 'user_preference',
}

@Entity('usage_events')
@Index(['integrationId', 'timestamp'])
@Index(['eventType', 'timestamp'])
export class UsageEvent extends BaseEntity {
  @ApiProperty({
    description: 'Integration ID that generated this event',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column()
  integrationId: string;

  @ApiProperty({
    description: 'Type of event',
    enum: EventType,
    example: EventType.FEATURE_USED,
  })
  @Column({
    type: 'enum',
    enum: EventType,
  })
  eventType: EventType;

  @ApiProperty({
    description: 'Timestamp when the event occurred',
    example: '2023-01-01T00:00:00Z',
  })
  @Column({ type: 'timestamp with time zone' })
  timestamp: Date;

  @ApiProperty({
    description: 'Page URL where the event occurred',
    example: 'https://example.com/products',
    required: false,
  })
        @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    default: null,
  })
  pageUrl?: string;



  @ApiProperty({
    description: "User's IP address (anonymized)",
    example: '192.168.1.xxx',
    required: false,
  })


          @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    default: null,
  })
  ipAddress?: string;



  @ApiProperty({
    description: 'User agent information',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
    required: false,
  })
 
  

          @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    default: null,
  })
  userAgent?: string;

  @ApiProperty({
    description: 'Additional event data',
    example: { feature: 'contrast', settings: { level: 'high' } },
    type: 'object',
    nullable: true,
    additionalProperties: true,
  })
  @Column({ type: 'jsonb', default: {} })
  eventData: Record<string, any>;
}

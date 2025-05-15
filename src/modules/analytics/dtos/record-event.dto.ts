import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUrl } from 'class-validator';
import { EventType } from '../entities/usage-event.entity';

export class RecordEventDto {
  @ApiProperty({
    description: 'Integration API key',
    example: 'api_1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @ApiProperty({
    description: 'Type of event',
    enum: EventType,
    example: EventType.FEATURE_USED,
  })
  @IsEnum(EventType)
  eventType: EventType;

  @ApiProperty({
    description: 'Page URL where the event occurred',
    example: 'https://example.com/products',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  pageUrl?: string;

  @ApiProperty({
    description: 'Additional event data',
    example: { feature: 'contrast', settings: { level: 'high' } },
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  eventData?: Record<string, any>;
}
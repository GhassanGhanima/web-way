import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString, IsArray } from 'class-validator';
import { WidgetPosition, WidgetFeatureType } from '../entities/widget-config.entity';

/**
 * Data transfer object for updating a widget configuration
 */
export class UpdateWidgetConfigDto {
  @ApiProperty({
    description: 'Position of the widget on the page',
    enum: WidgetPosition,
    example: WidgetPosition.BOTTOM_RIGHT,
  })
  @IsEnum(WidgetPosition)
  @IsOptional()
  position?: WidgetPosition;

  @ApiProperty({
    description: 'Widget theme ("light", "dark", or "auto")',
    example: 'auto',
  })
  @IsString()
  @IsOptional()
  theme?: string;

  @ApiProperty({
    description: 'Features enabled for this widget',
    type: 'object',
    example: {
      contrast: true,
      fontSize: true,
      readingGuide: true,
      textToSpeech: true,
      keyboardNavigation: true,
    },
  })
  @IsObject()
  @IsOptional()
  features?: Record<WidgetFeatureType, boolean>;

  @ApiProperty({
    description: 'Custom feature order (for UI display)',
    type: [String],
  })
  @IsArray()
  @IsOptional()
  featureOrder?: string[];

  @ApiProperty({
    description: 'Widget custom CSS (optional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  customCss?: string;
}
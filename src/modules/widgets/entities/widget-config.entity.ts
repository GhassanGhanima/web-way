import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@app/common/entities/base.entity';
import { Integration } from '@app/modules/integrations/entities/integration.entity';

/**
 * Defines the possible positions for the widget on the page
 */
export enum WidgetPosition {
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_RIGHT = 'bottom-right',
}

/**
 * Defines the types of features available in the widget
 */
export enum WidgetFeatureType {
  CONTRAST = 'contrast',
  FONT_SIZE = 'fontSize',
  READING_GUIDE = 'readingGuide',
  TEXT_TO_SPEECH = 'textToSpeech',
  KEYBOARD_NAVIGATION = 'keyboardNavigation',
}

/**
 * Widget configuration entity
 * Stores settings for a specific integration's accessibility widget
 */
@Entity('widget_configs')
export class WidgetConfig extends BaseEntity {
  @ApiProperty({
    description: 'Integration ID this widget configuration belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column()
  integrationId: string;

  @ManyToOne(() => Integration, integration => integration.widgetConfigs)
  @JoinColumn({ name: 'integrationId' })
  integration: Integration;

  @ApiProperty({
    description: 'Position of the widget on the page',
    enum: WidgetPosition,
    example: WidgetPosition.BOTTOM_RIGHT,
  })
  @Column({
    type: 'enum',
    enum: WidgetPosition,
    default: WidgetPosition.BOTTOM_RIGHT,
  })
  position: WidgetPosition;

  @ApiProperty({
    description: 'Widget theme ("light", "dark", or "auto")',
    example: 'auto',
  })
  @Column({ default: 'auto' })
  theme: string;

  @ApiProperty({
    description: 'Features enabled for this widget',
    type: 'json',
  })
  @Column('json', {
    default: {
      contrast: true,
      fontSize: true,
      readingGuide: true,
      textToSpeech: true,
      keyboardNavigation: true,
    },
  })
  features: Record<WidgetFeatureType, boolean>;

  @ApiProperty({
    description: 'Custom feature order (for UI display)',
    type: [String],
  })
  @Column('simple-array', { nullable: true })
  featureOrder: string[];
  
  @ApiProperty({
    description: 'Widget custom CSS (optional)',
    required: false,
  })
  @Column('text', { nullable: true })
  customCss: string;
}
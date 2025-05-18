import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

/**
 * Data transfer object for reordering widget features
 */
export class ReorderFeaturesDto {
  @ApiProperty({
    description: 'New order of features',
    type: [String],
    example: ['contrast', 'fontSize', 'readingGuide', 'textToSpeech', 'keyboardNavigation'],
  })
  @IsArray()
  @IsString({ each: true })
  featureOrder: string[];
}
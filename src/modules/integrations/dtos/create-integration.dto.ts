import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateIntegrationDto {
  @ApiProperty({
    description: 'Foreign key to the user who owns this integration',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Name of the integration (for user reference)',
    example: 'My Company Website',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Domain for this integration',
    example: 'example.com',
  })
  @IsString()
  @IsNotEmpty()
  domain: string;

  @ApiProperty({
    description: 'Additional allowed domains (subdomains or alternate domains)',
    example: ['www.example.com', 'app.example.com'],
    type: [String],
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedDomains?: string[];

  @ApiProperty({
    description: 'Configuration settings for this integration',
    example: { theme: 'light', features: ['keyboard_navigation', 'contrast'] },
    type: 'object',
    nullable: true,
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}

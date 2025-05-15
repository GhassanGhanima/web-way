import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ScriptType } from '../entities/script-asset.entity';

export class CreateScriptAssetDto {
  @ApiProperty({
    description: 'Name of the script asset',
    example: 'accessibility-core',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Version of the script asset',
    example: '1.0.0',
  })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiProperty({
    description: 'Type of script',
    enum: ScriptType,
    example: ScriptType.CORE,
  })
  @IsEnum(ScriptType)
  type: ScriptType;

  @ApiProperty({
    description: 'File path to the script content',
    example: 'assets/scripts/accessibility-core-1.0.0.js',
  })
  @IsString()
  @IsNotEmpty()
  filePath: string;

  @ApiProperty({
    description: 'Content hash for SRI (Subresource Integrity)',
    example: 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC',
  })
  @IsString()
  @IsNotEmpty()
  integrityHash: string;

  @ApiProperty({
    description: 'Minimum subscription plan required to use this script',
    example: 'premium',
    required: false,
  })
  @IsString()
  @IsOptional()
  requiredPlan?: string;

  @ApiProperty({
    description: 'Whether the script is currently active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiProperty({
    description: 'Whether this is the latest version of the script',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isLatest?: boolean = true;

  @ApiProperty({
    description: 'Dependencies on other scripts',
    example: ['accessibility-utils'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dependencies?: string[];
}

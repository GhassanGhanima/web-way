import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@app/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

export enum ScriptType {
  CORE = 'core',
  PLUGIN = 'plugin',
  UTILITY = 'utility',
}

@Entity('script_assets')
export class ScriptAsset extends BaseEntity {
  @ApiProperty({
    description: 'Name of the script asset',
    example: 'accessibility-core',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Version of the script asset',
    example: '1.0.0',
  })
  @Column()
  version: string;

  @ApiProperty({
    description: 'Type of script',
    enum: ScriptType,
    example: ScriptType.CORE,
  })
  @Column({
    type: 'enum',
    enum: ScriptType,
    default: ScriptType.CORE,
  })
  type: ScriptType;

  @ApiProperty({
    description: 'File path to the script content',
    example: 'assets/scripts/accessibility-core-1.0.0.js',
  })
  @Column()
  filePath: string;

  @ApiProperty({
    description: 'Content hash for SRI (Subresource Integrity)',
    example: 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC',
  })
  @Column()
  integrityHash: string;

  @ApiProperty({
    description: 'Minimum subscription plan required to use this script',
    example: 'premium',
    required: false,
  })

        @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  requiredPlan?: string;


  @ApiProperty({
    description: 'Whether the script is currently active',
    example: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether this is the latest version of the script',
    example: true,
  })
  @Column({ default: true })
  isLatest: boolean;

  @ApiProperty({
    description: 'Dependencies on other scripts',
    example: ['accessibility-utils'],
    type: [String],
  })
  @Column('simple-array', { nullable: true })
  dependencies: string[] | null;
}

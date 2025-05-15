import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@app/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '@app/modules/users/entities/user.entity';

export enum IntegrationStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  DISABLED = 'disabled',
}

@Entity('integrations')
export class Integration extends BaseEntity {
  @ApiProperty({
    description: 'Foreign key to the user who owns this integration',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    description: 'Name of the integration (for user reference)',
    example: 'My Company Website',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Domain for this integration',
    example: 'example.com',
  })
  @Column()
  domain: string;

  @ApiProperty({
    description: 'API key for this integration',
    example: 'api_1234567890abcdef',
  })
  @Column()
  apiKey: string;

  @ApiProperty({
    description: 'Secret key for this integration',
    example: 'sec_1234567890abcdef',
  })
  @Column()
  secretKey: string;

  @ApiProperty({
    description: 'Additional allowed domains (subdomains or alternate domains)',
    example: ['www.example.com', 'app.example.com'],
    type: [String],
  })
  @Column('simple-array', { nullable: true })
  allowedDomains: string[] | null;

  @ApiProperty({
    description: 'Status of the integration',
    enum: IntegrationStatus,
    example: IntegrationStatus.ACTIVE,
  })
  @Column({
    type: 'enum',
    enum: IntegrationStatus,
    default: IntegrationStatus.PENDING,
  })
  status: IntegrationStatus;

  @ApiProperty({
    description: 'Whether domain ownership is verified',
    example: false,
  })
  @Column({ default: false })
  isDomainVerified: boolean;

  @ApiProperty({
    description: 'Configuration settings for this integration',
    example: { theme: 'light', features: ['keyboard_navigation', 'contrast'] },
    type: 'object',
    additionalProperties: true,
  })
  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;

  @ApiProperty({
    description: 'Last usage timestamp',
    example: '2023-01-01T00:00:00Z',
    required: false,
  })
  @Column({ type: 'timestamp with time zone', nullable: true })
  lastUsedAt: Date | null;
}

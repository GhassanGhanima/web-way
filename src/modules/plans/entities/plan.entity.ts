import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@app/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

export enum PlanInterval {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
}

@Entity('plans')
export class Plan extends BaseEntity {
  @ApiProperty({
    description: 'Name of the subscription plan',
    example: 'Premium',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Description of the subscription plan',
    example: 'Full access to all features',
  })
  @Column()
  description: string;

  @ApiProperty({
    description: 'Price of the subscription plan in cents',
    example: 1999,
  })
  @Column()
  price: number;

  @ApiProperty({
    description: 'Currency of the subscription plan',
    example: 'USD',
  })
  @Column({ default: 'USD' })
  currency: string;

  @ApiProperty({
    description: 'Billing interval for the subscription plan',
    enum: PlanInterval,
    example: PlanInterval.MONTHLY,
  })
  @Column({
    type: 'enum',
    enum: PlanInterval,
    default: PlanInterval.MONTHLY,
  })
  interval: PlanInterval;

  @ApiProperty({
    description: 'External ID for the payment provider',
    example: 'price_1234567890',
    required: false,
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  externalPlanId?: string;

  @ApiProperty({
    description: 'Maximum number of integrations allowed with this plan',
    example: 5,
  })
  @Column({ default: 1 })
  maxIntegrations: number;

  @ApiProperty({
    description: 'Whether the plan includes advanced accessibility features',
    example: true,
  })
  @Column({ default: false })
  includesAdvancedFeatures: boolean;

  @ApiProperty({
    description: 'Whether the plan includes analytics',
    example: true,
  })
  @Column({ default: false })
  includesAnalytics: boolean;

  @ApiProperty({
    description: 'Whether the plan is active',
    example: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Trial period in days',
    example: 14,
  })
  @Column({ default: 0 })
  trialPeriodDays: number;
}

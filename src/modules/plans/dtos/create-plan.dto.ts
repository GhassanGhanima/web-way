import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min } from 'class-validator';
import { PlanInterval } from '../entities/plan.entity';

export class CreatePlanDto {
  @ApiProperty({
    description: 'Name of the subscription plan',
    example: 'Premium',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Description of the subscription plan',
    example: 'Full access to all features',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @ApiProperty({
    description: 'Price of the subscription plan in cents',
    example: 1999,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Currency of the subscription plan',
    example: 'USD',
    default: 'USD',
  })
  @IsString()
  @IsOptional()
  currency?: string = 'USD';

  @ApiProperty({
    description: 'Billing interval for the subscription plan',
    enum: PlanInterval,
    example: PlanInterval.MONTHLY,
    default: PlanInterval.MONTHLY,
  })
  @IsEnum(PlanInterval)
  @IsOptional()
  interval?: PlanInterval = PlanInterval.MONTHLY;

  @ApiProperty({
    description: 'External ID for the payment provider',
    example: 'price_1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  externalPlanId?: string;

  @ApiProperty({
    description: 'Maximum number of integrations allowed with this plan',
    example: 5,
    default: 1,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  maxIntegrations?: number = 1;

  @ApiProperty({
    description: 'Whether the plan includes advanced accessibility features',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  includesAdvancedFeatures?: boolean = false;

  @ApiProperty({
    description: 'Whether the plan includes analytics',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  includesAnalytics?: boolean = false;

  @ApiProperty({
    description: 'Whether the plan is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiProperty({
    description: 'Trial period in days',
    example: 14,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  trialPeriodDays?: number = 0;
}

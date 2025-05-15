import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'ID of the user subscribing to the plan',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'ID of the subscription plan',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({
    description: 'Start date of the subscription',
    example: '2023-01-01T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @ApiProperty({
    description: 'Whether the subscription auto-renews',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean = true;

  @ApiProperty({
    description: 'Notes about the subscription',
    example: 'Customer requested annual billing',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

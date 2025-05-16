import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@app/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '@app/modules/users/entities/user.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
  PENDING = 'pending',
  TRIAL = 'trial',
}

@Entity('subscriptions')
export class Subscription extends BaseEntity {
  @ApiProperty({
    description: 'Foreign key to the subscriber user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    description: 'Foreign key to the subscription plan',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @Column()
  planId: string;

  @ApiProperty({
    description: 'Subscription status',
    enum: SubscriptionStatus,
    example: SubscriptionStatus.ACTIVE,
  })
  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
  })
  status: SubscriptionStatus;

  @ApiProperty({
    description: 'Start date of the subscription',
    example: '2023-01-01T00:00:00Z',
  })
  @Column({ type: 'timestamp with time zone' })
  startDate: Date;

  @ApiProperty({
    description: 'End date of the subscription',
    example: '2024-01-01T00:00:00Z',
  })
  @Column({ type: 'timestamp with time zone' })
  endDate: Date;

  @ApiProperty({
    description: 'Renewal date for the subscription',
    example: '2024-01-01T00:00:00Z',
  })
  @Column({ type: 'timestamp with time zone', nullable: true })
  renewalDate: Date | null;

  @ApiProperty({
    description: 'Whether the subscription auto-renews',
    example: true,
  })
  @Column({ default: true })
  autoRenew: boolean;

  @ApiProperty({
    description: 'External payment provider subscription ID',
    example: 'sub_1234567890',
    required: false,
  })

    @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  externalSubscriptionId?: string;

  @ApiProperty({
    description: 'Cancellation date if the subscription was canceled',
    example: '2023-06-01T00:00:00Z',
    required: false,
  })
  @Column({ type: 'timestamp with time zone', nullable: true })
  canceledAt: Date | null;

  @ApiProperty({
    description: 'Notes about the subscription',
    example: 'Customer requested annual billing',
    required: false,
  })

      @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  notes?: string;
  
}

import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@app/common/entities/base.entity';
import { User } from '@app/modules/users/entities/user.entity';
import { Plan } from '@app/modules/plans/entities/plan.entity';

/**
 * Subscription status enum
 *
 * Represents the possible states a subscription can be in throughout its lifecycle
 */
export enum SubscriptionStatus {
  /**
   * Subscription is active and paid
   */
  ACTIVE = 'active',

  /**
   * Subscription is in trial period
   */
  TRIAL = 'trial',

  /**
   * Payment is pending or being processed
   */
  PENDING = 'pending',

  /**
   * Payment is past due but subscription is still active
   */
  PAST_DUE = 'past_due',

  /**
   * Payment failed and subscription is no longer active
   */
  UNPAID = 'unpaid',

  /**
   * Subscription was canceled by the user
   */
  CANCELED = 'canceled',

  /**
   * Subscription has expired
   */
  EXPIRED = 'expired',
}

@Entity('subscriptions')
export class Subscription extends BaseEntity {
  @ApiProperty({
    description: 'User ID this subscription belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    description: 'Plan ID for this subscription',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column()
  planId: string;

  @ManyToOne(() => Plan)
  @JoinColumn({ name: 'planId' })
  plan: Plan;

  @ApiProperty({
    description: 'External subscription ID (e.g., from payment provider)',
    example: 'sub_1234567890',
    required: false,
  })
  @Column({ nullable: true })
  externalSubscriptionId?: string;

  @ApiProperty({
    description: 'Subscription status',
    enum: SubscriptionStatus,
    example: SubscriptionStatus.ACTIVE,
    enumName: 'SubscriptionStatus',
  })
  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
  })
  status: SubscriptionStatus;

  @ApiProperty({
    description: 'Start date of the subscription',
  })
  @Column()
  startDate: Date;

  @ApiProperty({
    description: 'End date of the subscription',
    required: false,
  })
  @Column({ nullable: true })
  endDate: Date;

  @ApiProperty({
    description: 'Date when the subscription will renew',
    required: false,
  })
  @Column({ nullable: true })
  renewalDate?: Date;

  @ApiProperty({
    description: 'Whether the subscription will automatically renew',
    example: true,
  })
  @Column({ default: true })
  autoRenew: boolean;

  @ApiProperty({
    description: 'Date when the subscription was canceled',
    required: false,
  })
  @Column({ nullable: true })
  canceledAt?: Date;

  @ApiProperty({
    description: 'Maximum number of domains allowed',
    example: 10,
  })
  @Column({ default: 1 })
  maxDomains: number;

  @ApiProperty({
    description: 'Maximum number of URLs allowed per domain',
    example: 5,
  })
  @Column({ default: 1 })
  maxUrlsPerDomain: number;
}

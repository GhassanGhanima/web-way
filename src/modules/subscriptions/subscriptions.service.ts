import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, IsNull, Not } from 'typeorm';
import { Subscription, SubscriptionStatus } from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dtos/create-subscription.dto';
import { PlansService } from '../plans/plans.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    private plansService: PlansService,
  ) {}

  /**
   * Find all subscriptions, optionally filtered by user ID
   * @param userId Optional user ID to filter subscriptions
   * @returns Array of subscriptions
   */
  async findAll(userId?: string): Promise<Subscription[]> {
    if (userId) {
      return this.subscriptionsRepository.find({ 
        where: { userId },
        relations: ['user', 'plan'],
      });
    }
    return this.subscriptionsRepository.find({ 
      relations: ['user', 'plan'] 
    });
  }

  /**
   * Find a subscription by ID
   * @param id Subscription ID
   * @returns Subscription entity
   * @throws NotFoundException if subscription not found
   */
  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionsRepository.findOne({ 
      where: { id },
      relations: ['user', 'plan'],
    });
    
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    
    return subscription;
  }

  /**
   * Find a subscription by its external ID from a payment provider
   * @param externalSubscriptionId External subscription ID
   * @returns Subscription entity or null if not found
   */
  async findByExternalId(externalSubscriptionId: string): Promise<Subscription | null> {
    return this.subscriptionsRepository.findOne({ 
      where: { externalSubscriptionId: externalSubscriptionId },
      relations: ['user', 'plan'],
    });
  }

  /**
   * Create a new subscription
   * @param createSubscriptionDto Subscription data
   * @returns Created subscription
   */
  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    const plan = await this.plansService.findOne(createSubscriptionDto.planId);
    
    const startDate = createSubscriptionDto.startDate ? new Date(createSubscriptionDto.startDate) : new Date();
    const endDate = new Date(startDate);
    
    // Set end date based on plan interval
    switch (plan.interval) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'annual':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    // Create subscription data
    const subscriptionData = {
      userId: createSubscriptionDto.userId,
      planId: createSubscriptionDto.planId,
      startDate,
      endDate,
      renewalDate: endDate,
      autoRenew: createSubscriptionDto.autoRenew ?? true,
      status: plan.trialPeriodDays > 0 ? SubscriptionStatus.TRIAL : SubscriptionStatus.PENDING,
    };

    // Create the entity and save it
    const subscription = this.subscriptionsRepository.create(subscriptionData);
    return this.subscriptionsRepository.save(subscription);
  }

  /**
   * Update a subscription
   * @param id Subscription ID
   * @param updateData Updated subscription data
   * @returns Updated subscription
   */
  async update(id: string, updateData: Partial<Subscription>): Promise<Subscription> {
    await this.findOne(id);
    await this.subscriptionsRepository.update(id, updateData);
    return this.findOne(id);
  }

  /**
   * Update subscription status
   * @param id Subscription ID
   * @param status New status
   * @returns Updated subscription
   */
  async updateStatus(id: string, status: SubscriptionStatus): Promise<Subscription> {
    return this.update(id, { status });
  }

  /**
   * Cancel a subscription
   * @param id Subscription ID
   * @returns Canceled subscription
   */
  async cancel(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);
    
    const updateData = {
      status: SubscriptionStatus.CANCELED,
      autoRenew: false,
      canceledAt: new Date(),
    };
    
    return this.update(id, updateData);
  }

  /**
   * Remove a subscription
   * @param id Subscription ID
   */
  async remove(id: string): Promise<void> {
    const subscription = await this.findOne(id);
    await this.subscriptionsRepository.remove(subscription);
  }

  /**
   * Check if a user has an active subscription
   * @param userId User ID to check
   * @returns Boolean indicating if subscription is active
   */
  async isSubscriptionActive(userId: string): Promise<boolean> {
    const today = new Date();
    
    const subscription = await this.subscriptionsRepository.findOne({
      where: [
        { userId, status: SubscriptionStatus.ACTIVE, endDate: MoreThanOrEqual(today) },
        { userId, status: SubscriptionStatus.TRIAL, endDate: MoreThanOrEqual(today) }
      ]
    });
    
    return subscription !== null;
  }

  /**
   * Find active subscription for a user
   * @param userId User ID
   * @returns Active subscription
   * @throws NotFoundException if no active subscription found
   */
  async findActiveSubscriptionByUserId(userId: string): Promise<Subscription> {
    const today = new Date();
    
    const subscription = await this.subscriptionsRepository.findOne({
      where: [
        { userId, status: SubscriptionStatus.ACTIVE, endDate: MoreThanOrEqual(today) },
        { userId, status: SubscriptionStatus.TRIAL, endDate: MoreThanOrEqual(today) }
      ],
      relations: ['plan']
    });
    
    if (!subscription) {
      throw new NotFoundException(`No active subscription found for user ${userId}`);
    }
    
    return subscription;
  }
}

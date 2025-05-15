import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async findAll(userId?: string): Promise<Subscription[]> {
    if (userId) {
      return this.subscriptionsRepository.find({ 
        where: { userId },
        relations: ['user'],
      });
    }
    return this.subscriptionsRepository.find({ relations: ['user'] });
  }

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionsRepository.findOne({ 
      where: { id },
      relations: ['user'],
    });
    
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    
    return subscription;
  }

  async findByExternalId(externalSubscriptionId: string): Promise<Subscription | null> {
    return this.subscriptionsRepository.findOne({ 
      where: { externalSubscriptionId },
      relations: ['user'],
    });
  }

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

    const subscription = this.subscriptionsRepository.create({
      ...createSubscriptionDto,
      startDate,
      endDate,
      renewalDate: endDate,
      status: plan.trialPeriodDays > 0 ? SubscriptionStatus.TRIAL : SubscriptionStatus.PENDING,
    });

    return this.subscriptionsRepository.save(subscription);
  }

  async update(id: string, updateData: Partial<Subscription>): Promise<Subscription> {
    await this.findOne(id);
    await this.subscriptionsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async updateStatus(id: string, status: SubscriptionStatus): Promise<Subscription> {
    return this.update(id, { status });
  }

  async cancel(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);
    
    return this.update(id, {
      status: SubscriptionStatus.CANCELED,
      autoRenew: false,
      canceledAt: new Date(),
    });
  }

  async remove(id: string): Promise<void> {
    const subscription = await this.findOne(id);
    await this.subscriptionsRepository.remove(subscription);
  }
}

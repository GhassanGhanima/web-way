import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { CreatePlanDto } from './dtos/create-plan.dto';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private plansRepository: Repository<Plan>,
  ) {}

  async findAll(includeInactive = false): Promise<Plan[]> {
    if (includeInactive) {
      return this.plansRepository.find();
    }
    return this.plansRepository.find({ where: { isActive: true } });
  }

  async findOne(id: string): Promise<Plan> {
    const plan = await this.plansRepository.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return plan;
  }

  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    const plan = this.plansRepository.create(createPlanDto);
    return this.plansRepository.save(plan);
  }

  async update(id: string, updateData: Partial<Plan>): Promise<Plan> {
    await this.findOne(id);
    await this.plansRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const plan = await this.findOne(id);
    await this.plansRepository.remove(plan);
  }

  async comparePlans(planIds: string[]): Promise<Plan[]> {
    if (!planIds.length) {
      return this.findAll(false);
    }

    return this.plansRepository.findByIds(planIds);
  }
}

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Integration, IntegrationStatus } from './entities/integration.entity';
import { CreateIntegrationDto } from './dtos/create-integration.dto';

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectRepository(Integration)
    private integrationsRepository: Repository<Integration>,
  ) {}

  async findAll(userId?: string): Promise<Integration[]> {
    if (userId) {
      return this.integrationsRepository.find({ 
        where: { userId },
        relations: ['user'],
      });
    }
    return this.integrationsRepository.find({ relations: ['user'] });
  }

  async findOne(id: string): Promise<Integration> {
    const integration = await this.integrationsRepository.findOne({ 
      where: { id },
      relations: ['user'],
    });
    
    if (!integration) {
      throw new NotFoundException(`Integration with ID ${id} not found`);
    }
    
    return integration;
  }

  async findByApiKey(apiKey: string): Promise<Integration | null> {
    return this.integrationsRepository.findOne({ 
      where: { apiKey },
      relations: ['user'],
    });
  }

  async create(createIntegrationDto: CreateIntegrationDto): Promise<Integration> {
    // Generate API key and secret key
    const apiKey = `api_${this.generateRandomString(24)}`;
    const secretKey = `sec_${this.generateRandomString(32)}`;
    
    const integration = this.integrationsRepository.create({
      ...createIntegrationDto,
      apiKey,
      secretKey,
      status: IntegrationStatus.PENDING,
    });
    
    return this.integrationsRepository.save(integration);
  }

  async update(id: string, updateData: Partial<Integration>): Promise<Integration> {
    await this.findOne(id);
    await this.integrationsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const integration = await this.findOne(id);
    await this.integrationsRepository.remove(integration);
  }

  async verifyDomain(id: string, verificationCode: string): Promise<Integration> {
    // In a real implementation, this would verify domain ownership
    // For now, just mark it as verified
    return this.update(id, { isDomainVerified: true });
  }

  async updateLastUsed(id: string): Promise<void> {
    await this.integrationsRepository.update(id, {
      lastUsedAt: new Date(),
    });
  }

  async validateDomain(apiKey: string, domain: string): Promise<Integration> {
    const integration = await this.findByApiKey(apiKey);
    
    if (!integration) {
      throw new NotFoundException('Integration not found');
    }
    
    if (integration.status !== IntegrationStatus.ACTIVE) {
      throw new ForbiddenException('Integration is not active');
    }
    
    // Check if domain is allowed
    if (domain !== integration.domain && 
        (!integration.allowedDomains || !integration.allowedDomains.includes(domain))) {
      throw new ForbiddenException(`Domain ${domain} is not authorized for this integration`);
    }
    
    return integration;
  }

  /**
   * Find all integrations for a specific user
   * @param userId User ID to find integrations for
   * @returns Array of integration entities
   */
  async findByUserId(userId: string): Promise<Integration[]> {
    return this.integrationsRepository.find({
      where: { userId },
      relations: ['user'],
    });
  }

  private generateRandomString(length: number): string {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
  }
}

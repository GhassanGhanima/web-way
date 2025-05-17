import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from './entities/faq.entity';
import { Category } from './entities/category.entity';
import { CreateFaqDto } from './dtos/create-faq.dto';
import { UpdateFaqDto } from './dtos/update-faq.dto';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq)
    private faqRepository: Repository<Faq>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  // FAQ Methods
  async findAllFaqs(onlyPublished = false): Promise<Faq[]> {
    const query = this.faqRepository.createQueryBuilder('faq')
      .leftJoinAndSelect('faq.category', 'category')
      .orderBy('category.order', 'ASC')
      .addOrderBy('faq.order', 'ASC');

    if (onlyPublished) {
      query.where('faq.isPublished = :isPublished', { isPublished: true });
    }

    return query.getMany();
  }

  async findOneFaq(id: string): Promise<Faq> {
    const faq = await this.faqRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }

    return faq;
  }

  async createFaq(createFaqDto: CreateFaqDto): Promise<Faq> {
    const faq = this.faqRepository.create(createFaqDto);
    
    // Set default order to be the last in the list if not specified
    if (createFaqDto.order === undefined) {
      const maxOrderFaq = await this.faqRepository.findOne({
        where: { categoryId: createFaqDto.categoryId },
        order: { order: 'DESC' },
      });
      
      faq.order = maxOrderFaq ? maxOrderFaq.order + 1 : 0;
    }
    
    return this.faqRepository.save(faq);
  }

  async updateFaq(id: string, updateFaqDto: UpdateFaqDto): Promise<Faq> {
    const faq = await this.findOneFaq(id);
    
    Object.assign(faq, updateFaqDto);
    
    return this.faqRepository.save(faq);
  }

  async removeFaq(id: string): Promise<void> {
    const faq = await this.findOneFaq(id);
    await this.faqRepository.remove(faq);
  }

  async setFaqPublishedStatus(id: string, isPublished: boolean): Promise<Faq> {
    const faq = await this.findOneFaq(id);
    faq.isPublished = isPublished;
    return this.faqRepository.save(faq);
  }

  async reorderFaqs(categoryId: string, faqIds: string[]): Promise<Faq[]> {
    const faqs = await this.faqRepository.find({
      where: { categoryId },
    });
    
    // Verify all IDs exist
    const existingIds = new Set(faqs.map(faq => faq.id));
    for (const id of faqIds) {
      if (!existingIds.has(id)) {
        throw new NotFoundException(`FAQ with ID ${id} not found in category ${categoryId}`);
      }
    }
    
    // Update the order of each FAQ
    const updatedFaqs: Faq[] = [];
    for (let i = 0; i < faqIds.length; i++) {
      const foundFaq = faqs.find(f => f.id === faqIds[i]);
      // Add null check
      if (foundFaq) {
        foundFaq.order = i;
        // Save each FAQ individually
        const savedFaq = await this.faqRepository.save(foundFaq);
        updatedFaqs.push(savedFaq);
      }
    }
    
    return updatedFaqs;
  }

  /**
 * Find FAQs by product type
 */
async findFaqsByProductType(productType: string): Promise<Faq[]> {
  return this.faqRepository.createQueryBuilder('faq')
    .leftJoinAndSelect('faq.product', 'product')
    .where('product.type = :productType', { productType })
    .andWhere('faq.isPublished = :isPublished', { isPublished: true })
    .orderBy('faq.order', 'ASC')
    .getMany();
}

/**
 * Create a FAQ associated with a product
 */
async createProductFaq(productId: string, createFaqDto: CreateFaqDto): Promise<Faq> {
  const faq = this.faqRepository.create({
    ...createFaqDto,
    productId,
  });
  
  return this.faqRepository.save(faq);
}

  // Category Methods
  async findAllCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      relations: ['faqs'],
      order: { order: 'ASC' },
    });
  }

  async findOneCategory(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['faqs'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create(createCategoryDto);
    
    // Set default order to be the last in the list if not specified
    if (createCategoryDto.order === undefined) {
      const maxOrderCategory = await this.categoryRepository.findOne({
        order: { order: 'DESC' },
      });
      
      category.order = maxOrderCategory ? maxOrderCategory.order + 1 : 0;
    }
    
    return this.categoryRepository.save(category);
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOneCategory(id);
    
    Object.assign(category, updateCategoryDto);
    
    return this.categoryRepository.save(category);
  }

  async removeCategory(id: string): Promise<void> {
    const category = await this.findOneCategory(id);
    
    // Check if category has FAQs
    if (category.faqs.length > 0) {
      throw new Error(`Cannot delete category with ID ${id} because it has FAQs`);
    }
    
    await this.categoryRepository.remove(category);
  }

  async reorderCategories(categoryIds: string[]): Promise<Category[]> {
    const categories = await this.categoryRepository.find();
    
    // Verify all IDs exist
    const existingIds = new Set(categories.map(cat => cat.id));
    for (const id of categoryIds) {
      if (!existingIds.has(id)) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }
    }
    
    // Update the order of each category
    const updatedCategories: Category[] = [];
    for (let i = 0; i < categoryIds.length; i++) {
      const foundCategory = categories.find(c => c.id === categoryIds[i]);
      // Add null check
      if (foundCategory) {
        foundCategory.order = i;
        // Save each category individually
        const savedCategory = await this.categoryRepository.save(foundCategory);
        updatedCategories.push(savedCategory);
      }
    }
    
    return updatedCategories;
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductType } from './entities/product.entity';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find({ 
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['faqs'],
    });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    return product;
  }

  async findByType(type: ProductType): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { type },
    });
    
    if (!product) {
      throw new NotFoundException(`Product with type ${type} not found`);
    }
    
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    
    Object.assign(product, updateProductDto);
    
    return this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }

  async reorderProducts(productIds: string[]): Promise<Product[]> {
    const products = await this.productsRepository.find();
    
    // Verify all IDs exist
    const existingIds = new Set(products.map(p => p.id));
    for (const id of productIds) {
      if (!existingIds.has(id)) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
    }
    
    // Update the order of each product
    const updatedProducts: Product[] = [];
    for (let i = 0; i < productIds.length; i++) {
      const foundProduct = products.find(p => p.id === productIds[i]);
      if (foundProduct) {
        foundProduct.order = i;
        const savedProduct = await this.productsRepository.save(foundProduct);
        updatedProducts.push(savedProduct);
      }
    }
    
    return updatedProducts;
  }
}
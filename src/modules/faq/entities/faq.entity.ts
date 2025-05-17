import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@app/common/entities/base.entity';
import { Category } from './category.entity';
import { Product } from '@app/modules/products/entities/product.entity';

@Entity('faqs')
export class Faq extends BaseEntity {
  @ApiProperty({
    description: 'FAQ question',
    example: 'How do I install the accessibility widget?',
  })
  @Column()
  question: string;

  @ApiProperty({
    description: 'FAQ answer',
    example: 'You can install our accessibility widget by adding a single line of JavaScript to your website...',
  })
  @Column({ type: 'text' })
  answer: string;

  @ApiProperty({
    description: 'Order of the FAQ in the category',
    example: 1,
  })
  @Column({ default: 0 })
  order: number;

  @ApiProperty({
    description: 'Whether the FAQ is published',
    example: true,
  })
  @Column({ default: true })
  isPublished: boolean;

  @ApiProperty({
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ nullable: true })
  categoryId: string;

  @ManyToOne(() => Category, category => category.faqs, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ nullable: true })
  productId: string;

  @ManyToOne(() => Product, product => product.faqs, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'productId' })
  product: Product;
}
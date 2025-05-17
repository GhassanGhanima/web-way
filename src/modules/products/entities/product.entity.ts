import { Column, Entity, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@app/common/entities/base.entity';
import { Faq } from '@app/modules/faq/entities/faq.entity';

export enum ProductType {
  ACCESSIBILITY_WIDGET = 'accessibility_widget',
  ACCESSIBILITY_MONITOR = 'accessibility_monitor',
  ACCESSIBILITY_AUDIT = 'accessibility_audit',
  VPAT = 'vpat',
  LITIGATION_SUPPORT = 'litigation_support',
}

@Entity('products')
export class Product extends BaseEntity {
  @ApiProperty({
    description: 'Product name',
    example: 'Accessibility Widget',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Product type',
    enum: ProductType,
    example: ProductType.ACCESSIBILITY_WIDGET,
  })
  @Column({
    type: 'enum',
    enum: ProductType,
  })
  type: ProductType;

  @ApiProperty({
    description: 'Short description',
    example: 'Level up your accessibility with our AI-Powered Widget',
  })
  @Column()
  shortDescription: string;

  @ApiProperty({
    description: 'Full description of the product',
    example: 'Our accessibility widget helps websites become accessible to all users...',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    description: 'Product features as JSON',
    example: '["Easy installation", "WCAG compliance", "Analytics dashboard"]',
  })
  @Column({ type: 'json', default: '[]' })
  features: string[];

  @ApiProperty({
    description: 'Whether this is a popular/featured product',
    example: true,
  })
  @Column({ default: false })
  isPopular: boolean;

  @ApiProperty({
    description: 'Display order of the product',
    example: 1,
  })
  @Column({ default: 0 })
  order: number;

  @ApiProperty({
    description: 'Product icon or image URL',
    example: '/icons/widget.svg',
  })
  @Column({ nullable: true })
  iconUrl?: string;

  @OneToMany(() => Faq, faq => faq.product)
  faqs: Faq[];
}
import { Column, Entity, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@app/common/entities/base.entity';
import { Faq } from './faq.entity';

@Entity('faq_categories')
export class Category extends BaseEntity {
  @ApiProperty({
    description: 'The name of the category',
    example: 'Account Management',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'The description of the category',
    example: 'Questions related to managing your account',
    required: false,
  })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({
    description: 'The order in which this category appears',
    example: 1,
  })
  @Column({ default: 0 })
  order: number;

  @ApiProperty({
    description: 'The FAQs in this category',
    type: () => [Faq],
  })
  @OneToMany(() => Faq, faq => faq.category)
  faqs: Faq[];
}
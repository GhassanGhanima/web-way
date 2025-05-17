import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@app/common/entities/base.entity';
import { Category } from './category.entity';

@Entity('faqs')
export class Faq extends BaseEntity {
  @ApiProperty({
    description: 'The question being asked',
    example: 'How do I reset my password?',
  })
  @Column()
  question: string;

  @ApiProperty({
    description: 'The answer to the question',
    example: 'You can reset your password by clicking on the "Forgot Password" link on the login page.',
  })
  @Column('text')
  answer: string;

  @ApiProperty({
    description: 'The order in which this FAQ appears',
    example: 1,
  })
  @Column({ default: 0 })
  order: number;

  @ApiProperty({
    description: 'Whether this FAQ is published',
    example: true,
  })
  @Column({ default: true })
  isPublished: boolean;

  @ApiProperty({
    description: 'The category this FAQ belongs to',
    type: () => Category,
  })
  @ManyToOne(() => Category, category => category.faqs)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  categoryId: string;
}
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsBoolean, IsArray } from 'class-validator';
import { ProductType } from '../entities/product.entity';

export class UpdateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Accessibility Widget',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Product type',
    enum: ProductType,
    example: ProductType.ACCESSIBILITY_WIDGET,
  })
  @IsEnum(ProductType)
  @IsOptional()
  type?: ProductType;

  @ApiProperty({
    description: 'Short description',
    example: 'Level up your accessibility with our AI-Powered Widget',
  })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiProperty({
    description: 'Full description of the product',
    example: 'Our accessibility widget helps websites become accessible to all users...',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Product features',
    example: ['Easy installation', 'WCAG compliance', 'Analytics dashboard'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  features?: string[];

  @ApiProperty({
    description: 'Whether this is a popular/featured product',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isPopular?: boolean;

  @ApiProperty({
    description: 'Product icon or image URL',
    example: '/icons/widget.svg',
  })
  @IsString()
  @IsOptional()
  iconUrl?: string;
}
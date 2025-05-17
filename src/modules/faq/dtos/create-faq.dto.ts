import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateFaqDto {
  @ApiProperty({
    description: 'The question being asked',
    example: 'How do I reset my password?',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    description: 'The answer to the question',
    example: 'You can reset your password by clicking on the "Forgot Password" link on the login page.',
  })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiProperty({
    description: 'The category ID this FAQ belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({
    description: 'The order in which this FAQ appears',
    example: 1,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiProperty({
    description: 'Whether this FAQ is published',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'Name of the role',
    example: 'admin',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Description of the role',
    example: 'Administrator with full access',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
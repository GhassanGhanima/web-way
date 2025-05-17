import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePermissionDto {
  @ApiProperty({
    description: 'Name of the permission',
    example: 'user:read',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Description of the permission',
    example: 'Can read user data',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
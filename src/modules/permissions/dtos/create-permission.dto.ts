import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Name of the permission',
    example: 'user:read',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of the permission',
    example: 'Can read user data',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
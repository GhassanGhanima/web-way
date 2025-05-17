import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class AssignPermissionsDto {
  @ApiProperty({
    description: 'Array of permission IDs to assign to the role',
    type: [String],
    example: ['uuid1', 'uuid2'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(4, { each: true })
  permissionIds: string[];
}
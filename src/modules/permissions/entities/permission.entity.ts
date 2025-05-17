import { Column, Entity, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@app/common/entities/base.entity';
import { Role } from '@app/modules/roles/entities/role.entity';

@Entity('permissions')
export class Permission extends BaseEntity {
  @ApiProperty({
    description: 'Name of the permission',
    example: 'user:read',
  })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    description: 'Description of the permission',
    example: 'Can read user data',
  })
  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];
}
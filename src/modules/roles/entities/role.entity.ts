import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@app/common/entities/base.entity';
import { Permission } from '@app/modules/permissions/entities/permission.entity';
import { User } from '@app/modules/users/entities/user.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @ApiProperty({
    description: 'Name of the role',
    example: 'admin',
  })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    description: 'Description of the role',
    example: 'Administrator with full access',
  })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({
    description: 'Permissions assigned to this role',
    type: () => [Permission],
  })
  @ManyToMany(() => Permission, permission => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @ManyToMany(() => User, user => user.roles)
  users: User[];
}
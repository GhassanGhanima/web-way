import { BeforeInsert, Column, Entity, ManyToMany, JoinTable } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { BaseEntity } from '@app/common/entities/base.entity';
import { Role } from '@app/modules/auth/entities/role.entity';

@Entity('users')
export class User extends BaseEntity {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @Column({ nullable: true })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @Column({ nullable: true })
  lastName: string;

  @Exclude()
  @Column()
  password: string;

  @ApiProperty({
    description: 'Whether the user has verified their email',
    example: false,
  })
  @Column({ default: false })
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'User roles',
    type: () => [Role],
  })
  @ManyToMany(() => Role, role => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: Role[];

  @ApiProperty({
    description: 'User profile image URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @Column({ nullable: true })
  avatarUrl?: string;

  @ApiProperty({
    description: 'Google ID for OAuth login',
    required: false,
  })
  @Column({ nullable: true })
  googleId?: string;

  @ApiProperty({
    description: 'User last login date',
    required: false,
  })
  @Column({ nullable: true })
  lastLoginAt?: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

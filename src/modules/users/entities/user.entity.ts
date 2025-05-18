import { BeforeInsert, Column, Entity, ManyToMany, OneToMany, JoinTable, ManyToOne } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { BaseEntity } from '@app/common/entities/base.entity';
import { Role } from '@app/modules/roles/entities/role.entity';
import { Integration } from '@app/modules/integrations/entities/integration.entity';

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

  @ApiProperty({
    description: 'Parent admin user (for users created by admins)',
    required: false,
  })
  @Column({ nullable: true })
  parentAdminId: string;

  @ManyToOne(() => User, user => user.childUsers)
  parentAdmin: User;

  @OneToMany(() => User, user => user.parentAdmin)
  childUsers: User[];

  @ApiProperty({
    description: 'Company name (for admin users)',
    example: 'Acme Corporation',
    required: false,
  })
  @Column({ nullable: true })
  companyName: string;

  @ApiProperty({
    description: 'URLs that this user can use widgets on',
    type: [String],
    required: false,
  })
  @Column('simple-array', { nullable: true })
  authorizedUrls: string[];

  @ApiProperty({
    description: 'Is this account active',
    example: true,
  })
  @Column({ default: true })
  isActive: boolean;

  /**
   * Integrations associated with this user
   */
  @OneToMany(() => Integration, integration => integration.user)
  integrations: Integration[];

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

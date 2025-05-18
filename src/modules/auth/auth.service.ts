import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { LoginDto } from './dtos/login.dto';
import { CreateUserDto } from '../users/dtos/create-user.dto';

export interface GoogleUserDto {
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  googleId: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private rolesService: RolesService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await user.validatePassword(password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.usersService.updateLastLogin(user.id);

    return this.generateTokens(user);
  }

  /**
   * Register a new user
   * For public registration, users are assigned the basic USER role
   */
  async register(createUserDto: CreateUserDto) {
    // Create user with default USER role
    const user = await this.usersService.create(createUserDto);
    return this.generateTokens(user);
  }

  /**
   * Register an admin user
   * This should only be called by a super admin
   */
  async registerAdmin(createUserDto: CreateUserDto) {
    // Get admin role
    const adminRole = await this.rolesService.findByName('admin');
    
    if (!adminRole) {
      throw new BadRequestException('Admin role not found');
    }

    // Create user with custom role assignment
    const user = await this.usersService.create(createUserDto);
    await this.usersService.assignRoles(user.id, [adminRole.id]);
    
    return this.generateTokens(user);
  }

  /**
   * Register a user by an admin
   * Admin-created users get USER role by default
   * @param createUserDto User data
   * @param adminId ID of the admin creating the user
   */
  async registerUserByAdmin(createUserDto: CreateUserDto, adminId: string) {
    // Set the parentAdminId to track which admin created this user
    const enrichedUserDto = {
      ...createUserDto,
      parentAdminId: adminId
    };
    
    const user = await this.usersService.create(enrichedUserDto);
    return user;
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET') || 'your-secret-key',
      });

      // Get the user
      const user = await this.usersService.findOne(payload.sub);
      
      // Generate new tokens
      return this.generateTokens(user);
    } catch (error) {
      console.error('Refresh token error:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Handle Google OAuth authentication
   * If email ends with admin.com, assign ADMIN role
   */
  async validateOrCreateGoogleUser(googleUserDto: GoogleUserDto): Promise<any> {
    let user = await this.usersService.findByEmail(googleUserDto.email);
    
    if (user) {
      // Update existing user with Google info if needed
      if (!user.googleId) {
        user = await this.usersService.update(user.id, {
          googleId: googleUserDto.googleId,
          isEmailVerified: true,
        });
      }
    } else {
      // Create new user
      const newUser = {
        email: googleUserDto.email,
        firstName: googleUserDto.firstName,
        lastName: googleUserDto.lastName,
        avatarUrl: googleUserDto.avatarUrl,
        googleId: googleUserDto.googleId,
        isEmailVerified: true,
        password: Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10),
      };
      
      user = await this.usersService.create(newUser);
      
      // Automatically assign ADMIN role if email domain matches
      if (googleUserDto.email.endsWith('admin.com')) {
        const adminRole = await this.rolesService.findByName('admin');
        if (adminRole) {
          await this.usersService.assignRoles(user.id, [adminRole.id]);
        }
      }
    }
    
    await this.usersService.updateLastLogin(user.id);
    
    return user;
  }

  async generateTokens(user: any) {
    // Ensure we have full user data with roles
    let userWithRoles = user;
    
    // If the user doesn't have roles loaded, fetch them
    if (!user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
      const roles = await this.rolesService.findUserRoles(user.id);
      userWithRoles = {
        ...user,
        roles: roles.map(role => role.name)
      };
      console.log(`Enriched user with roles: ${roles.map(r => r.name).join(', ')}`);
    }
    
    // Create JWT payload with roles explicitly added
    const roleNames = Array.isArray(userWithRoles.roles) 
      ? userWithRoles.roles.map(role => typeof role === 'object' ? role.name : role)
      : [];
      
    const payload = { 
      email: userWithRoles.email, 
      sub: userWithRoles.id,
      roles: roleNames
    };
    
    console.log('JWT payload:', payload);
    
    // Generate tokens
    const secret = this.configService.get<string>('JWT_SECRET') || 'your-secret-key';
    
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: secret,
        expiresIn: '24h',
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: secret,
        expiresIn: '7d',
      }),
    };
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dtos/login.dto';
import { CreateUserDto } from '../users/dtos/create-user.dto';

// Move the interface outside the class
export interface GoogleUserDto {
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  googleId: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
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

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      const user = await this.usersService.findOne(payload.sub);
      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Validate a Google user or create if they don't exist
   */
  async validateOrCreateGoogleUser(googleUserDto: GoogleUserDto): Promise<any> {
    // Check if user exists
    let user = await this.usersService.findByEmail(googleUserDto.email);
    
    if (user) {
      // Update Google ID if not already set
      if (!user.googleId) {
        user = await this.usersService.update(user.id, {
          googleId: googleUserDto.googleId,
          isEmailVerified: true, // Auto-verify email for Google accounts
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
        // Generate a secure random password for users that register with OAuth
        password: Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10),
      };
      
      user = await this.usersService.create(newUser);
    }
    
    // Update last login timestamp
    await this.usersService.updateLastLogin(user.id);
    
    return user;
  }

   generateTokens(user: any) {
    // Extract just the role names from the user's roles
    const roleNames = user.roles ? user.roles.map(role => role.name) : [];
    
    // Simplified payload with just the essential information
    const payload = { 
      email: user.email, 
      sub: user.id, 
      roles: roleNames // Only include role names, not full role objects
    };
    
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      }),
    };
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { RolesService } from '../../roles/roles.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private rolesService: RolesService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Keep this false to handle expiration properly
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    try {
      // Get full user with roles and permissions
      const user = await this.usersService.findOneWithFullDetails(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Get user roles with their permissions
      const userRoles = await this.rolesService.findUserRoles(user.id);
      
      // Extract role names and all permissions from roles
      const roleNames = userRoles.map(role => role.name);
      const permissions = new Set<string>();
      
      userRoles.forEach(role => {
        if (role.permissions) {
          role.permissions.forEach(permission => permissions.add(permission.name));
        }
      });
      
      // Add debug logging
      console.log(`User ${user.email} authenticated with roles: ${roleNames.join(', ')}`);
      console.log(`User permissions: ${Array.from(permissions).join(', ')}`);

      // Return enriched user object
      return {
        id: user.id,
        email: user.email,
        roles: roleNames,
        permissions: Array.from(permissions)
      };
    } catch (error) {
      console.error('JWT validation error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}

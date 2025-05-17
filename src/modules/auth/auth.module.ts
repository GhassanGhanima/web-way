import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { RolesGuard } from '../roles/guards/roles.guard'; // Fixed path
import { PermissionsGuard } from '../permissions/guards/permissions.guard'; // Fixed path
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => RolesModule),
    forwardRef(() => PermissionsModule),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION') || '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    LocalStrategy, 
    JwtStrategy,
    GoogleStrategy,
    RolesGuard, 
    PermissionsGuard
  ],
  exports: [AuthService, JwtStrategy, RolesGuard, PermissionsGuard],
})
export class AuthModule {}

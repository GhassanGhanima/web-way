import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolesController } from './controllers/roles.controller';
import { PermissionsController } from './controllers/permissions.controller';
import { RolesService } from './services/roles.service';
import { PermissionsService } from './services/permissions.service';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission]),
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, RolesController, PermissionsController],
  providers: [
    AuthService, 
    LocalStrategy, 
    JwtStrategy, 
    RolesService, 
    PermissionsService, 
    RolesGuard, 
    PermissionsGuard,
    {
  provide: APP_GUARD,
  useClass: RolesGuard,
}
    
  ],
  exports: [AuthService, RolesService, PermissionsService, RolesGuard, PermissionsGuard],
})
export class AuthModule {}

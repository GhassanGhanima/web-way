import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolesService } from './services/roles.service';
import { PermissionsService } from './services/permissions.service';
import { RolesController } from './controllers/roles.controller';
import { PermissionsController } from './controllers/permissions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission]),
  ],
  providers: [RolesService, PermissionsService],
  controllers: [RolesController, PermissionsController],
  exports: [RolesService, PermissionsService],
})
export class RolesPermissionsModule {}
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './controllers/permissions.controller';
import { RolesModule } from '../roles/roles.module';
import {PermissionsGuard} from './guards/permissions.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission]),
    forwardRef(() => RolesModule),
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService,PermissionsGuard],
  exports: [PermissionsService,PermissionsGuard],
})
export class PermissionsModule {}
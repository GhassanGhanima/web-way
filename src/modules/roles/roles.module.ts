import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RolesService } from './roles.service';
import { RolesController } from './controllers/roles.controller';
import { PermissionsModule } from '../permissions/permissions.module';
import { Permission } from '../permissions/entities/permission.entity';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission]),
    forwardRef(() => PermissionsModule),
  ],
  controllers: [RolesController],
  providers: [RolesService,RolesGuard],
  exports: [RolesService,RolesGuard],
})
export class RolesModule {}
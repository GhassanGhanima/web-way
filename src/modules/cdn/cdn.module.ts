import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CdnController } from './cdn.controller';
import { CdnService } from './cdn.service';
import { ScriptAsset } from './entities/script-asset.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { RolesModule } from '../roles/roles.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { WidgetsModule } from '../widgets/widgets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScriptAsset]),
    IntegrationsModule,
    SubscriptionsModule,
    RolesModule,        // Import RolesModule to make RolesService available
    PermissionsModule,  // Import PermissionsModule for PermissionsGuard
    WidgetsModule,     // Import WidgetsModule to make WidgetsService available
  ],
  controllers: [CdnController],
  providers: [CdnService],
  exports: [CdnService],
})
export class CdnModule {}
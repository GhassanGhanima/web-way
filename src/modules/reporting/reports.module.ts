import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';
import { UsersModule } from '../users/users.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { RolesModule } from '../roles/roles.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    AnalyticsModule,
    UsersModule,
    SubscriptionsModule,
    IntegrationsModule,
    RolesModule,        // Import RolesModule to make RolesService available
    PermissionsModule,  // Import PermissionsModule for PermissionsGuard
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
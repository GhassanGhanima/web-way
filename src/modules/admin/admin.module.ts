import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { PlansModule } from '../plans/plans.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { RolesModule } from '../roles/roles.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    UsersModule,
    PlansModule,
    SubscriptionsModule,
    IntegrationsModule,
    AnalyticsModule,
    RolesModule,
    PermissionsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}

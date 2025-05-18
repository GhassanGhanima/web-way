import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WidgetsController } from './widgets.controller';
import { WidgetsService } from './widgets.service';
import { WidgetConfig } from './entities/widget-config.entity';
import { IntegrationsModule } from '../integrations/integrations.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { AuthModule } from '../auth/auth.module';
import { RolesModule } from '../roles/roles.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WidgetConfig]),
    IntegrationsModule,
    SubscriptionsModule,
    AuthModule,
    RolesModule,
    PermissionsModule,
  ],
  controllers: [WidgetsController],
  providers: [WidgetsService],
  exports: [WidgetsService],
})
export class WidgetsModule {}
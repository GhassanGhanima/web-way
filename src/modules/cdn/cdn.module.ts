import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CdnController } from './cdn.controller';
import { CdnService } from './cdn.service';
import { ScriptAsset } from './entities/script-asset.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScriptAsset]),
    IntegrationsModule,
    SubscriptionsModule,
  ],
  controllers: [CdnController],
  providers: [CdnService],
  exports: [CdnService],
})
export class CdnModule {}

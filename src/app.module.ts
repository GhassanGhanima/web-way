import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule as AppConfigModule } from './config/config.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PlansModule } from './modules/plans/plans.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { CdnModule } from './modules/cdn/cdn.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminModule } from './modules/admin/admin.module';
import { ReportsModule } from './modules/reporting/reports.module';
import { LoggingModule } from './common/logging/logging.module';
import { I18nModule } from './common/i18n/i18n.module';
import { HealthModule } from './common/health/health.module';
import { CacheModule } from './common/cache/cache.module';
import { TasksModule } from './common/tasks/tasks.module';
import { EmailModule } from './common/email/email.module';
import { FilesModule } from './common/files/files.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { PaymentsModule } from './modules/payments/payments.module';
import { RolesGuard } from './modules/auth/guards/roles.guard';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
          synchronize: false,
    migrationsRun: false,
    logging: true, // Enable logging for debugging
    entitySkipConstructor: true // Try this to avoid constructor issues
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('security.rateLimit.ttl') ?? 60,
            limit: configService.get<number>('security.rateLimit.max') ?? 10,
          },
        ],
      }),
    }),
    UsersModule,
    LoggingModule,
    HealthModule,
    CacheModule,
    TasksModule,
    EmailModule,
    FilesModule,
    AuthModule,
    PlansModule,
    SubscriptionsModule,
    PaymentsModule,
    CdnModule,
    IntegrationsModule,
    AnalyticsModule,
    AdminModule,
    ReportsModule,
    I18nModule,

  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}

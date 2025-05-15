import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { I18nModule as NestI18nModule } from 'nestjs-i18n';
import { join } from 'path';

@Module({
  imports: [
    NestI18nModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get('i18n.fallbackLanguage') || 'en',
        loaderOptions: {
          path: join(__dirname, '../../i18n/'),
          watch: configService.get('NODE_ENV') !== 'production',
        },
      }),
    }),
  ],
  exports: [NestI18nModule],
})
export class I18nModule {}
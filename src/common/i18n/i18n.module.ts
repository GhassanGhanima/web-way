import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { I18nModule as NestI18nModule, HeaderResolver, QueryResolver, AcceptLanguageResolver } from 'nestjs-i18n';
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
        resolvers: [
          { use: QueryResolver, options: ['lang', 'locale'] },
          { use: HeaderResolver, options: ['x-custom-lang'] },
          { use: AcceptLanguageResolver }, // ✅ FIX: wrap in `{ use: ... }`
        ],
      }),
    }),
  ],
  exports: [NestI18nModule],
})
export class I18nModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { I18nModule as NestI18nModule, HeaderResolver, QueryResolver, AcceptLanguageResolver } from 'nestjs-i18n';
import { join } from 'path';

@Module({
  imports: [
    NestI18nModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // For debugging purposes, log the path
        const i18nPath = join(__dirname, '../../i18n/');
        console.log('I18n path:', i18nPath);
        
        return {
          fallbackLanguage: configService.get('i18n.fallbackLanguage') || 'en',
          loaderOptions: {
            path: i18nPath,
            watch: configService.get('NODE_ENV') !== 'production',
          },
          resolvers: [
            { use: QueryResolver, options: ['lang', 'locale'] },
            { use: HeaderResolver, options: ['x-custom-lang'] },
            { use: AcceptLanguageResolver },
          ],
        };
      },
    }),
  ],
  exports: [NestI18nModule],
})
export class I18nModule {}
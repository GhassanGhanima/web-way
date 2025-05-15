import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import appConfig from './app.config';
import databaseConfig from './database.config';
import jwtConfig from './jwt.config';
import cdnConfig from './cdn.config';
import i18nConfig from './i18n.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, cdnConfig, i18nConfig],
      expandVariables: true,
      envFilePath: ['.env', '.env.local'],
    }),
  ],
})
export class ConfigModule {}

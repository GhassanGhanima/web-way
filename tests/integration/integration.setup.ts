import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppModule } from '../../src/app.module';

export async function setupTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.test',
      }),
      AppModule,
    ],
  }).compile();

  const app = moduleRef.createNestApplication();
  const configService = app.get(ConfigService);

  // Configure app with the same settings as in main.ts
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: configService.get('app.defaultVersion'),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const apiPrefix = configService.get('app.apiPrefix');
  app.setGlobalPrefix(apiPrefix);

  await app.init();
  return app;
}

export async function teardownTestApp(app: INestApplication): Promise<void> {
  await app.close();
}

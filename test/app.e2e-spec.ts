import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Configure versioning for tests
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/v1')
      .expect(200)
      .expect({ message: 'ghassan ghanimah' });
  });
});

import { AppModule } from '@/app.module';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('Profile Success', () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .expect(401);
  });

  it('Unauthorized', () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .expect(401)
      .expect({ statusCode: 401, message: 'Unauthorized' });
  });
});

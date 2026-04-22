/* eslint-disable */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import request from 'supertest';

import { AppModule } from '@/app.module';

interface LoginResponse {
  token: string;
}

describe('Posts (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let httpServer: any;

  const testUser = {
    email: 'post_test@example.com',
    username: 'post_user',
    password: 'Password123!',
    phoneNumber: '79997776655',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix('api');
    await app.init();
    httpServer = app.getHttpServer();

    // Регистрируем и логинимся
    await request(httpServer)
      .post('/api/users/register')
      .send(testUser);

    const loginRes = await request(httpServer)
      .post('/api/auth/login')
      .send({
        identifier: testUser.email,
        password: testUser.password,
      });

    accessToken = (loginRes.body as LoginResponse).token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/posts', () => {
    it('should create a post with an image', async () => {
      // Создаем фейковый файл для теста
      const buffer = Buffer.from('fake image content');

      return request(httpServer)
        .post('/api/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('content', 'Testing post creation')
        .attach('images', buffer, 'test.png')
        .expect(201)
        .expect((res) => {
          expect(res.body.content).toBe('Testing post creation');
          expect(res.body.images.length).toBe(1);
          expect(res.body.images[0].path).toContain('/uploads/');
        });
    });

    it('should return 400 if no image provided', () => {
      return request(httpServer)
        .post('/api/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('content', 'No images here')
        .expect(400);
    });
  });

  describe('GET /api/posts', () => {
    it('should return paginated feed', async () => {
      return request(httpServer)
        .get('/api/posts')
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body.posts).toBeDefined();
          expect(res.body.meta).toBeDefined();
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(10);
        });
    });
  });
});

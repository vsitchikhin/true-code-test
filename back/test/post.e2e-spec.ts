/* eslint-disable */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import request from 'supertest';

import { AppModule } from '@/app.module';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
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

    await request(httpServer).post('/api/users/register').send(testUser);

    const loginRes = await request(httpServer).post('/api/auth/login').send({
      identifier: testUser.email,
      password: testUser.password,
    });

    accessToken = (loginRes.body as LoginResponse).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/posts', () => {
    it('should create a post with an image', async () => {
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

  describe('PATCH /api/posts/:id', () => {
    it('should update post content and add images', async () => {
      const createRes = await request(httpServer)
        .post('/api/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('content', 'Initial content')
        .attach('images', Buffer.from('img1'), 'img1.png');

      const postId = createRes.body.id;

      await request(httpServer)
        .patch(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .field('content', 'Updated content')
        .attach('images', Buffer.from('img2'), 'img2.png')
        .expect(200);

      const feedRes = await request(httpServer).get('/api/posts').expect(200);

      const updatedPost = feedRes.body.posts.find((p: any) => p.id === postId);
      expect(updatedPost.content).toBe('Updated content');
      expect(updatedPost.images.length).toBe(2);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete own post', async () => {
      const createRes = await request(httpServer)
        .post('/api/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('content', 'To be deleted')
        .attach('images', Buffer.from('img'), 'del.png');

      const postId = createRes.body.id;

      await request(httpServer)
        .delete(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      const feedRes = await request(httpServer).get('/api/posts').expect(200);

      const deletedPost = feedRes.body.posts.find((p: any) => p.id === postId);
      expect(deletedPost).toBeUndefined();
    });

    it('should return 404 for non-existent post', () => {
      return request(httpServer)
        .delete('/api/posts/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});

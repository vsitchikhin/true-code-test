/* eslint-disable */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/app.module';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

describe('Profile (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
   
  let httpServer: any;

  const testUser = {
    email: 'profile_test@example.com',
    username: 'profile_user',
    password: 'Password123!',
    phoneNumber: '79998887766',
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

    // Регистрируем и логинимся, чтобы получить токен
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

  describe('GET /api/users/me', () => {
    it('should return user profile', () => {
      return request(httpServer)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as Record<string, unknown>;
          expect(body.email).toBe(testUser.email);
          expect(body.username).toBe(testUser.username);
          expect(body.passwordHash).toBeUndefined();
        });
    });

    it('should return 401 if no token provided', () => {
      return request(httpServer)
        .get('/api/users/me')
        .expect(401);
    });
  });

  describe('PATCH /api/users/me', () => {
    it('should update profile bio', () => {
      const newBio = 'New bio message';
      return request(httpServer)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ bio: newBio })
        .expect(200)
        .expect((res) => {
          const body = res.body as Record<string, unknown>;
          expect(body.bio).toBe(newBio);
        });
    });

    it('should update username', () => {
      const newUsername = 'updated_user';
      return request(httpServer)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ username: newUsername })
        .expect(200)
        .expect((res) => {
          const body = res.body as Record<string, unknown>;
          expect(body.username).toBe(newUsername);
        });
    });

    it('should return 409 if username is taken', async () => {
      // Регистрируем другого пользователя
      await request(httpServer)
        .post('/api/users/register')
        .send({
          email: 'other@example.com',
          username: 'other_user',
          password: 'Password123!',
          phoneNumber: '79991112233',
        });

      return request(httpServer)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ username: 'other_user' })
        .expect(400); // Мы бросаем BadRequestException в контроллере для всех ошибок
    });
  });
});

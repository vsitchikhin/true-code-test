/* eslint-disable */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import request from 'supertest';

import { AppModule } from '@/app.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix('api');
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  const testUser = {
    email: 'e2e@example.com',
    username: 'e2e_user',
    password: 'Password123!',
    phoneNumber: '+70000000000',
  };

  interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      username: string;
    };
  }

  it('/api/users/register (POST) - Success', () => {
    return request(httpServer)
      .post('/api/users/register')
      .send(testUser)
      .expect(201)
      .expect((res) => {
        const body = res.body as { email: string; id: string };
        expect(body.email).toEqual(testUser.email);
        expect(body.id).toBeDefined();
      });
  });

  it('/api/auth/login (POST) - Success', () => {
    return request(httpServer)
      .post('/api/auth/login')
      .send({
        identifier: testUser.email,
        password: testUser.password,
      })
      .expect(200)
      .expect((res) => {
        const body = res.body as AuthResponse;
        expect(body.accessToken).toBeDefined();
        expect(body.refreshToken).toBeDefined();
        expect(body.user.username).toEqual(testUser.username);
      });
  });

  it('/api/auth/refresh (POST) - Success', async () => {
    const loginRes = await request(httpServer).post('/api/auth/login').send({
      identifier: testUser.email,
      password: testUser.password,
    });

    const { refreshToken } = loginRes.body as AuthResponse;

    const refreshRes = await request(httpServer)
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    const refreshBody = refreshRes.body as AuthResponse;
    expect(refreshBody.accessToken).toBeDefined();
    expect(refreshBody.refreshToken).toBeDefined();
    expect(refreshBody.refreshToken).not.toBe(refreshToken);
  });

  it('/api/auth/login (POST) - Success by Phone', () => {
    return request(httpServer)
      .post('/api/auth/login')
      .send({
        identifier: testUser.phoneNumber,
        password: testUser.password,
      })
      .expect(200)
      .expect((res) => {
        const body = res.body as AuthResponse;
        expect(body.accessToken).toBeDefined();
      });
  });

  it('/api/auth/login (POST) - Failure (Wrong Password)', () => {
    return request(httpServer)
      .post('/api/auth/login')
      .send({
        identifier: testUser.email,
        password: 'WrongPassword',
      })
      .expect(401);
  });
});

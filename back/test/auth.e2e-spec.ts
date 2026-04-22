import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import request from 'supertest';


import { AppModule } from '@/app.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix('api');
    await app.init();
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
    email: string;
    id: string;
    token: string;
    user: {
      username: string;
    };
  }

  it('/api/users/register (POST) - Success', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .post('/api/users/register')
      .send(testUser)
      .expect(201)
      .expect((res) => {
        const body = res.body as AuthResponse;
        expect(body.email).toEqual(testUser.email);
        expect(body.id).toBeDefined();
      });
  });

  it('/api/auth/login (POST) - Success', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        identifier: testUser.email,
        password: testUser.password,
      })
      .expect(200)
      .expect((res) => {
        const body = res.body as AuthResponse;
        expect(body.token).toBeDefined();
        expect(body.user.username).toEqual(testUser.username);
      });
  });

  it('/api/auth/login (POST) - Success by Phone', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        identifier: testUser.phoneNumber,
        password: testUser.password,
      })
      .expect(200)
      .expect((res) => {
        const body = res.body as AuthResponse;
        expect(body.token).toBeDefined();
      });
  });

  it('/api/auth/login (POST) - Failure (Wrong Password)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        identifier: testUser.email,
        password: 'WrongPassword',
      })
      .expect(401);
  });
});

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import * as Joi from 'joi';

import { AuthModule } from '@infrastructure/ioc/auth.module';
import { PostModule } from '@infrastructure/ioc/post.module';
import { UserModule } from '@infrastructure/ioc/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        DB_HOST: Joi.string().when('NODE_ENV', { is: 'test', then: Joi.optional(), otherwise: Joi.required() }),
        DB_PORT: Joi.number().default(5432),
        DB_USER: Joi.string().when('NODE_ENV', { is: 'test', then: Joi.optional(), otherwise: Joi.required() }),
        DB_PASSWORD: Joi.string().when('NODE_ENV', { is: 'test', then: Joi.optional(), otherwise: Joi.required() }),
        DB_NAME: Joi.string().when('NODE_ENV', { is: 'test', then: Joi.optional(), otherwise: Joi.required() }),
        JWT_SECRET: Joi.string().required(),
        PORT: Joi.number().default(3000),
        ALLOWED_ORIGINS: Joi.string().required(),
        BCRYPT_SALT_ROUNDS: Joi.number().default(10),
        PASSWORD_PEPPER: Joi.string().required(),
      }),
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isTest = config.get('NODE_ENV') === 'test';

        if (isTest) {
          return {
            type: 'better-sqlite3',
            database: ':memory:',
            autoLoadEntities: true,
            synchronize: true,
          };
        }

        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get<string>('DB_USER'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),

    UserModule,
    AuthModule,
    PostModule,
  ],
})
export class AppModule { }

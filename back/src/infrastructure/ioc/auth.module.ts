import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { LoginUseCase } from '@application/use-cases/login.use-case';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { IAuthService } from '@domain/services/auth-service.interface';
import { IPasswordHasher } from '@domain/services/password-hasher.interface';
import { UserModule } from '@infrastructure/ioc/user.module';
import { JwtStrategy } from '@infrastructure/security/jwt.strategy';
import { NestJwtAuthService } from '@infrastructure/security/nest-jwt-auth.service';

@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '24h', // Токен будет жить сутки
        },
      }),
    }),
  ],
  providers: [
    JwtStrategy,
    {
      provide: 'IAuthService',
      useClass: NestJwtAuthService,
    },
    {
      provide: LoginUseCase,
      useFactory: (
        userRepository: IUserRepository,
        passwordHasher: IPasswordHasher,
        authService: IAuthService,
      ) => {
        return new LoginUseCase(userRepository, passwordHasher, authService);
      },
      inject: ['IUserRepository', 'IPasswordHasher', 'IAuthService'],
    },
  ],
  exports: [LoginUseCase, 'IAuthService'],
})
export class AuthModule {}

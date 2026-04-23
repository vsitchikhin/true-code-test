import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { LoginUseCase } from '@application/use-cases/login.use-case';
import { LogoutUseCase } from '@application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from '@application/use-cases/refresh-token.use-case';
import { UserModule } from '@infrastructure/ioc/user.module';
import { JwtStrategy } from '@infrastructure/security/jwt.strategy';
import { NestJwtAuthService } from '@infrastructure/security/nest-jwt-auth.service';
import { AuthController } from '@presentation/controllers/auth.controller';

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
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    {
      provide: 'IAuthService',
      useClass: NestJwtAuthService,
    },
    LoginUseCase,
    LogoutUseCase,
    RefreshTokenUseCase,
  ],
  exports: [LoginUseCase, LogoutUseCase, RefreshTokenUseCase, 'IAuthService'],
})
export class AuthModule {}

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import type { Response } from 'express';

import { LoginUseCase } from '@application/use-cases/login.use-case';
import { LogoutUseCase } from '@application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from '@application/use-cases/refresh-token.use-case';
import { JwtAuthGuard } from '@infrastructure/security/jwt-auth.guard';
import { CurrentUser } from '@presentation/decorators/current-user.decorator';
import { AuthResponseDto } from '@presentation/dtos/auth-response.dto';
import { LoginDto } from '@presentation/dtos/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly configService: ConfigService,
  ) {}

  private parseTimeToMs(time: string): number {
    const unit = time.slice(-1);
    const value = parseInt(time.slice(0, -1), 10);
    switch (unit) {
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      case 's':
        return value * 1000;
      default:
        return value;
    }
  }

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    const accessExpiration = this.configService.get<string>('JWT_ACCESS_EXPIRATION') ?? '15m';
    const refreshExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION') ?? '7d';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: this.parseTimeToMs(accessExpiration),
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: this.parseTimeToMs(refreshExpiration),
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Авторизация пользователя' })
  @ApiResponse({ status: 200, description: 'Успешная авторизация', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    try {
      const result = await this.loginUseCase.execute(loginDto);
      this.setCookies(res, result.accessToken, result.refreshToken);
      return result;
    } catch (error) {
      throw new UnauthorizedException((error as Error).message);
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновление токенов' })
  @ApiResponse({ status: 200, description: 'Токены успешно обновлены', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Невалидный refresh-токен' })
  async refresh(
    @Body('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.refreshTokenUseCase.execute({ refreshToken });
    this.setCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Выход из системы' })
  @ApiResponse({ status: 204, description: 'Успешный выход' })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  async logout(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    await this.logoutUseCase.execute({ userId });
  }
}

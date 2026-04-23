import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

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
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Авторизация пользователя' })
  @ApiResponse({ status: 200, description: 'Успешная авторизация', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.loginUseCase.execute(loginDto);
    } catch (error) {
      throw new UnauthorizedException((error as Error).message);
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновление токенов' })
  @ApiResponse({ status: 200, description: 'Токены успешно обновлены', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Невалидный refresh-токен' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.refreshTokenUseCase.execute({ refreshToken });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Выход из системы' })
  @ApiResponse({ status: 204, description: 'Успешный выход' })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  async logout(@CurrentUser('id') userId: string): Promise<void> {
    await this.logoutUseCase.execute({ userId });
  }
}

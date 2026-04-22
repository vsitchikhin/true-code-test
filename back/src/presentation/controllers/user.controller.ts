import { Controller, Post, Get, Patch, Body, BadRequestException, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { GetProfileUseCase } from '@application/use-cases/get-profile.use-case';
import { RegisterUserUseCase } from '@application/use-cases/register-user.use-case';
import { UpdateProfileUseCase } from '@application/use-cases/update-profile.use-case';
import { JwtAuthGuard } from '@infrastructure/security/jwt-auth.guard';
import { CurrentUser } from '@presentation/decorators/current-user.decorator';
import { RegisterUserDto } from '@presentation/dtos/register-user.dto';
import { UpdateProfileDto } from '@presentation/dtos/update-profile.dto';
import { UserResponseDto } from '@presentation/dtos/user-response.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
  ) { }

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Ошибка валидации или дубликат данных' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(@Body() dto: RegisterUserDto): Promise<UserResponseDto> {
    try {
      const user = await this.registerUserUseCase.execute(dto);
      return UserResponseDto.fromDomain(user);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Получение профиля текущего пользователя' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  async getMe(@CurrentUser('id') userId: string): Promise<UserResponseDto> {
    const user = await this.getProfileUseCase.execute(userId);
    return UserResponseDto.fromDomain(user);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Обновление профиля текущего пользователя' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  @UsePipes(new ValidationPipe({ transform: true, skipMissingProperties: true }))
  async updateMe(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    try {
      const user = await this.updateProfileUseCase.execute({
        userId,
        ...dto,
      });
      return UserResponseDto.fromDomain(user);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}

import { Controller, Post, Body, BadRequestException, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { RegisterUserUseCase } from '@application/use-cases/register-user.use-case';
import { RegisterUserDto } from '@presentation/dtos/register-user.dto';
import { UserResponseDto } from '@presentation/dtos/user-response.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

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
}

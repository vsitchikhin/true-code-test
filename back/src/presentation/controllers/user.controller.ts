import { randomUUID } from 'node:crypto';
import { extname } from 'path';

import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  BadRequestException,
  UsePipes,
  ValidationPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { diskStorage } from 'multer';

import { GetProfileUseCase } from '@application/use-cases/get-profile.use-case';
import { RegisterUserUseCase } from '@application/use-cases/register-user.use-case';
import { UpdateAvatarUseCase } from '@application/use-cases/update-avatar.use-case';
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
    private readonly updateAvatarUseCase: UpdateAvatarUseCase,
  ) {}

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

  @Patch('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Обновление аватара пользователя' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (_req, file, cb) => {
          const uniqueSuffix = randomUUID();
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async updateAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UserResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const avatarPath = `/uploads/avatars/${file.filename}`;
    await this.updateAvatarUseCase.execute({
      userId,
      avatarPath,
    });

    const user = await this.getProfileUseCase.execute(userId);
    return UserResponseDto.fromDomain(user);
  }
}

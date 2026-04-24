import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { GetProfileByUsernameUseCase } from '@application/use-cases/get-profile-by-username.use-case';
import { GetProfileUseCase } from '@application/use-cases/get-profile.use-case';
import { RegisterUserUseCase } from '@application/use-cases/register-user.use-case';
import { UpdateAvatarUseCase } from '@application/use-cases/update-avatar.use-case';
import { UpdateProfileUseCase } from '@application/use-cases/update-profile.use-case';
import { PostImageOrmEntity } from '@infrastructure/persistence/typeorm/entities/post-image.orm-entity';
import { PostOrmEntity } from '@infrastructure/persistence/typeorm/entities/post.orm-entity';
import { UserOrmEntity } from '@infrastructure/persistence/typeorm/entities/user.orm-entity';
import { TypeOrmUserRepository } from '@infrastructure/persistence/typeorm/repositories/typeorm-user.repository';
import { BcryptHasher } from '@infrastructure/security/bcrypt-hasher';
import { UserController } from '@presentation/controllers/user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity, PostOrmEntity, PostImageOrmEntity])],
  controllers: [UserController],
  providers: [
    {
      provide: 'IUserRepository',
      useFactory: (repository: Repository<UserOrmEntity>) => {
        return new TypeOrmUserRepository(repository);
      },
      inject: [getRepositoryToken(UserOrmEntity)],
    },
    {
      provide: 'IPasswordHasher',
      useFactory: (configService: ConfigService) => {
        const rounds = configService.get<number>('BCRYPT_SALT_ROUNDS') || 10;
        const pepper = configService.get<string>('PASSWORD_PEPPER');
        return new BcryptHasher(rounds, pepper || '');
      },
      inject: [ConfigService],
    },
    RegisterUserUseCase,
    GetProfileUseCase,
    GetProfileByUsernameUseCase,
    UpdateProfileUseCase,
    UpdateAvatarUseCase,
  ],
  exports: [
    RegisterUserUseCase,
    GetProfileUseCase,
    GetProfileByUsernameUseCase,
    UpdateProfileUseCase,
    UpdateAvatarUseCase,
    'IUserRepository',
    'IPasswordHasher',
  ],
})
export class UserModule {}

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { RegisterUserUseCase } from '@application/use-cases/register-user.use-case';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { IPasswordHasher } from '@domain/services/password-hasher.interface';
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
    {
      provide: RegisterUserUseCase,
      useFactory: (userRepository: IUserRepository, passwordHasher: IPasswordHasher) => {
        return new RegisterUserUseCase(userRepository, passwordHasher);
      },
      inject: ['IUserRepository', 'IPasswordHasher'],
    },
  ],
  exports: [RegisterUserUseCase],
})
export class UserModule {}

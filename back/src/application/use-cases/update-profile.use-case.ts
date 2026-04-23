import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';

import { User } from '@domain/entities/user.entity';
import type { IUserRepository } from '@domain/repositories/user.repository.interface';

export interface UpdateProfileCommand {
  userId: string;
  username?: string;
  bio?: string;
  avatarPath?: string;
}

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: UpdateProfileCommand): Promise<User> {
    const user = await this.userRepository.findById(command.userId);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (command.username && command.username !== user.username) {
      const existingUser = await this.userRepository.findByUsername(command.username);
      if (existingUser) {
        throw new ConflictException('Имя пользователя уже занято');
      }
      user.username = command.username;
    }

    if (command.bio !== undefined) {
      user.bio = command.bio;
    }

    if (command.avatarPath !== undefined) {
      user.avatarPath = command.avatarPath;
    }

    return await this.userRepository.save(user);
  }
}

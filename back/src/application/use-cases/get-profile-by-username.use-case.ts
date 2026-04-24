import { Injectable, NotFoundException, Inject } from '@nestjs/common';

import { User } from '@domain/entities/user.entity';
import type { IUserRepository } from '@domain/repositories/user.repository.interface';

@Injectable()
export class GetProfileByUsernameUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(username: string): Promise<User> {
    const user = await this.userRepository.findByUsername(username);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }
}

import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';

import type { IUserRepository } from '@domain/repositories/user.repository.interface';

export interface LogoutCommand {
  userId: string;
}

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    user.refreshTokenHash = null;
    await this.userRepository.save(user);
  }
}

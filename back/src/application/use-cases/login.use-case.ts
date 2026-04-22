import { Injectable, Inject } from '@nestjs/common';

import type { IUserRepository } from '@domain/repositories/user.repository.interface';
import type { IAuthService } from '@domain/services/auth-service.interface';
import type { IPasswordHasher } from '@domain/services/password-hasher.interface';

export interface LoginCommand {
  identifier: string; // email or username or phone number
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IPasswordHasher')
    private readonly passwordHasher: IPasswordHasher,
    @Inject('IAuthService')
    private readonly authService: IAuthService,
  ) { }

  async execute(command: LoginCommand): Promise<LoginResponse> {
    let user = await this.userRepository.findByEmail(command.identifier);
    if (!user) {
      user = await this.userRepository.findByUsername(command.identifier);
    }
    if (!user) {
      user = await this.userRepository.findByPhoneNumber(command.identifier);
    }

    if (!user) {
      throw new Error('Некорректный логин или пароль');
    }

    const isPasswordValid = await this.passwordHasher.compare(command.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Некорректный логин или пароль');
    }

    const token = await this.authService.generateToken({
      userId: user.id,
      username: user.username,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }
}

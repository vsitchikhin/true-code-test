import { randomUUID } from 'node:crypto';

import { Injectable, Inject } from '@nestjs/common';

import { User } from '@domain/entities/user.entity';
import type { IUserRepository } from '@domain/repositories/user.repository.interface';
import type { IPasswordHasher } from '@domain/services/password-hasher.interface';

export interface RegisterUserCommand {
  email: string;
  username: string;
  password: string;
  phoneNumber: string;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IPasswordHasher')
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(command: RegisterUserCommand): Promise<User> {
    const existingEmail = await this.userRepository.findByEmail(command.email);
    if (existingEmail) {
      throw new Error('Пользователь с таким email уже существует');
    }

    const existingPhoneNumber = await this.userRepository.findByPhoneNumber(command.phoneNumber);
    if (existingPhoneNumber) {
      throw new Error('Пользователь с таким номером телефона уже существует');
    }

    const existingUsername = await this.userRepository.findByUsername(command.username);
    if (existingUsername) {
      throw new Error('Пользователь с таким именем пользователя уже существует');
    }

    const passwordHash = await this.passwordHasher.hash(command.password);

    const user = new User(
      randomUUID(),
      command.email,
      command.username,
      passwordHash,
      command.phoneNumber,
    );

    return this.userRepository.save(user);
  }
}

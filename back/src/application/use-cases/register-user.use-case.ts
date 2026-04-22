import { v4 as uuidv4 } from 'uuid';

import { User } from '@domain/entities/user.entity';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { IPasswordHasher } from '@domain/services/password-hasher.interface';

export interface RegisterUserCommand {
  email: string;
  username: string;
  password: string;
  phoneNumber: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) { }

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
      uuidv4(),
      command.email,
      command.username,
      passwordHash,
      command.phoneNumber,
    );

    return this.userRepository.save(user);
  }
}

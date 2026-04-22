import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { IAuthService } from '@domain/services/auth-service.interface';
import { IPasswordHasher } from '@domain/services/password-hasher.interface';

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

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
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

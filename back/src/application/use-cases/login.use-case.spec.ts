import { User } from '@domain/entities/user.entity';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { IAuthService } from '@domain/services/auth-service.interface';
import { IPasswordHasher } from '@domain/services/password-hasher.interface';

import { LoginUseCase, LoginCommand } from './login.use-case';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;
  let authService: jest.Mocked<IAuthService>;

  const mockUser = new User(
    'uuid',
    'test@example.com',
    'testuser',
    'hashed_password',
    '+79991112233',
  );

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      findByPhoneNumber: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
    };

    passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    authService = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    useCase = new LoginUseCase(userRepository, passwordHasher, authService);
  });

  it('should login successfully using email', async () => {
    const command: LoginCommand = {
      identifier: 'test@example.com',
      password: 'password123',
    };

    userRepository.findByEmail.mockResolvedValue(mockUser);
    passwordHasher.compare.mockResolvedValue(true);
    authService.generateAccessToken.mockResolvedValue('access_token');
    authService.generateRefreshToken.mockResolvedValue('refresh_token');
    passwordHasher.hash.mockResolvedValue('refresh_token_hash');

    const result = await useCase.execute(command);

    expect(result.accessToken).toBe('access_token');
    expect(result.refreshToken).toBe('refresh_token');
    expect(result.user.email).toBe(mockUser.email);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userRepository.findByEmail).toHaveBeenCalledWith(command.identifier);
  });

  it('should login successfully using username', async () => {
    const command: LoginCommand = {
      identifier: 'testuser',
      password: 'password123',
    };

    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByUsername.mockResolvedValue(mockUser);
    passwordHasher.compare.mockResolvedValue(true);
    authService.generateAccessToken.mockResolvedValue('access_token');
    authService.generateRefreshToken.mockResolvedValue('refresh_token');
    passwordHasher.hash.mockResolvedValue('refresh_token_hash');

    const result = await useCase.execute(command);

    expect(result.accessToken).toBe('access_token');
    expect(result.refreshToken).toBe('refresh_token');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userRepository.findByUsername).toHaveBeenCalledWith(command.identifier);
  });

  it('should login successfully using phone number', async () => {
    const command: LoginCommand = {
      identifier: '+79991112233',
      password: 'password123',
    };

    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.findByPhoneNumber.mockResolvedValue(mockUser);
    passwordHasher.compare.mockResolvedValue(true);
    authService.generateAccessToken.mockResolvedValue('access_token');
    authService.generateRefreshToken.mockResolvedValue('refresh_token');
    passwordHasher.hash.mockResolvedValue('refresh_token_hash');

    const result = await useCase.execute(command);

    expect(result.accessToken).toBe('access_token');
    expect(result.refreshToken).toBe('refresh_token');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userRepository.findByPhoneNumber).toHaveBeenCalledWith(command.identifier);
  });

  it('should throw error when user is not found', async () => {
    const command: LoginCommand = {
      identifier: 'nonexistent',
      password: 'password123',
    };

    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.findByPhoneNumber.mockResolvedValue(null);

    await expect(useCase.execute(command)).rejects.toThrow('Некорректный логин или пароль');
  });

  it('should throw error when password is invalid', async () => {
    const command: LoginCommand = {
      identifier: 'test@example.com',
      password: 'wrong_password',
    };

    userRepository.findByEmail.mockResolvedValue(mockUser);
    passwordHasher.compare.mockResolvedValue(false);

    await expect(useCase.execute(command)).rejects.toThrow('Некорректный логин или пароль');
  });
});

import { UnauthorizedException } from '@nestjs/common';

import { User } from '@domain/entities/user.entity';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { IAuthService } from '@domain/services/auth-service.interface';
import { IPasswordHasher } from '@domain/services/password-hasher.interface';

import { RefreshTokenUseCase } from './refresh-token.use-case';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let authService: jest.Mocked<IAuthService>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;

  const mockUser = new User(
    'user-id',
    'test@example.com',
    'testuser',
    'hash',
    '7000',
    null,
    null,
    null,
    null,
    'old-refresh-hash',
  );

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
      findByEmail: jest.fn(),
      findByPhoneNumber: jest.fn(),
      findByUsername: jest.fn(),
    };

    authService = {
      verifyRefreshToken: jest.fn(),
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
    } as unknown as jest.Mocked<IAuthService>;

    passwordHasher = {
      compare: jest.fn(),
      hash: jest.fn(),
    };

    useCase = new RefreshTokenUseCase(userRepository, passwordHasher, authService);
  });

  it('должен успешно обновить токены', async () => {
    authService.verifyRefreshToken.mockResolvedValue({ userId: 'user-id', username: 'testuser' });
    userRepository.findById.mockResolvedValue(mockUser);
    passwordHasher.compare.mockResolvedValue(true);
    authService.generateAccessToken.mockResolvedValue('new-access');
    authService.generateRefreshToken.mockResolvedValue('new-refresh');
    passwordHasher.hash.mockResolvedValue('new-refresh-hash');

    const result = await useCase.execute({ refreshToken: 'old-refresh' });

    expect(result.accessToken).toBe('new-access');
    expect(result.refreshToken).toBe('new-refresh');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userRepository.save).toHaveBeenCalled();
  });

  it('должен выбросить UnauthorizedException, если токен невалиден', async () => {
    authService.verifyRefreshToken.mockResolvedValue(null);

    await expect(useCase.execute({ refreshToken: 'invalid' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('должен выбросить UnauthorizedException, если хеш токена не совпадает', async () => {
    authService.verifyRefreshToken.mockResolvedValue({ userId: 'user-id', username: 'testuser' });
    userRepository.findById.mockResolvedValue(mockUser);
    passwordHasher.compare.mockResolvedValue(false);

    await expect(useCase.execute({ refreshToken: 'wrong-token' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});

/* eslint-disable */
import { RefreshTokenUseCase } from './refresh-token.use-case';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { IAuthService } from '@domain/services/auth-service.interface';
import { IPasswordHasher } from '@domain/services/password-hasher.interface';
import { User } from '@domain/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';

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
    'old-refresh-hash',
  );

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as any;

    authService = {
      verifyRefreshToken: jest.fn(),
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
    } as any;

    passwordHasher = {
      compare: jest.fn(),
      hash: jest.fn(),
    } as any;

    useCase = new RefreshTokenUseCase(userRepository, passwordHasher, authService);
  });

  it('should refresh tokens successfully', async () => {
    authService.verifyRefreshToken.mockResolvedValue({ userId: 'user-id', username: 'testuser' });
    userRepository.findById.mockResolvedValue(mockUser);
    passwordHasher.compare.mockResolvedValue(true);
    authService.generateAccessToken.mockResolvedValue('new-access');
    authService.generateRefreshToken.mockResolvedValue('new-refresh');
    passwordHasher.hash.mockResolvedValue('new-refresh-hash');

    const result = await useCase.execute({ refreshToken: 'old-refresh' });

    expect(result.accessToken).toBe('new-access');
    expect(result.refreshToken).toBe('new-refresh');
    expect(userRepository.save).toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    authService.verifyRefreshToken.mockResolvedValue(null);

    await expect(useCase.execute({ refreshToken: 'invalid' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if token hash does not match', async () => {
    authService.verifyRefreshToken.mockResolvedValue({ userId: 'user-id', username: 'testuser' });
    userRepository.findById.mockResolvedValue(mockUser);
    passwordHasher.compare.mockResolvedValue(false);

    await expect(useCase.execute({ refreshToken: 'wrong-token' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});

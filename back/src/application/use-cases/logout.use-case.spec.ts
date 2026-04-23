/* eslint-disable */
import { UnauthorizedException } from '@nestjs/common';

import { User } from '@domain/entities/user.entity';
import { IUserRepository } from '@domain/repositories/user.repository.interface';

import { LogoutUseCase } from './logout.use-case';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  const mockUser = new User(
    'user-id',
    'test@example.com',
    'testuser',
    'hash',
    '7000',
    null,
    null,
    'some-refresh-hash',
  );

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as any;

    useCase = new LogoutUseCase(userRepository);
  });

  it('should clear refreshTokenHash and save user', async () => {
    userRepository.findById.mockResolvedValue({ ...mockUser, refreshTokenHash: 'some-hash' });
    userRepository.save.mockResolvedValue(mockUser);

    await useCase.execute({ userId: 'user-id' });

    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ refreshTokenHash: null }),
    );
  });

  it('should throw UnauthorizedException if user not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ userId: 'unknown-id' })).rejects.toThrow(UnauthorizedException);
  });
});

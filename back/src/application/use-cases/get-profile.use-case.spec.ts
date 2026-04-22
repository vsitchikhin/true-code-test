/* eslint-disable */
import { NotFoundException } from '@nestjs/common';

import { User } from '@domain/entities/user.entity';
import { IUserRepository } from '@domain/repositories/user.repository.interface';

import { GetProfileUseCase } from './get-profile.use-case';

describe('GetProfileUseCase', () => {
  let useCase: GetProfileUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      findByPhoneNumber: jest.fn(),
      save: jest.fn(),
    };

    useCase = new GetProfileUseCase(userRepository);
  });

  it('should return user when found', async () => {
    const userId = 'user-123';
    const user = new User(userId, 'test@test.com', 'testuser', 'hash', '123');
    userRepository.findById.mockResolvedValue(user);

    const result = await useCase.execute(userId);

    expect(result).toBe(user);

    expect(userRepository.findById).toHaveBeenCalledWith(userId);
  });

  it('should throw NotFoundException when user not found', async () => {
    const userId = 'non-existent';
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(userId)).rejects.toThrow(NotFoundException);
  });
});

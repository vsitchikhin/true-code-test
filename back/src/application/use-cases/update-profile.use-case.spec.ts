/* eslint-disable */
import { NotFoundException, ConflictException } from '@nestjs/common';

import { User } from '@domain/entities/user.entity';
import { IUserRepository } from '@domain/repositories/user.repository.interface';

import { UpdateProfileUseCase, UpdateProfileCommand } from './update-profile.use-case';

describe('UpdateProfileUseCase', () => {
  let useCase: UpdateProfileUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByUsername: jest.fn(),
      save: jest.fn(),
      findByEmail: jest.fn(),
      findByPhoneNumber: jest.fn(),
    };

    useCase = new UpdateProfileUseCase(userRepository);
  });

  it('should successfully update user bio and avatar', async () => {
    const userId = 'user-1';
    const user = new User(userId, 'test@test.com', 'testuser', 'hash', '123');
    userRepository.findById.mockResolvedValue(user);
    userRepository.save.mockImplementation((u) => Promise.resolve(u));

    const command: UpdateProfileCommand = {
      userId,
      bio: 'New bio',
      avatarPath: '/path/to/avatar.png',
    };

    const result = await useCase.execute(command);

    expect(result.bio).toBe('New bio');
    expect(result.avatarPath).toBe('/path/to/avatar.png');

    expect(userRepository.save).toHaveBeenCalled();
  });

  it('should update username when it is unique', async () => {
    const userId = 'user-1';
    const user = new User(userId, 'test@test.com', 'oldname', 'hash', '123');
    userRepository.findById.mockResolvedValue(user);
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.save.mockImplementation((u) => Promise.resolve(u));

    const command: UpdateProfileCommand = {
      userId,
      username: 'newname',
    };

    const result = await useCase.execute(command);

    expect(result.username).toBe('newname');

    expect(userRepository.findByUsername).toHaveBeenCalledWith('newname');
  });

  it('should throw ConflictException if new username is taken', async () => {
    const userId = 'user-1';
    const user = new User(userId, 'test@test.com', 'oldname', 'hash', '123');
    const otherUser = new User('user-2', 'other@test.com', 'taken', 'hash', '456');

    userRepository.findById.mockResolvedValue(user);
    userRepository.findByUsername.mockResolvedValue(otherUser);

    const command: UpdateProfileCommand = {
      userId,
      username: 'taken',
    };

    await expect(useCase.execute(command)).rejects.toThrow(ConflictException);
  });

  it('should throw NotFoundException if user not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    const command: UpdateProfileCommand = {
      userId: 'non-existent',
      bio: 'hello',
    };

    await expect(useCase.execute(command)).rejects.toThrow(NotFoundException);
  });
});

/* eslint-disable */
import { UpdateAvatarUseCase } from './update-avatar.use-case';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { User } from '@domain/entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import * as fs from 'fs/promises';

jest.mock('fs/promises');

describe('UpdateAvatarUseCase', () => {
  let useCase: UpdateAvatarUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  const mockUser = new User(
    'user-id',
    'test@example.com',
    'testuser',
    'hash',
    '7000',
    null,
    '/uploads/avatars/old.png'
  );

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as any;

    useCase = new UpdateAvatarUseCase(userRepository);
    jest.clearAllMocks();
  });

  it('should update avatar path and attempt to delete old file', async () => {
    userRepository.findById.mockResolvedValue(mockUser);

    await useCase.execute({
      userId: 'user-id',
      avatarPath: '/uploads/avatars/new.png',
    });

    expect(mockUser.avatarPath).toBe('/uploads/avatars/new.png');
    expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    expect(fs.unlink).toHaveBeenCalled();
  });

  it('should throw NotFoundException if user not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({
      userId: 'ghost-id',
      avatarPath: 'path',
    })).rejects.toThrow(NotFoundException);
  });
});

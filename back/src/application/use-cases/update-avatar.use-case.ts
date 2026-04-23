import { unlink } from 'fs/promises';
import { join } from 'path';

import { Injectable, Inject, NotFoundException } from '@nestjs/common';

import type { IUserRepository } from '@domain/repositories/user.repository.interface';

export interface UpdateAvatarInput {
  userId: string;
  avatarPath: string;
}

@Injectable()
export class UpdateAvatarUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: UpdateAvatarInput): Promise<void> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.avatarPath) {
      try {
        const relativePath = user.avatarPath.replace(/^\/uploads\//, '');
        const absolutePath = join(process.cwd(), 'uploads', relativePath);
        await unlink(absolutePath);
      } catch (error) {
        console.error(`Failed to delete old avatar: ${user.avatarPath}`, error);
      }
    }

    user.avatarPath = input.avatarPath;
    await this.userRepository.save(user);
  }
}

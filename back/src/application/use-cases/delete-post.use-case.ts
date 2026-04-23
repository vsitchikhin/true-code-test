import { unlink } from 'fs/promises';
import { join } from 'path';

import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';

import { IPostRepository } from '@domain/repositories/post.repository.interface';

export interface DeletePostInput {
  postId: string;
  authorId: string;
}

@Injectable()
export class DeletePostUseCase {
  constructor(
    @Inject(IPostRepository)
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(input: DeletePostInput): Promise<void> {
    const post = await this.postRepository.findById(input.postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== input.authorId) {
      throw new ForbiddenException('You are not allowed to delete this post');
    }

    for (const image of post.images) {
      try {
        const relativePath = image.path.replace(/^\/uploads\//, '');
        const absolutePath = join(process.cwd(), 'uploads', relativePath);
        await unlink(absolutePath);
      } catch (error) {
        // Не кидаем ошибку, чтобы продолжить удаление поста из БД
        console.error(`Failed to delete file: ${image.path}`, error);
      }
    }

    await this.postRepository.delete(input.postId);
  }
}

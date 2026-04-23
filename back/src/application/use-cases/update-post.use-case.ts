import { unlink } from 'fs/promises';
import { randomUUID } from 'node:crypto';
import { join } from 'path';

import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { PostImage } from '@domain/entities/post-image.entity';
import { IPostRepository } from '@domain/repositories/post.repository.interface';

export interface UpdatePostInput {
  postId: string;
  authorId: string;
  content?: string;
  newImagePaths?: string[];
  imagesToRemoveIds?: string[];
}

@Injectable()
export class UpdatePostUseCase {
  constructor(
    @Inject(IPostRepository)
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(input: UpdatePostInput): Promise<void> {
    const post = await this.postRepository.findById(input.postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== input.authorId) {
      throw new ForbiddenException('You are not allowed to update this post');
    }

    if (input.content !== undefined) {
      post.content = input.content;
    }

    const removeCount = input.imagesToRemoveIds?.length ?? 0;
    const addCount = input.newImagePaths?.length ?? 0;
    const resultingCount = post.images.length - removeCount + addCount;

    if (resultingCount < 1) {
      throw new BadRequestException('Post must have at least one image');
    }
    if (resultingCount > 10) {
      throw new BadRequestException('Post cannot have more than 10 images');
    }

    // Удаляем помеченные изображения
    if (input.imagesToRemoveIds && input.imagesToRemoveIds.length > 0) {
      for (const imgId of input.imagesToRemoveIds) {
        const imgIndex = post.images.findIndex((img) => img.id === imgId);
        if (imgIndex !== -1) {
          const image = post.images[imgIndex];

          // Удаляем файл
          try {
            const relativePath = image.path.replace(/^\/uploads\//, '');
            const absolutePath = join(process.cwd(), 'uploads', relativePath);
            await unlink(absolutePath);
          } catch (error) {
            console.error(`Failed to delete file: ${image.path}`, error);
          }

          // Удаляем из списка
          post.images.splice(imgIndex, 1);
        }
      }
    }

    // Добавляем новые изображения
    if (input.newImagePaths && input.newImagePaths.length > 0) {
      const startOrder = post.images.length;
      const newImages = input.newImagePaths.map(
        (path, index) => new PostImage(randomUUID(), post.id, path, startOrder + index),
      );
      post.images.push(...newImages);
    }

    post.updatedAt = new Date();
    await this.postRepository.update(post);
  }
}

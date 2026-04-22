/* eslint-disable */
import { DeletePostUseCase } from './delete-post.use-case';
import { IPostRepository } from '@domain/repositories/post.repository.interface';
import { Post } from '@domain/entities/post.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import * as fs from 'fs/promises';

jest.mock('fs/promises');

describe('DeletePostUseCase', () => {
  let useCase: DeletePostUseCase;
  let postRepository: jest.Mocked<IPostRepository>;

  const mockPost = new Post(
    'post-id',
    'author-id',
    'Content',
    [],
    new Date(),
    new Date(),
  );

  beforeEach(() => {
    postRepository = {
      save: jest.fn(),
      findPaginated: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    } as any;

    useCase = new DeletePostUseCase(postRepository);
    jest.clearAllMocks();
  });

  it('should delete post successfully', async () => {
    postRepository.findById.mockResolvedValue(mockPost);

    await useCase.execute({
      postId: 'post-id',
      authorId: 'author-id',
    });

    expect(postRepository.delete).toHaveBeenCalledWith('post-id');
  });

  it('should throw NotFoundException if post does not exist', async () => {
    postRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({
      postId: 'invalid-id',
      authorId: 'author-id',
    })).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if user is not the author', async () => {
    postRepository.findById.mockResolvedValue(mockPost);

    await expect(useCase.execute({
      postId: 'post-id',
      authorId: 'wrong-author-id',
    })).rejects.toThrow(ForbiddenException);
  });
});

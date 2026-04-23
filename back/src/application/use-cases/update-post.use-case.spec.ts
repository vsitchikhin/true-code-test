/* eslint-disable */
import { UpdatePostUseCase } from './update-post.use-case';
import { IPostRepository } from '@domain/repositories/post.repository.interface';
import { Post } from '@domain/entities/post.entity';
import { PostImage } from '@domain/entities/post-image.entity';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('UpdatePostUseCase', () => {
  let useCase: UpdatePostUseCase;
  let postRepository: jest.Mocked<IPostRepository>;

  const createMockPost = (imageCount = 1) => {
    const images = Array.from(
      { length: imageCount },
      (_, i) => new PostImage(`img-${i + 1}`, 'post-id', `/uploads/old-${i + 1}.png`, i),
    );
    return new Post('post-id', 'author-id', 'Original Content', images, new Date(), new Date());
  };

  beforeEach(() => {
    postRepository = {
      save: jest.fn(),
      findPaginated: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    } as any;

    useCase = new UpdatePostUseCase(postRepository);
    jest.clearAllMocks();
  });

  it('should update post content', async () => {
    const mockPost = createMockPost();
    postRepository.findById.mockResolvedValue(mockPost);

    await useCase.execute({
      postId: 'post-id',
      authorId: 'author-id',
      content: 'New Content',
    });

    expect(postRepository.update).toHaveBeenCalled();
    const updatedPost = postRepository.update.mock.calls[0][0];
    expect(updatedPost.content).toBe('New Content');
  });

  it('should remove one image when post has multiple', async () => {
    const mockPost = createMockPost(2);
    postRepository.findById.mockResolvedValue(mockPost);

    await useCase.execute({
      postId: 'post-id',
      authorId: 'author-id',
      imagesToRemoveIds: ['img-1'],
    });

    const updatedPost = postRepository.update.mock.calls[0][0];
    expect(updatedPost.images.length).toBe(1);
  });

  it('should throw BadRequestException when removing last image without adding new', async () => {
    const mockPost = createMockPost(1);
    postRepository.findById.mockResolvedValue(mockPost);

    await expect(
      useCase.execute({
        postId: 'post-id',
        authorId: 'author-id',
        imagesToRemoveIds: ['img-1'],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when total images would exceed 10', async () => {
    const mockPost = createMockPost(10);
    postRepository.findById.mockResolvedValue(mockPost);

    await expect(
      useCase.execute({
        postId: 'post-id',
        authorId: 'author-id',
        newImagePaths: ['/uploads/new.png'],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should add new images to post', async () => {
    const mockPost = createMockPost(1);
    postRepository.findById.mockResolvedValue(mockPost);

    await useCase.execute({
      postId: 'post-id',
      authorId: 'author-id',
      newImagePaths: ['/uploads/new.png'],
    });

    const updatedPost = postRepository.update.mock.calls[0][0];
    expect(updatedPost.images.length).toBe(2); // Старая + новая
    expect(updatedPost.images[1].path).toBe('/uploads/new.png');
  });

  it('should throw ForbiddenException if user is not the author', async () => {
    const mockPost = createMockPost(1);
    postRepository.findById.mockResolvedValue(mockPost);

    await expect(
      useCase.execute({
        postId: 'post-id',
        authorId: 'intruder-id',
        content: 'Hacked',
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});

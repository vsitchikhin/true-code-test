/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { CreatePostUseCase, CreatePostCommand } from './create-post.use-case';
import { IPostRepository } from '@domain/repositories/post.repository.interface';
import { Post } from '@domain/entities/post.entity';

describe('CreatePostUseCase', () => {
  let useCase: CreatePostUseCase;
  let postRepository: jest.Mocked<IPostRepository>;

  beforeEach(async () => {
    const mockPostRepository = {
      save: jest.fn(),
      findPaginated: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePostUseCase,
        {
          provide: IPostRepository,
          useValue: mockPostRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreatePostUseCase>(CreatePostUseCase);
    postRepository = module.get(IPostRepository);
  });

  it('should create and save a new post with images', async () => {
    const command: CreatePostCommand = {
      authorId: 'user-123',
      content: 'Hello world',
      imagePaths: ['/uploads/img1.png', '/uploads/img2.png'],
    };

    postRepository.save.mockImplementation(async (post) => post);

    const result = await useCase.execute(command);

    expect(result).toBeInstanceOf(Post);
    expect(result.content).toBe(command.content);
    expect(result.authorId).toBe(command.authorId);
    expect(result.images).toHaveLength(2);
    expect(result.images[0].path).toBe(command.imagePaths[0]);
    expect(result.images[0].order).toBe(0);
    expect(result.images[1].order).toBe(1);

    expect(postRepository.save).toHaveBeenCalled();
  });
});

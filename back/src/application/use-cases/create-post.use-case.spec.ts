import { Test, TestingModule } from '@nestjs/testing';

import { Post } from '@domain/entities/post.entity';
import { IPostRepository } from '@domain/repositories/post.repository.interface';

import { CreatePostUseCase, CreatePostCommand } from './create-post.use-case';

describe('CreatePostUseCase', () => {
  let useCase: CreatePostUseCase;
  let postRepository: jest.Mocked<IPostRepository>;

  beforeEach(async () => {
    const mockPostRepository = {
      save: jest.fn(),
      findPaginated: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
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

  it('должен успешно создавать и сохранять пост с изображениями', async () => {
    const command: CreatePostCommand = {
      authorId: 'user-123',
      content: 'Привет, мир',
      imagePaths: ['/uploads/img1.png', '/uploads/img2.png'],
    };

    postRepository.save.mockImplementation((post) => Promise.resolve(post));

    const result = await useCase.execute(command);

    expect(result).toBeInstanceOf(Post);
    expect(result.content).toBe(command.content);
    expect(result.authorId).toBe(command.authorId);
    expect(result.images).toHaveLength(2);
    expect(result.images[0].path).toBe(command.imagePaths[0]);
    expect(result.images[0].order).toBe(0);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(postRepository.save).toHaveBeenCalled();
  });

  it('должен успешно создавать пост БЕЗ изображений', async () => {
    const command: CreatePostCommand = {
      authorId: 'user-123',
      content: 'Чисто текстовый пост',
      imagePaths: [],
    };

    postRepository.save.mockImplementation((post) => Promise.resolve(post));

    const result = await useCase.execute(command);

    expect(result).toBeInstanceOf(Post);
    expect(result.content).toBe(command.content);
    expect(result.images).toHaveLength(0);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(postRepository.save).toHaveBeenCalled();
  });
});

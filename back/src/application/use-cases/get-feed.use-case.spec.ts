import { Test, TestingModule } from '@nestjs/testing';

import { Post } from '@domain/entities/post.entity';
import { User } from '@domain/entities/user.entity';
import { IPostRepository } from '@domain/repositories/post.repository.interface';

import { GetFeedUseCase, GetFeedQuery } from './get-feed.use-case';

describe('GetFeedUseCase', () => {
  let useCase: GetFeedUseCase;
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
        GetFeedUseCase,
        {
          provide: IPostRepository,
          useValue: mockPostRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetFeedUseCase>(GetFeedUseCase);
    postRepository = module.get(IPostRepository);
  });

  it('должен возвращать посты с пагинацией и метаданными', async () => {
    const query: GetFeedQuery = { page: 1, limit: 10 };
    const mockAuthor = new User('author-1', 'u1@t.com', 'user1', 'p', '1', null, null, null);
    const mockPosts = [
      new Post('1', 'author-1', 'пост 1', [], new Date(), new Date(), mockAuthor),
      new Post('2', 'author-1', 'пост 2', [], new Date(), new Date(), mockAuthor),
    ];

    postRepository.findPaginated.mockResolvedValue({
      posts: mockPosts,
      total: 25,
    });

    const result = await useCase.execute(query);

    expect(result.posts).toHaveLength(2);
    expect(result.posts[0].author?.username).toBe('user1');
    expect(result.meta.total).toBe(25);
    expect(result.meta.totalPages).toBe(3); // ceil(25/10)
    expect(result.meta.page).toBe(1);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(postRepository.findPaginated).toHaveBeenCalledWith(1, 10);
  });

  it('должен корректно обрабатывать пустую ленту', async () => {
    postRepository.findPaginated.mockResolvedValue({
      posts: [],
      total: 0,
    });

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result.posts).toHaveLength(0);
    expect(result.meta.total).toBe(0);
    expect(result.meta.totalPages).toBe(0);
  });
});

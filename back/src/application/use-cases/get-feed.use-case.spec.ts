/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { GetFeedUseCase, GetFeedQuery } from './get-feed.use-case';
import { IPostRepository } from '@domain/repositories/post.repository.interface';
import { Post } from '@domain/entities/post.entity';

describe('GetFeedUseCase', () => {
  let useCase: GetFeedUseCase;
  let postRepository: jest.Mocked<IPostRepository>;

  beforeEach(async () => {
    const mockPostRepository = {
      save: jest.fn(),
      findPaginated: jest.fn(),
      findById: jest.fn(),
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

  it('should return paginated posts with metadata', async () => {
    const query: GetFeedQuery = { page: 1, limit: 10 };
    const mockPosts = [
      new Post('1', 'author-1', 'post 1', []),
      new Post('2', 'author-1', 'post 2', []),
    ];

    postRepository.findPaginated.mockResolvedValue({
      posts: mockPosts,
      total: 25,
    });

    const result = await useCase.execute(query);

    expect(result.posts).toHaveLength(2);
    expect(result.meta.total).toBe(25);
    expect(result.meta.totalPages).toBe(3); // ceil(25/10)
    expect(result.meta.page).toBe(1);
    
    expect(postRepository.findPaginated).toHaveBeenCalledWith(1, 10);
  });

  it('should handle empty feed', async () => {
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

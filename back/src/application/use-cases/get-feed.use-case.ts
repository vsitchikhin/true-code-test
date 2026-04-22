import { Injectable, Inject } from '@nestjs/common';

import { Post } from '@domain/entities/post.entity';
import { IPostRepository } from '@domain/repositories/post.repository.interface';

export interface GetFeedQuery {
  page: number;
  limit: number;
}

export interface GetFeedResponse {
  posts: Post[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class GetFeedUseCase {
  constructor(
    @Inject(IPostRepository)
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(query: GetFeedQuery): Promise<GetFeedResponse> {
    const { page, limit } = query;
    const { posts, total } = await this.postRepository.findPaginated(page, limit);

    return {
      posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

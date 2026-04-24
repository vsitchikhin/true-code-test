import { Injectable, Inject } from '@nestjs/common';

import { Post } from '@domain/entities/post.entity';
import { IPostRepository } from '@domain/repositories/post.repository.interface';

export interface GetPostsByUserIdQuery {
  userId: string;
  page: number;
  limit: number;
  order?: 'ASC' | 'DESC';
}

export interface GetPostsByUserIdResponse {
  posts: Post[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class GetPostsByUserIdUseCase {
  constructor(
    @Inject(IPostRepository)
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(query: GetPostsByUserIdQuery): Promise<GetPostsByUserIdResponse> {
    const { userId, page, limit, order = 'DESC' } = query;
    const { posts, total } = await this.postRepository.findByUserIdPaginated(
      userId,
      page,
      limit,
      order,
    );

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

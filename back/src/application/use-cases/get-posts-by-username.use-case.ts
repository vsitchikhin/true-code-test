import { Injectable, Inject } from '@nestjs/common';

import { Post } from '@domain/entities/post.entity';
import { IPostRepository } from '@domain/repositories/post.repository.interface';

export interface GetPostsByUsernameQuery {
  username: string;
  page: number;
  limit: number;
  order?: 'ASC' | 'DESC';
}

export interface GetPostsByUsernameResponse {
  posts: Post[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class GetPostsByUsernameUseCase {
  constructor(
    @Inject(IPostRepository)
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(query: GetPostsByUsernameQuery): Promise<GetPostsByUsernameResponse> {
    const { username, page, limit, order = 'DESC' } = query;
    const { posts, total } = await this.postRepository.findByUsernamePaginated(
      username,
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

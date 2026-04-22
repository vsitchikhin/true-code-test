import { Post } from '@domain/entities/post.entity';

export interface IPostRepository {
  save(post: Post): Promise<Post>;
  findPaginated(page: number, limit: number): Promise<{ posts: Post[], total: number }>;
  findById(id: string): Promise<Post | null>;
}

export const IPostRepository = Symbol('IPostRepository');

import { randomUUID } from 'node:crypto';

import { Injectable, Inject } from '@nestjs/common';

import { PostImage } from '@domain/entities/post-image.entity';
import { Post } from '@domain/entities/post.entity';
import { IPostRepository } from '@domain/repositories/post.repository.interface';

export interface CreatePostCommand {
  authorId: string;
  content: string;
  imagePaths: string[];
}

@Injectable()
export class CreatePostUseCase {
  constructor(
    @Inject(IPostRepository)
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<Post> {
    const postId = randomUUID();

    const images = command.imagePaths.map((path, index) => {
      return new PostImage(randomUUID(), postId, path, index);
    });

    const post = new Post(postId, command.authorId, command.content, images);

    return this.postRepository.save(post);
  }
}

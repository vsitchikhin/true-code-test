import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { PostImage } from '@domain/entities/post-image.entity';
import { Post } from '@domain/entities/post.entity';
import { User } from '@domain/entities/user.entity';
import { IPostRepository } from '@domain/repositories/post.repository.interface';
import { PostImageOrmEntity } from '@infrastructure/persistence/typeorm/entities/post-image.orm-entity';
import { PostOrmEntity } from '@infrastructure/persistence/typeorm/entities/post.orm-entity';
import { UserOrmEntity } from '@infrastructure/persistence/typeorm/entities/user.orm-entity';

@Injectable()
export class TypeOrmPostRepository implements IPostRepository {
  constructor(
    @InjectRepository(PostOrmEntity)
    private readonly postRepo: Repository<PostOrmEntity>,
    @InjectRepository(PostImageOrmEntity)
    private readonly imageRepo: Repository<PostImageOrmEntity>,
  ) {}

  async save(post: Post): Promise<Post> {
    const ormPost = new PostOrmEntity();
    ormPost.id = post.id;
    ormPost.authorId = post.authorId;
    ormPost.content = post.content;
    ormPost.createdAt = post.createdAt;
    ormPost.updatedAt = post.updatedAt;

    ormPost.author = { id: post.authorId } as UserOrmEntity;

    ormPost.images = post.images.map((img) => {
      const ormImg = new PostImageOrmEntity();
      ormImg.id = img.id;
      ormImg.postId = post.id;
      ormImg.path = img.path;
      ormImg.order = img.order;
      ormImg.createdAt = img.createdAt;
      ormImg.post = ormPost;
      return ormImg;
    });

    await this.postRepo.save(ormPost);

    return post;
  }

  async findPaginated(
    page: number,
    limit: number,
    order: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{ posts: Post[]; total: number }> {
    const [ormPosts, total] = await this.postRepo.findAndCount({
      relations: ['images', 'author'],
      order: { createdAt: order },
      skip: (page - 1) * limit,
      take: limit,
    });

    const posts = ormPosts.map((ormPost) => this.toDomain(ormPost));
    return { posts, total };
  }

  async findById(id: string): Promise<Post | null> {
    const ormPost = await this.postRepo.findOne({
      where: { id },
      relations: ['images'],
    });

    return ormPost ? this.toDomain(ormPost) : null;
  }

  async delete(id: string): Promise<void> {
    await this.postRepo.delete(id);
  }

  async update(post: Post): Promise<Post> {
    return this.save(post);
  }

  private toDomain(ormPost: PostOrmEntity): Post {
    const images =
      ormPost.images?.map(
        (img) => new PostImage(img.id, ormPost.id, img.path, img.order, img.createdAt),
      ) || [];

    const post = new Post(
      ormPost.id,
      ormPost.authorId,
      ormPost.content,
      images,
      ormPost.createdAt,
      ormPost.updatedAt,
    );

    if (ormPost.author) {
      post.author = new User(
        ormPost.author.id,
        ormPost.author.email,
        ormPost.author.username,
        ormPost.author.passwordHash,
        ormPost.author.phoneNumber,
        ormPost.author.bio,
        ormPost.author.avatarPath,
        ormPost.author.refreshTokenHash,
        ormPost.author.createdAt,
      );
    }

    return post;
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreatePostUseCase } from '@application/use-cases/create-post.use-case';
import { DeletePostUseCase } from '@application/use-cases/delete-post.use-case';
import { GetFeedUseCase } from '@application/use-cases/get-feed.use-case';
import { GetPostsByUserIdUseCase } from '@application/use-cases/get-posts-by-user-id.use-case';
import { GetPostsByUsernameUseCase } from '@application/use-cases/get-posts-by-username.use-case';
import { UpdatePostUseCase } from '@application/use-cases/update-post.use-case';
import { IPostRepository } from '@domain/repositories/post.repository.interface';
import { PostImageOrmEntity } from '@infrastructure/persistence/typeorm/entities/post-image.orm-entity';
import { PostOrmEntity } from '@infrastructure/persistence/typeorm/entities/post.orm-entity';
import { TypeOrmPostRepository } from '@infrastructure/persistence/typeorm/repositories/typeorm-post.repository';
import { PostController } from '@presentation/controllers/post.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PostOrmEntity, PostImageOrmEntity])],
  providers: [
    {
      provide: IPostRepository,
      useClass: TypeOrmPostRepository,
    },
    CreatePostUseCase,
    GetFeedUseCase,
    DeletePostUseCase,
    UpdatePostUseCase,
    GetPostsByUserIdUseCase,
    GetPostsByUsernameUseCase,
  ],
  controllers: [PostController],
  exports: [IPostRepository],
})
export class PostModule {}

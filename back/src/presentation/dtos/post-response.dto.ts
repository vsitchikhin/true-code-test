import { ApiProperty } from '@nestjs/swagger';

import { PostImage as PostImageEntity } from '@domain/entities/post-image.entity';
import { Post as PostEntity } from '@domain/entities/post.entity';

import { UserResponseDto } from './user-response.dto';

export class PostImageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  path: string;

  @ApiProperty()
  order: number;

  @ApiProperty()
  createdAt: Date;

  static fromDomain(image: PostImageEntity): PostImageResponseDto {
    const dto = new PostImageResponseDto();
    dto.id = image.id;
    dto.path = image.path;
    dto.order = image.order;
    dto.createdAt = image.createdAt;
    return dto;
  }
}

export class PostResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  authorId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: [PostImageResponseDto] })
  images: PostImageResponseDto[];

  @ApiProperty({ type: UserResponseDto, required: false })
  author?: UserResponseDto;

  static fromDomain(post: PostEntity): PostResponseDto {
    const dto = new PostResponseDto();
    dto.id = post.id;
    dto.content = post.content;
    dto.authorId = post.authorId;
    dto.createdAt = post.createdAt;
    dto.images = post.images.map((img: PostImageEntity) => PostImageResponseDto.fromDomain(img));
    if (post.author) {
      dto.author = UserResponseDto.fromDomain(post.author);
    }
    return dto;
  }
}

export class FeedMetaDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class FeedResponseDto {
  @ApiProperty({ type: [PostResponseDto] })
  posts: PostResponseDto[];

  @ApiProperty({ type: FeedMetaDto })
  meta: FeedMetaDto;
}

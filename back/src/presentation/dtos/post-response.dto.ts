import { ApiProperty } from '@nestjs/swagger';

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

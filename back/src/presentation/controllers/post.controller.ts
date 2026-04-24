import { randomUUID } from 'node:crypto';
import { extname } from 'path';

import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Query,
  BadRequestException,
  Delete,
  Param,
  HttpCode,
  Patch,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

import { diskStorage } from 'multer';

import { CreatePostUseCase } from '@application/use-cases/create-post.use-case';
import { DeletePostUseCase } from '@application/use-cases/delete-post.use-case';
import { GetFeedUseCase } from '@application/use-cases/get-feed.use-case';
import { GetPostsByUserIdUseCase } from '@application/use-cases/get-posts-by-user-id.use-case';
import { GetPostsByUsernameUseCase } from '@application/use-cases/get-posts-by-username.use-case';
import { UpdatePostUseCase } from '@application/use-cases/update-post.use-case';
import { JwtAuthGuard } from '@infrastructure/security/jwt-auth.guard';
import { CurrentUser } from '@presentation/decorators/current-user.decorator';
import { PostResponseDto } from '@presentation/dtos/post-response.dto';
import { FeedResponseDto } from '@presentation/dtos/post-response.dto';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly getFeedUseCase: GetFeedUseCase,
    private readonly deletePostUseCase: DeletePostUseCase,
    private readonly updatePostUseCase: UpdatePostUseCase,
    private readonly getPostsByUserIdUseCase: GetPostsByUserIdUseCase,
    private readonly getPostsByUsernameUseCase: GetPostsByUsernameUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Создание нового поста' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Пост успешно создан', type: PostResponseDto })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string' },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const uniqueSuffix = randomUUID();
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async create(
    @CurrentUser('id') userId: string,
    @Body('content') content: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const imagePaths = files?.map((file) => `/uploads/${file.filename}`) || [];

    return this.createPostUseCase.execute({
      authorId: userId,
      content,
      imagePaths,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Получение ленты постов' })
  @ApiResponse({ status: 200, description: 'Успешное получение ленты', type: FeedResponseDto })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'] })
  async getFeed(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
  ): Promise<FeedResponseDto> {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const result = await this.getFeedUseCase.execute({
      page: pageNum > 0 ? pageNum : 1,
      limit: limitNum > 0 ? limitNum : 10,
      order,
    });

    return {
      posts: result.posts.map((post) => PostResponseDto.fromDomain(post)),
      meta: result.meta,
    };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Получение постов конкретного пользователя' })
  @ApiResponse({ status: 200, description: 'Успешное получение постов', type: FeedResponseDto })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'] })
  async getByUser(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
  ): Promise<FeedResponseDto> {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const result = await this.getPostsByUserIdUseCase.execute({
      userId,
      page: pageNum > 0 ? pageNum : 1,
      limit: limitNum > 0 ? limitNum : 10,
      order,
    });

    return {
      posts: result.posts.map((post) => PostResponseDto.fromDomain(post)),
      meta: result.meta,
    };
  }

  @Get('username/:username')
  @ApiOperation({ summary: 'Получение постов пользователя по юзернейму' })
  @ApiResponse({ status: 200, description: 'Успешное получение постов', type: FeedResponseDto })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'] })
  async getByUsername(
    @Param('username') username: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
  ): Promise<FeedResponseDto> {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const result = await this.getPostsByUsernameUseCase.execute({
      username,
      page: pageNum > 0 ? pageNum : 1,
      limit: limitNum > 0 ? limitNum : 10,
      order,
    });

    return {
      posts: result.posts.map((post) => PostResponseDto.fromDomain(post)),
      meta: result.meta,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Обновление поста' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string' },
        removeImageIds: {
          type: 'array',
          items: { type: 'string' },
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const uniqueSuffix = randomUUID();
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body('content') content: string,
    @Body('removeImageIds') removeImageIds: string | string[],
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const imagesToRemoveIds =
      typeof removeImageIds === 'string' ? [removeImageIds] : removeImageIds;
    const newImagePaths = files?.map((file) => `/uploads/${file.filename}`);

    return this.updatePostUseCase.execute({
      postId: id,
      authorId: userId,
      content,
      newImagePaths,
      imagesToRemoveIds,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.deletePostUseCase.execute({
      postId: id,
      authorId: userId,
    });
  }
}

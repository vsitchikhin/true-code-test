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

import { diskStorage } from 'multer';

import { CreatePostUseCase } from '@application/use-cases/create-post.use-case';
import { DeletePostUseCase } from '@application/use-cases/delete-post.use-case';
import { GetFeedUseCase } from '@application/use-cases/get-feed.use-case';
import { UpdatePostUseCase } from '@application/use-cases/update-post.use-case';
import { JwtAuthGuard } from '@infrastructure/security/jwt-auth.guard';
import { CurrentUser } from '@presentation/decorators/current-user.decorator';

@Controller('posts')
export class PostController {
  constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly getFeedUseCase: GetFeedUseCase,
    private readonly deletePostUseCase: DeletePostUseCase,
    private readonly updatePostUseCase: UpdatePostUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
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
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image is required');
    }

    const imagePaths = files.map((file) => `/uploads/${file.filename}`);

    return this.createPostUseCase.execute({
      authorId: userId,
      content,
      imagePaths,
    });
  }

  @Get()
  async getFeed(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return this.getFeedUseCase.execute({
      page: pageNum > 0 ? pageNum : 1,
      limit: limitNum > 0 ? limitNum : 10,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
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

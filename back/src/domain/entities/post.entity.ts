import { PostImage } from '@domain/entities/post-image.entity';
import { User } from '@domain/entities/user.entity';

export class Post {
  constructor(
    public readonly id: string,
    public authorId: string,
    public content: string,
    public images: PostImage[] = [],
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public author?: User,
  ) {}
}

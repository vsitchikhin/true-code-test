export class PostImage {
  constructor(
    public readonly id: string,
    public readonly postId: string,
    public readonly path: string,
    public readonly order: number = 0,
    public readonly createdAt: Date = new Date(),
  ) {}
}

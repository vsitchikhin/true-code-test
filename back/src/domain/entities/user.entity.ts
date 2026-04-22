export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public username: string,
    public passwordHash: string,
    public phoneNumber: string,
    public bio?: string,
    public avatarPath?: string,
    public readonly createdAt: Date = new Date(),
  ) {}
}

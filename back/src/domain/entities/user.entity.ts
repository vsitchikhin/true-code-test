export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public username: string,
    public passwordHash: string,
    public phoneNumber: string,
    public bio: string | null = null,
    public avatarPath: string | null = null,
    public refreshTokenHash: string | null = null,
    public readonly createdAt: Date = new Date(),
  ) { }
}

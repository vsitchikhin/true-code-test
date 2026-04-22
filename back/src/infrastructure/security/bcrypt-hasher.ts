import * as bcrypt from 'bcrypt';

import { IPasswordHasher } from '@domain/services/password-hasher.interface';

export class BcryptHasher implements IPasswordHasher {
  constructor(
    private readonly saltRounds: number,
    private readonly pepper: string,
  ) {}

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password + this.pepper, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password + this.pepper, hash);
  }
}

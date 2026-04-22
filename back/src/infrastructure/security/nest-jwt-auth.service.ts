import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { IAuthService, TokenPayload } from '@domain/services/auth-service.interface';

@Injectable()
export class NestJwtAuthService implements IAuthService {
  constructor(private readonly jwtService: JwtService) { }

  async generateToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  async verifyToken(token: string): Promise<TokenPayload | null> {
    try {
      return await this.jwtService.verifyAsync<TokenPayload>(token);
    } catch {
      return null;
    }
  }
}

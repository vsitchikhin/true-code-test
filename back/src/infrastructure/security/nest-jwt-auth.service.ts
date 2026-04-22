import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { IAuthService, TokenPayload } from '@domain/services/auth-service.interface';

@Injectable()
export class NestJwtAuthService implements IAuthService {
  constructor(private readonly jwtService: JwtService) { }

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, { expiresIn: '15m' });
  }

  async generateRefreshToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, { expiresIn: '7d' });
  }

  async verifyAccessToken(token: string): Promise<TokenPayload | null> {
    try {
      return await this.jwtService.verifyAsync<TokenPayload>(token);
    } catch {
      return null;
    }
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload | null> {
    try {
      return await this.jwtService.verifyAsync<TokenPayload>(token);
    } catch {
      return null;
    }
  }
}

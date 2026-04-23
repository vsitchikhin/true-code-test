import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { IAuthService, TokenPayload } from '@domain/services/auth-service.interface';

@Injectable()
export class NestJwtAuthService implements IAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRATION') as never,
    });
  }

  async generateRefreshToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRATION') as never,
    });
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

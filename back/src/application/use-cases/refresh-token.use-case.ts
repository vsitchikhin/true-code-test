import { randomUUID } from 'node:crypto';

import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';

import type { IUserRepository } from '@domain/repositories/user.repository.interface';
import type { IAuthService } from '@domain/services/auth-service.interface';
import type { IPasswordHasher } from '@domain/services/password-hasher.interface';

export interface RefreshTokenCommand {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IPasswordHasher')
    private readonly passwordHasher: IPasswordHasher,
    @Inject('IAuthService')
    private readonly authService: IAuthService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenResponse> {
    const payload = await this.authService.verifyRefreshToken(command.refreshToken);
    if (!payload) {
      throw new UnauthorizedException('Невалидный refresh-токен');
    }

    const user = await this.userRepository.findById(payload.userId);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Пользователь не найден или сессия истекла');
    }

    const isTokenValid = await this.passwordHasher.compare(
      command.refreshToken,
      user.refreshTokenHash,
    );

    if (!isTokenValid) {
      throw new UnauthorizedException('Невалидный refresh-токен');
    }

    const accessToken = await this.authService.generateAccessToken({
      userId: user.id,
      username: user.username,
    });

    const newRefreshToken = await this.authService.generateRefreshToken({
      userId: user.id,
      username: user.username,
      jti: randomUUID(),
    });

    user.refreshTokenHash = await this.passwordHasher.hash(newRefreshToken);
    await this.userRepository.save(user);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}

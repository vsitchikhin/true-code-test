export interface TokenPayload {
  userId: string;
  username: string;
  jti?: string;
}

export interface IAuthService {
  generateAccessToken(payload: TokenPayload): Promise<string>;
  generateRefreshToken(payload: TokenPayload): Promise<string>;
  verifyAccessToken(token: string): Promise<TokenPayload | null>;
  verifyRefreshToken(token: string): Promise<TokenPayload | null>;
}

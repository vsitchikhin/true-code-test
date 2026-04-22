export interface TokenPayload {
  userId: string;
  username: string;
}

export interface IAuthService {
  generateToken(payload: TokenPayload): Promise<string>;
  verifyToken(token: string): Promise<TokenPayload | null>;
}

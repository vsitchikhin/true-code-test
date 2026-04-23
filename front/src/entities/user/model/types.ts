import type { UserResponseDto } from '@/shared/api';

export interface UserSchema {
  authData?: UserResponseDto;
  isMounted: boolean;
}

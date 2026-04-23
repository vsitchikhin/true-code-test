import { create } from 'zustand';
import { api } from '@/shared/api';
import type { UserResponseDto } from '@/shared/api';
import type { UserSchema } from '@/entities/user/model/types';

interface UserStore extends UserSchema {
  setAuthData: (data: UserResponseDto) => void;
  logout: () => void;
  _initAuthData: () => void;
  initAuth: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  isMounted: false,
  authData: undefined,

  setAuthData: (data) => {
    set({ authData: data });
  },

  logout: () => {
    set({ authData: undefined });
  },

  initAuth: async () => {
    try {
      const response = await api.api.userControllerGetMe();
      set({ authData: response.data });
    } catch {
      set({ authData: undefined });
    } finally {
      set({ isMounted: true });
    }
  },

  _initAuthData: () => {
    set({ isMounted: true });
  },
}));

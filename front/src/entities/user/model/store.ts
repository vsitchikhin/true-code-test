import { create } from 'zustand';
import type { UserResponseDto } from '@/shared/api';
import type { UserSchema } from './types';

interface UserStore extends UserSchema {
  setAuthData: (data: UserResponseDto) => void;
  logout: () => void;
  _initAuthData: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  isMounted: false,
  authData: undefined,

  setAuthData: (data) => {
    set({ authData: data });
    localStorage.setItem('user', JSON.stringify(data));
  },

  logout: () => {
    set({ authData: undefined });
    localStorage.removeItem('user');
  },

  _initAuthData: () => {
    const user = localStorage.getItem('user');
    if (user) {
      set({ authData: JSON.parse(user) });
    }
    set({ isMounted: true });
  },
}));

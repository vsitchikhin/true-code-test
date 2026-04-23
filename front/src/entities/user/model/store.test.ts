import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from '@/entities/user/model/store';
import type { UserResponseDto } from '@/shared/api';

const mockUser: UserResponseDto = {
  id: '1',
  username: 'testuser',
  email: 'test@test.com',
  phoneNumber: '+1234567890',
  createdAt: new Date().toISOString(),
};

describe('useUserStore', () => {
  beforeEach(() => {
    // Очищаем стор и localStorage перед каждым тестом
    useUserStore.setState({ authData: undefined, isMounted: false });
    localStorage.clear();
  });

  it('should have initial state', () => {
    const state = useUserStore.getState();
    expect(state.authData).toBeUndefined();
    expect(state.isMounted).toBe(false);
  });

  it('should set auth data and save to localStorage', () => {
    useUserStore.getState().setAuthData(mockUser);

    expect(useUserStore.getState().authData).toEqual(mockUser);
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
  });

  it('should clear data on logout', () => {
    useUserStore.getState().setAuthData(mockUser);
    useUserStore.getState().logout();

    expect(useUserStore.getState().authData).toBeUndefined();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('should init data from localStorage', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    useUserStore.getState()._initAuthData();

    expect(useUserStore.getState().authData).toEqual(mockUser);
    expect(useUserStore.getState().isMounted).toBe(true);
  });
});

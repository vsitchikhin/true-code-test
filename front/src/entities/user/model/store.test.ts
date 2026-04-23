import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUserStore } from '@/entities/user/model/store';
import type { UserResponseDto } from '@/shared/api';
import { api } from '@/shared/api';

vi.mock('@/shared/api', () => ({
  api: {
    api: {
      userControllerGetMe: vi.fn(),
    },
  },
}));

const mockUser: UserResponseDto = {
  id: '1',
  username: 'testuser',
  email: 'test@test.com',
  phoneNumber: '+1234567890',
  createdAt: new Date().toISOString(),
};

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.setState({ authData: undefined, isMounted: false });
    vi.clearAllMocks();
  });

  it('should have initial state', () => {
    const state = useUserStore.getState();
    expect(state.authData).toBeUndefined();
    expect(state.isMounted).toBe(false);
  });

  it('should set auth data', () => {
    useUserStore.getState().setAuthData(mockUser);
    expect(useUserStore.getState().authData).toEqual(mockUser);
  });

  it('should clear data on logout', () => {
    useUserStore.getState().setAuthData(mockUser);
    useUserStore.getState().logout();
    expect(useUserStore.getState().authData).toBeUndefined();
  });

  it('should init data from API success', async () => {
    vi.mocked(api.api.userControllerGetMe).mockResolvedValueOnce({
      data: mockUser,
    } as never);

    await useUserStore.getState().initAuth();

    expect(useUserStore.getState().authData).toEqual(mockUser);
    expect(useUserStore.getState().isMounted).toBe(true);
  });

  it('should set isMounted on API error', async () => {
    vi.mocked(api.api.userControllerGetMe).mockRejectedValueOnce(new Error('401'));

    await useUserStore.getState().initAuth();

    expect(useUserStore.getState().authData).toBeUndefined();
    expect(useUserStore.getState().isMounted).toBe(true);
  });
});

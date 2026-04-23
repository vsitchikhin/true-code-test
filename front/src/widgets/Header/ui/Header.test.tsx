import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';
import { useUserStore } from '@/entities/user';
import { api } from '@/shared/api';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/shared/api', () => ({
  api: {
    api: {
      authControllerLogout: vi.fn(),
    },
  },
}));

const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@test.com',
  phoneNumber: '+1234567890',
  createdAt: new Date().toISOString(),
  avatarPath: null,
};

function renderHeader() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Header />
    </MemoryRouter>,
  );
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserStore.setState({ authData: mockUser, isMounted: true });
  });

  it('отображает имя пользователя', () => {
    renderHeader();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('отображает инициал в аватаре-заглушке, если нет фото', () => {
    renderHeader();
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('отображает ссылку на ленту', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: /лента/i })).toBeInTheDocument();
  });

  it('отображает кнопку "Создать пост"', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: /создать пост/i })).toBeInTheDocument();
  });

  it('нажатие "Создать пост" переходит на /posts/create', () => {
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /создать пост/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/posts/create');
  });

  it('logout вызывает API, очищает стор и редиректит на /login', async () => {
    vi.mocked(api.api.authControllerLogout).mockResolvedValue({} as never);
    renderHeader();

    fireEvent.click(screen.getByTitle('Выйти'));

    await waitFor(() => {
      expect(api.api.authControllerLogout).toHaveBeenCalledTimes(1);
      expect(useUserStore.getState().authData).toBeUndefined();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('logout очищает стор и редиректит даже если API вернул ошибку', async () => {
    vi.mocked(api.api.authControllerLogout).mockRejectedValue(new Error('network error'));
    renderHeader();

    fireEvent.click(screen.getByTitle('Выйти'));

    await waitFor(() => {
      expect(useUserStore.getState().authData).toBeUndefined();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('отображает img аватара, если avatarPath задан', () => {
    useUserStore.setState({
      authData: { ...mockUser, avatarPath: '/uploads/avatar.png' },
    });
    renderHeader();
    const avatar = screen.getByAltText('testuser');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', expect.stringContaining('/uploads/avatar.png'));
  });
});

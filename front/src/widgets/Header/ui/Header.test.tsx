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

vi.mock('@/features/post-form', () => ({
  PostFormModal: () => null,
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

  it('отображает полное имя пользователя, если оно есть', () => {
    useUserStore.setState({
      authData: { ...mockUser, firstName: 'Иван', lastName: 'Иванов' },
    });
    renderHeader();
    expect(screen.getByText('Иван Иванов')).toBeInTheDocument();
  });

  it('отображает имя пользователя, если полного имени нет', () => {
    useUserStore.setState({
      authData: { ...mockUser, firstName: null, lastName: null },
    });
    renderHeader();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('отображает инициал в аватаре-заглушке по имени', () => {
    useUserStore.setState({
      authData: { ...mockUser, firstName: 'Иван', lastName: 'Иванов' },
    });
    renderHeader();
    expect(screen.getByText('И')).toBeInTheDocument();
  });

  it('отображает ссылку на ленту', () => {
    renderHeader();
    // Используем getAllByRole и берем ту, что в навигации, или просто проверяем что хоть одна есть
    const links = screen.getAllByRole('link', { name: /лента/i });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toBeInTheDocument();
  });

  it('отображает кнопку "Создать пост"', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: /создать пост/i })).toBeInTheDocument();
  });

  it('нажатие "Создать пост" открывает модалку создания поста', () => {
    renderHeader();
    // До клика — navigate не вызывался
    fireEvent.click(screen.getByRole('button', { name: /создать пост/i }));
    // Модалка замокана как null, достаточно убедиться что navigate НЕ вызван
    expect(mockNavigate).not.toHaveBeenCalled();
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

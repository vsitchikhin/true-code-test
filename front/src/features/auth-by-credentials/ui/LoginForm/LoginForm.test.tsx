import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginForm } from '@/features/auth-by-credentials/ui/LoginForm/LoginForm';
import { api } from '@/shared/api';

vi.mock('@/shared/api', () => ({
  api: {
    api: {
      authControllerLogin: vi.fn(),
      userControllerGetMe: vi.fn(),
    },
  },
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all fields', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/Логин, email или телефон/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Войти/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole('button', { name: /Войти/i }));

    expect(await screen.findByText(/Минимум 3 символа/i)).toBeInTheDocument();
    expect(await screen.findByText(/Пароль должен быть не менее 6 символов/i)).toBeInTheDocument();
  });

  it('calls login and fetches profile on success', async () => {
    const mockUser = { id: '1', username: 'testuser' };

    vi.mocked(api.api.authControllerLogin).mockResolvedValueOnce({
      data: { accessToken: 'test-token' },
    } as never);

    vi.mocked(api.api.userControllerGetMe).mockResolvedValueOnce({
      data: mockUser,
    } as never);

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/Логин, email или телефон/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/Пароль/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Войти/i }));

    await waitFor(() => {
      expect(api.api.authControllerLogin).toHaveBeenCalledWith({
        identifier: 'testuser',
        password: 'password123',
      });
      expect(api.api.userControllerGetMe).toHaveBeenCalled();
    });
  });

  it('shows server error on failure', async () => {
    const errorMsg = 'Invalid credentials';
    vi.mocked(api.api.authControllerLogin).mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { message: errorMsg } },
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/Логин, email или телефон/i), {
      target: { value: 'wronguser' },
    });
    fireEvent.change(screen.getByLabelText(/Пароль/i), { target: { value: 'wrongpass' } });

    fireEvent.click(screen.getByRole('button', { name: /Войти/i }));

    expect(await screen.findByText(errorMsg)).toBeInTheDocument();
  });
});

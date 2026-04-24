import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegistrationForm } from '@/features/auth-by-credentials/ui/RegistrationForm/RegistrationForm';
import { api } from '@/shared/api';

// Мокаем API
vi.mock('@/shared/api', () => ({
  api: {
    api: {
      userControllerRegister: vi.fn(),
    },
  },
}));

describe('RegistrationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all fields', () => {
    render(<RegistrationForm />);
    expect(screen.getByLabelText(/^Имя$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Фамилия$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Имя пользователя/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Телефон/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Пароль/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<RegistrationForm />);
    fireEvent.click(screen.getByRole('button', { name: /Создать аккаунт/i }));

    expect(await screen.findByText(/Имя обязательно/i)).toBeInTheDocument();
    expect(await screen.findByText(/Фамилия обязательна/i)).toBeInTheDocument();
    expect(await screen.findByText(/Минимум 3 символа/i)).toBeInTheDocument();
    expect(await screen.findByText(/Некорректный email/i)).toBeInTheDocument();
  });

  it('calls API with correct data', async () => {
    render(<RegistrationForm />);

    fireEvent.change(screen.getByLabelText(/^Имя$/i), { target: { value: 'Иван' } });
    fireEvent.change(screen.getByLabelText(/^Фамилия$/i), { target: { value: 'Иванов' } });
    fireEvent.change(screen.getByLabelText(/Имя пользователя/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@mail.com' } });
    fireEvent.change(screen.getByLabelText(/Телефон/i), { target: { value: '+79991234567' } });
    fireEvent.change(screen.getByLabelText(/Пароль/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Создать аккаунт/i }));

    await waitFor(() => {
      expect(api.api.userControllerRegister).toHaveBeenCalledWith({
        firstName: 'Иван',
        lastName: 'Иванов',
        username: 'testuser',
        email: 'test@mail.com',
        phoneNumber: '+79991234567',
        password: 'password123',
      });
    });
  });

  it('shows server error on failure', async () => {
    const errorMsg = 'Email already exists';
    vi.mocked(api.api.userControllerRegister).mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { message: errorMsg } },
    });

    render(<RegistrationForm />);

    // Заполняем минимально необходимые поля
    fireEvent.change(screen.getByLabelText(/^Имя$/i), { target: { value: 'Иван' } });
    fireEvent.change(screen.getByLabelText(/^Фамилия$/i), { target: { value: 'Иванов' } });
    fireEvent.change(screen.getByLabelText(/Имя пользователя/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@mail.com' } });
    fireEvent.change(screen.getByLabelText(/Телефон/i), { target: { value: '+79991234567' } });
    fireEvent.change(screen.getByLabelText(/Пароль/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Создать аккаунт/i }));

    expect(await screen.findByText(errorMsg)).toBeInTheDocument();
  });
});

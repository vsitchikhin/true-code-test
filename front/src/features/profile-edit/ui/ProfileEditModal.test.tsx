/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileEditModal } from './ProfileEditModal';
import { useUserStore } from '@/entities/user';

vi.mock('@base-ui/react/dialog', () => ({
  Dialog: {
    Root: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
      open ? <div>{children}</div> : null,
    Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Backdrop: () => null,
    Popup: ({ children }: { children: React.ReactNode }) => <div role="dialog">{children}</div>,
    Title: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
    Close: ({ children, ...props }: React.ComponentProps<'button'>) => (
      <button {...props}>{children}</button>
    ),
  },
}));

vi.mock('./AvatarCropper', () => ({
  AvatarCropper: () => null,
}));

vi.mock('@/shared/api', () => ({
  api: {
    api: {
      userControllerUpdateMe: vi.fn(),
      userControllerUpdateAvatar: vi.fn(),
    },
  },
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() })),
}));

const mockUser = {
  id: 'u1',
  username: 'testuser',
  email: 'test@test.com',
  phoneNumber: '',
  bio: 'Привет, мир',
  avatarPath: null,
  createdAt: new Date().toISOString(),
};

function renderModal(isOpen = true) {
  return render(<ProfileEditModal isOpen={isOpen} onClose={vi.fn()} />);
}

describe('ProfileEditModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserStore.setState({ authData: mockUser, isMounted: true });
  });

  it('не рендерится когда isOpen=false', () => {
    renderModal(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('рендерит форму с предзаполненными данными пользователя', () => {
    renderModal();
    expect(screen.getByPlaceholderText(/username/i)).toHaveValue('testuser');
    expect(screen.getByPlaceholderText(/расскажите/i)).toHaveValue('Привет, мир');
  });

  it('отображает аватар', () => {
    renderModal();
    expect(screen.getByAltText('Аватар')).toBeInTheDocument();
  });

  it('показывает ошибку валидации при слишком коротком username', async () => {
    renderModal();
    const input = screen.getByPlaceholderText(/username/i);
    fireEvent.change(input, { target: { value: 'ab' } });
    fireEvent.click(screen.getByRole('button', { name: /сохранить/i }));
    await waitFor(() => {
      expect(screen.getByText(/минимум 3 символа/i)).toBeInTheDocument();
    });
  });

  it('вызывает onClose при клике Отмена', () => {
    const onClose = vi.fn();
    render(<ProfileEditModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /отмена/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('вызывает API при успешной отправке и закрывает модалку', async () => {
    const { api } = await import('@/shared/api');
    vi.mocked(api.api.userControllerUpdateMe).mockResolvedValue({ data: mockUser } as any);
    const onClose = vi.fn();
    render(<ProfileEditModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /сохранить/i }));
    await waitFor(() => {
      expect(api.api.userControllerUpdateMe).toHaveBeenCalledWith({
        username: 'testuser',
        bio: 'Привет, мир',
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('показывает ошибку при сбое API', async () => {
    const { api } = await import('@/shared/api');
    vi.mocked(api.api.userControllerUpdateMe).mockRejectedValue(new Error('409'));
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /сохранить/i }));
    await waitFor(() => {
      expect(screen.getByText(/не удалось обновить/i)).toBeInTheDocument();
    });
  });
});

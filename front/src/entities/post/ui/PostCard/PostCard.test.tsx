import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostCard } from './PostCard';
import { useUserStore } from '@/entities/user';
import { api } from '@/shared/api';
import type { Post } from '../../model/types';

vi.mock('@/features/post-form', () => ({
  PostFormModal: ({ isOpen, post }: { isOpen: boolean; post?: Post }) =>
    isOpen ? <div data-testid="edit-modal">edit-{post?.id}</div> : null,
}));

vi.mock('@base-ui/react/menu', () => ({
  Menu: {
    Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Trigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
    Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Positioner: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Popup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Item: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
      <button onClick={onClick}>{children}</button>
    ),
  },
}));

vi.mock('@/shared/api', () => ({
  api: { api: { postControllerDelete: vi.fn() } },
}));

vi.mock('@/shared/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/ui')>();
  return {
    ...actual,
    ConfirmDialog: ({
      isOpen,
      onConfirm,
      onCancel,
    }: {
      isOpen: boolean;
      onConfirm: () => void;
      onCancel: () => void;
    }) =>
      isOpen ? (
        <div data-testid="confirm-dialog">
          <button data-testid="confirm-btn" onClick={onConfirm}>
            Удалить
          </button>
          <button data-testid="cancel-btn" onClick={onCancel}>
            Отмена
          </button>
        </div>
      ) : null,
  };
});

const mockPost: Post = {
  id: '1',
  content: 'Тестовый контент поста',
  authorId: 'author-1',
  createdAt: '2026-04-23T12:00:00Z',
  images: [],
  author: {
    id: 'author-1',
    username: 'testuser',
    avatarPath: null,
  },
};

const mockAuthorUser = {
  id: 'author-1',
  username: 'testuser',
  email: 'test@test.com',
  phoneNumber: '+7000',
  createdAt: new Date().toISOString(),
  avatarPath: null,
};

function renderCard(post = mockPost) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <PostCard post={post} />
    </QueryClientProvider>,
  );
}

describe('PostCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserStore.setState({ authData: undefined, isMounted: true });
  });

  it('отображает контент поста и имя автора', () => {
    renderCard();
    expect(screen.getByText('Тестовый контент поста')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('отображает дату в правильном формате', () => {
    renderCard();
    expect(screen.getByText(/23 апреля/i)).toBeInTheDocument();
  });

  it('не отображает галерею, если изображений нет', () => {
    const { container } = renderCard();
    expect(container.querySelector('[class*="gallery"]')).not.toBeInTheDocument();
  });

  it('отображает галерею, если есть изображения', () => {
    const postWithImages: Post = {
      ...mockPost,
      images: [{ id: 'img-1', path: '/uploads/test.png', order: 0 }],
    };
    renderCard(postWithImages);
    // аватар автора + картинка в посте
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('использует фоллбек для аватара, если он не задан', () => {
    renderCard();
    expect(screen.getByAltText('testuser')).toHaveAttribute(
      'src',
      expect.stringContaining('ui-avatars.com'),
    );
  });
});

describe('PostCard — действия автора', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserStore.setState({ authData: mockAuthorUser, isMounted: true });
  });

  it('показывает меню действий, если текущий пользователь — автор', () => {
    renderCard();
    expect(screen.getByText('Редактировать')).toBeInTheDocument();
    expect(screen.getByText('Удалить')).toBeInTheDocument();
  });

  it('скрывает меню действий, если текущий пользователь — не автор', () => {
    useUserStore.setState({ authData: { ...mockAuthorUser, id: 'other-user' } });
    renderCard();
    expect(screen.queryByText('Редактировать')).not.toBeInTheDocument();
    expect(screen.queryByText('Удалить')).not.toBeInTheDocument();
  });

  it('клик "Редактировать" открывает модалку редактирования', () => {
    renderCard();
    fireEvent.click(screen.getByText('Редактировать'));
    expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
  });

  it('клик "Удалить" открывает диалог подтверждения', () => {
    renderCard();
    fireEvent.click(screen.getByText('Удалить'));
    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
  });

  it('подтверждение в диалоге вызывает API удаления', async () => {
    vi.mocked(api.api.postControllerDelete).mockResolvedValue({} as never);
    renderCard();
    fireEvent.click(screen.getByText('Удалить'));
    fireEvent.click(screen.getByTestId('confirm-btn'));
    await waitFor(() => {
      expect(api.api.postControllerDelete).toHaveBeenCalledWith('1');
    });
  });

  it('отмена в диалоге не вызывает API', () => {
    renderCard();
    fireEvent.click(screen.getByText('Удалить'));
    fireEvent.click(screen.getByTestId('cancel-btn'));
    expect(api.api.postControllerDelete).not.toHaveBeenCalled();
    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
  });

  it('диалог закрывается после ошибки удаления', async () => {
    vi.mocked(api.api.postControllerDelete).mockRejectedValue(new Error('500'));
    renderCard();
    fireEvent.click(screen.getByText('Удалить'));
    fireEvent.click(screen.getByTestId('confirm-btn'));
    await waitFor(() => {
      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
    });
  });
});

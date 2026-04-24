import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostFormModal } from './PostFormModal';
import { useUserStore } from '@/entities/user';
import { api } from '@/shared/api';

// ── Моки ─────────────────────────────────────────────────────

vi.mock('@/shared/api', () => ({
  api: { api: { postControllerCreate: vi.fn(), postControllerUpdate: vi.fn() } },
}));

vi.mock('@/shared/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/ui')>();
  return {
    ...actual,
    Modal: ({
      isOpen,
      children,
      onClose,
    }: {
      isOpen: boolean;
      children: React.ReactNode;
      onClose: () => void;
    }) =>
      isOpen ? (
        <div data-testid="modal">
          <button onClick={onClose} data-testid="modal-close" />
          {children}
        </div>
      ) : null,
  };
});

vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

// ── Helpers ───────────────────────────────────────────────────

const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@test.com',
  phoneNumber: '+7000',
  createdAt: new Date().toISOString(),
  avatarPath: null,
};

function makeFile(name: string, type: string) {
  return new File(['content'], name, { type });
}

function renderModal(props: { isOpen?: boolean; onClose?: () => void } = {}) {
  const onClose = props.onClose ?? vi.fn();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  const result = render(
    <QueryClientProvider client={queryClient}>
      <PostFormModal isOpen={props.isOpen ?? true} onClose={onClose} />
    </QueryClientProvider>,
  );

  return { ...result, onClose, queryClient };
}

// ── Тесты ─────────────────────────────────────────────────────

describe('PostFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserStore.setState({ authData: mockUser, isMounted: true });
  });

  // — Рендер ————————————————————————————————

  it('рендерит форму когда isOpen=true', () => {
    renderModal();
    expect(screen.getByPlaceholderText('Что нового?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /опубликовать/i })).toBeInTheDocument();
  });

  it('не рендерит ничего когда isOpen=false', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByPlaceholderText('Что нового?')).not.toBeInTheDocument();
  });

  it('показывает аватар-заглушку пользователя', () => {
    renderModal();
    expect(screen.getByAltText('testuser')).toHaveAttribute(
      'src',
      expect.stringContaining('ui-avatars.com'),
    );
  });

  it('показывает подсказку drag&drop когда фото не выбраны', () => {
    renderModal();
    expect(screen.getByText(/Перетащите фото или нажмите для выбора/i)).toBeInTheDocument();
  });

  // — Валидация —————————————————————————————

  it('показывает ошибку при отправке пустой формы без картинок', async () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /опубликовать/i }));
    await screen.findByText('Введите текст поста или добавьте фото');
    expect(api.api.postControllerCreate).not.toHaveBeenCalled();
  });

  it('публикует пост только с картинками без текста', async () => {
    vi.mocked(api.api.postControllerCreate).mockResolvedValue({} as never);
    const { onClose } = renderModal();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { files: [makeFile('photo.jpg', 'image/jpeg')] } });
    });

    fireEvent.click(screen.getByRole('button', { name: /опубликовать/i }));

    await waitFor(() => {
      expect(api.api.postControllerCreate).toHaveBeenCalledWith(
        expect.objectContaining({ content: '' }),
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('показывает ошибку если текст длиннее 1000 символов', async () => {
    renderModal();
    await userEvent.type(screen.getByPlaceholderText('Что нового?'), 'a'.repeat(1001));
    fireEvent.click(screen.getByRole('button', { name: /опубликовать/i }));
    await screen.findByText('Слишком длинный текст');
    expect(api.api.postControllerCreate).not.toHaveBeenCalled();
  });

  // — Сабмит ————————————————————————————————

  it('вызывает API и закрывает модалку при успешной публикации', async () => {
    vi.mocked(api.api.postControllerCreate).mockResolvedValue({} as never);
    const { onClose } = renderModal();

    await userEvent.type(screen.getByPlaceholderText('Что нового?'), 'Тестовый пост');
    fireEvent.click(screen.getByRole('button', { name: /опубликовать/i }));

    await waitFor(() => {
      expect(api.api.postControllerCreate).toHaveBeenCalledWith(
        expect.objectContaining({ content: 'Тестовый пост' }),
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('показывает ошибку сабмита при сбое API', async () => {
    vi.mocked(api.api.postControllerCreate).mockRejectedValue(new Error('500'));
    renderModal();

    await userEvent.type(screen.getByPlaceholderText('Что нового?'), 'Тестовый пост');
    fireEvent.click(screen.getByRole('button', { name: /опубликовать/i }));

    await screen.findByText(/Не удалось сохранить пост/i);
  });

  it('не закрывает модалку при сбое API', async () => {
    vi.mocked(api.api.postControllerCreate).mockRejectedValue(new Error('500'));
    const { onClose } = renderModal();

    await userEvent.type(screen.getByPlaceholderText('Что нового?'), 'Текст');
    fireEvent.click(screen.getByRole('button', { name: /опубликовать/i }));

    await screen.findByText(/Не удалось сохранить пост/i);
    expect(onClose).not.toHaveBeenCalled();
  });

  // — Изображения: добавление ———————————————

  it('показывает превью после выбора изображения', async () => {
    renderModal();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { files: [makeFile('photo.jpg', 'image/jpeg')] } });
    });

    // img с alt="" имеет роль presentation, ищем через querySelectorAll
    expect(document.querySelectorAll('img').length).toBeGreaterThan(1);
    expect(screen.getByText('1 / 10 фото')).toBeInTheDocument();
  });

  it('фильтрует не-картинки при выборе файлов', async () => {
    renderModal();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, {
        target: { files: [makeFile('doc.pdf', 'application/pdf')] },
      });
    });

    expect(screen.queryByText(/\d+ \/ 10 фото/)).not.toBeInTheDocument();
  });

  it('принимает HEIC файл по расширению даже без MIME-типа', async () => {
    renderModal();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { files: [makeFile('photo.heic', '')] } });
    });

    expect(screen.getByText('1 / 10 фото')).toBeInTheDocument();
  });

  it('не добавляет больше 10 изображений', async () => {
    renderModal();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const files = Array.from({ length: 12 }, (_, i) => makeFile(`img${i}.jpg`, 'image/jpeg'));

    await act(async () => {
      fireEvent.change(input, { target: { files } });
    });

    expect(screen.getByText('10 / 10 фото')).toBeInTheDocument();
  });

  it('скрывает кнопку "Ещё" когда достигнут лимит 10 фото', async () => {
    renderModal();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const files = Array.from({ length: 10 }, (_, i) => makeFile(`img${i}.jpg`, 'image/jpeg'));

    await act(async () => {
      fireEvent.change(input, { target: { files } });
    });

    expect(screen.queryByText('Ещё')).not.toBeInTheDocument();
  });

  // — Изображения: удаление —————————————————

  it('удаляет изображение по клику на крестик', async () => {
    renderModal();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { files: [makeFile('a.jpg', 'image/jpeg')] } });
    });

    expect(screen.getByText('1 / 10 фото')).toBeInTheDocument();

    fireEvent.click(document.querySelector('[class*="removeBtn"]') as HTMLElement);

    await waitFor(() => {
      expect(screen.queryByText(/\d+ \/ 10 фото/)).not.toBeInTheDocument();
    });
  });

  // — Drag & drop ————————————————————————————

  it('добавляет класс активности при dragOver', () => {
    renderModal();
    const dropZone = document.querySelector('[class*="dropZone"]') as HTMLElement;

    fireEvent.dragOver(dropZone, { dataTransfer: { files: [] } });

    expect(dropZone.className).toMatch(/dropZoneActive/);
  });

  it('убирает класс активности при dragLeave за пределы зоны', () => {
    renderModal();
    const dropZone = document.querySelector('[class*="dropZone"]') as HTMLElement;

    fireEvent.dragOver(dropZone, { dataTransfer: { files: [] } });
    fireEvent.dragLeave(dropZone, { relatedTarget: document.body });

    expect(dropZone.className).not.toMatch(/dropZoneActive/);
  });

  it('добавляет файлы через drop', async () => {
    renderModal();
    const dropZone = document.querySelector('[class*="dropZone"]') as HTMLElement;

    await act(async () => {
      fireEvent.drop(dropZone, { dataTransfer: { files: [makeFile('dropped.png', 'image/png')] } });
    });

    expect(screen.getByText('1 / 10 фото')).toBeInTheDocument();
  });

  // — Закрытие ——————————————————————————————

  it('вызывает onClose при клике на кнопку закрытия модалки', () => {
    const { onClose } = renderModal();
    fireEvent.click(screen.getByTestId('modal-close'));
    expect(onClose).toHaveBeenCalled();
  });
});

/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import HomePage from './HomePage';

vi.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: vi.fn(),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

vi.mock('react-intersection-observer', () => ({
  useInView: vi.fn(),
}));

vi.mock('@/shared/api', () => ({
  api: {
    api: {
      postControllerGetFeed: vi.fn(),
    },
  },
}));

vi.mock('@/entities/post', () => ({
  PostList: vi.fn(({ posts, isLoading }) => (
    <div data-testid="post-list">
      {isLoading && <div data-testid="loading">Loading...</div>}
      {posts.map((post: any) => (
        <div key={post.id} data-testid="post-item">
          {post.content}
        </div>
      ))}
    </div>
  )),
}));

vi.mock('@/shared/ui', () => ({
  PageLayout: ({ children }: any) => <div>{children}</div>,
}));

function renderPage(initialSearch = '') {
  return render(
    <MemoryRouter initialEntries={[`/${initialSearch}`]}>
      <HomePage />
    </MemoryRouter>,
  );
}

describe('HomePage', () => {
  const mockFetchNextPage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useInView as any).mockReturnValue({ ref: vi.fn(), inView: false });
  });

  it('должен отображать список постов из всех страниц', () => {
    (useInfiniteQuery as any).mockReturnValue({
      data: {
        pages: [
          { posts: [{ id: '1', content: 'Post 1' }], meta: { total: 2, page: 1, totalPages: 2 } },
          { posts: [{ id: '2', content: 'Post 2' }], meta: { total: 2, page: 2, totalPages: 2 } },
        ],
      },
      isLoading: false,
      isError: false,
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
    });

    renderPage();

    expect(screen.getAllByTestId('post-item')).toHaveLength(2);
    expect(screen.getByText('Post 1')).toBeDefined();
    expect(screen.getByText('Post 2')).toBeDefined();
  });

  it('должен вызывать fetchNextPage, когда триггер в поле зрения', () => {
    (useInfiniteQuery as any).mockReturnValue({
      data: { pages: [{ posts: [], meta: { total: 2, page: 1, totalPages: 2 } }] },
      isLoading: false,
      isError: false,
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
    });
    (useInView as any).mockReturnValue({ ref: vi.fn(), inView: true });

    renderPage();

    expect(mockFetchNextPage).toHaveBeenCalled();
  });

  it('не должен вызывать fetchNextPage, если следующей страницы нет', () => {
    (useInfiniteQuery as any).mockReturnValue({
      data: { pages: [{ posts: [], meta: { total: 1, page: 1, totalPages: 1 } }] },
      isLoading: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
    });
    (useInView as any).mockReturnValue({ ref: vi.fn(), inView: true });

    renderPage();

    expect(mockFetchNextPage).not.toHaveBeenCalled();
  });

  it('должен отображать ошибку при сбое загрузки', () => {
    (useInfiniteQuery as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
    });

    renderPage();

    expect(screen.getByText(/Не удалось загрузить посты/i)).toBeDefined();
  });

  it('не показывает ошибку если посты уже есть (ошибка пагинации)', () => {
    (useInfiniteQuery as any).mockReturnValue({
      data: {
        pages: [
          { posts: [{ id: '1', content: 'Post 1' }], meta: { total: 2, page: 1, totalPages: 2 } },
        ],
      },
      isLoading: false,
      isError: true,
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
    });

    renderPage();

    expect(screen.queryByText(/Не удалось загрузить посты/i)).toBeNull();
    expect(screen.getByText('Post 1')).toBeDefined();
  });

  it('отображает скелетоны при начальной загрузке', () => {
    (useInfiniteQuery as any).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
    });

    renderPage();

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('не показывает триггер скролла если следующей страницы нет', () => {
    (useInfiniteQuery as any).mockReturnValue({
      data: {
        pages: [
          { posts: [{ id: '1', content: 'Post 1' }], meta: { total: 1, page: 1, totalPages: 1 } },
        ],
      },
      isLoading: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
    });

    const { container } = renderPage();

    expect(container.querySelector('[class*="loaderTrigger"]')).toBeNull();
  });

  it('кнопка "Сначала старые" активна при order=ASC в URL', () => {
    (useInfiniteQuery as any).mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
    });

    render(
      <MemoryRouter initialEntries={['/?order=ASC']}>
        <HomePage />
      </MemoryRouter>,
    );

    const ascBtn = screen.getByRole('button', { name: /сначала старые/i });
    expect(ascBtn.className).toMatch(/sortBtnActive/);
  });

  it('клик "Сначала старые" передаёт order=ASC в queryKey', () => {
    (useInfiniteQuery as any).mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: mockFetchNextPage,
    });

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /сначала старые/i }));

    const lastCall = (useInfiniteQuery as any).mock.calls.at(-1)[0];
    expect(lastCall.queryKey).toContain('ASC');
  });
});

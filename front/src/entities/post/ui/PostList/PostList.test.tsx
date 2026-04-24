import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostList } from './PostList';
import type { Post } from '../../model/types';

vi.mock('@/features/post-form', () => ({ PostFormModal: () => null }));
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

const mockPosts: Post[] = [
  {
    id: '1',
    content: 'Пост 1',
    authorId: 'author-1',
    createdAt: '2026-04-23T12:00:00Z',
    images: [],
    author: { id: 'author-1', username: 'user1', avatarPath: null },
  },
  {
    id: '2',
    content: 'Пост 2',
    authorId: 'author-2',
    createdAt: '2026-04-23T13:00:00Z',
    images: [],
    author: { id: 'author-2', username: 'user2', avatarPath: null },
  },
];

function wrap(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('PostList', () => {
  it('отображает сообщение, если список пуст', () => {
    wrap(<PostList posts={[]} isLoading={false} />);
    expect(screen.getByText(/Лента пуста/i)).toBeInTheDocument();
  });

  it('отображает скелетоны при загрузке', () => {
    const { container } = wrap(<PostList posts={[]} isLoading={true} />);
    const skeletons = container.querySelectorAll('[class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('рендерит список постов', () => {
    wrap(<PostList posts={mockPosts} isLoading={false} />);
    expect(screen.getByText('Пост 1')).toBeInTheDocument();
    expect(screen.getByText('Пост 2')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });
});

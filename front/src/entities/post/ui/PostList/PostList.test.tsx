import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PostList } from './PostList';
import type { Post } from '../../model/types';

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

describe('PostList', () => {
  it('отображает сообщение, если список пуст', () => {
    render(<PostList posts={[]} isLoading={false} />);
    expect(screen.getByText(/Лента пуста/i)).toBeInTheDocument();
  });

  it('отображает скелетоны при загрузке', () => {
    const { container } = render(<PostList posts={[]} isLoading={true} />);
    // Проверяем наличие классов скелетона
    const skeletons = container.querySelectorAll('[class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('рендерит список постов', () => {
    render(<PostList posts={mockPosts} isLoading={false} />);
    expect(screen.getByText('Пост 1')).toBeInTheDocument();
    expect(screen.getByText('Пост 2')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });
});

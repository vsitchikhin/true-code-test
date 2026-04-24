/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { ProfilePage } from './ProfilePage';
import { useUserStore } from '@/entities/user';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useInfiniteQuery: vi.fn(),
  useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() })),
}));

vi.mock('react-intersection-observer', () => ({
  useInView: vi.fn(),
}));

vi.mock('@/shared/api', () => ({
  api: { api: { userControllerGetByUsername: vi.fn(), postControllerGetByUsername: vi.fn() } },
}));

vi.mock('@/entities/post', () => ({
  PostList: ({ posts, isLoading }: any) => (
    <div data-testid="post-list">
      {isLoading && <div data-testid="posts-loading" />}
      {posts.map((p: any) => (
        <div key={p.id} data-testid="post-item">
          {p.content}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/features/profile-edit', () => ({
  ProfileEditModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="edit-modal" /> : null,
}));

vi.mock('@/shared/ui', () => ({
  PageLayout: ({ children }: any) => <div>{children}</div>,
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

const mockUser = {
  id: 'u1',
  username: 'testuser',
  email: 'test@test.com',
  phoneNumber: '+7999',
  bio: 'Привет!',
  avatarPath: null,
  createdAt: new Date().toISOString(),
};

const emptyPosts = { pages: [{ posts: [], meta: { total: 0, page: 1, totalPages: 0 } }] };
const onePosts = {
  pages: [{ posts: [{ id: '1', content: 'Пост' }], meta: { total: 1, page: 1, totalPages: 1 } }],
};

function renderProfilePage(path = '/user/me') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/user/:username" element={<ProfilePage />} />
        <Route path="/user/me" element={<ProfilePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserStore.setState({ authData: mockUser, isMounted: true });
    (useInView as any).mockReturnValue({ ref: vi.fn(), inView: false });
    (useInfiniteQuery as any).mockReturnValue({
      data: emptyPosts,
      isLoading: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });
  });

  it('отображает имя пользователя и bio после загрузки', () => {
    (useQuery as any).mockReturnValue({ data: mockUser, isLoading: false, isError: false });
    renderProfilePage();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('Привет!')).toBeInTheDocument();
  });

  it('показывает скелетон во время загрузки данных пользователя', () => {
    (useQuery as any).mockReturnValue({ data: undefined, isLoading: true, isError: false });
    const { container } = renderProfilePage();
    expect(container.querySelector('[class*="skeletonDetails"]')).toBeInTheDocument();
  });

  it('показывает счётчик постов', () => {
    (useQuery as any).mockReturnValue({ data: mockUser, isLoading: false, isError: false });
    (useInfiniteQuery as any).mockReturnValue({
      data: onePosts,
      isLoading: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });
    const { container } = renderProfilePage();
    expect(container.querySelector('[class*="statCount"]')?.textContent).toBe('1');
    expect(container.querySelector('[class*="statLabel"]')?.textContent).toMatch(/пост/);
  });

  it('показывает кнопку "Редактировать" для своего профиля', () => {
    (useQuery as any).mockReturnValue({ data: mockUser, isLoading: false, isError: false });
    renderProfilePage();
    expect(screen.getByRole('button', { name: /редактировать/i })).toBeInTheDocument();
  });

  it('не показывает кнопку "Редактировать" для чужого профиля', () => {
    useUserStore.setState({
      authData: { ...mockUser, id: 'other', username: 'other' },
      isMounted: true,
    });
    (useQuery as any).mockReturnValue({ data: mockUser, isLoading: false, isError: false });
    renderProfilePage('/user/testuser');
    expect(screen.queryByRole('button', { name: /редактировать/i })).not.toBeInTheDocument();
  });

  it('показывает сообщение об ошибке если пользователь не найден', () => {
    (useQuery as any).mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderProfilePage();
    expect(screen.getByText(/не найден/i)).toBeInTheDocument();
  });

  it('показывает пустое состояние когда постов нет', () => {
    (useQuery as any).mockReturnValue({ data: mockUser, isLoading: false, isError: false });
    renderProfilePage();
    expect(screen.getByText(/постов пока нет/i)).toBeInTheDocument();
  });

  it('передаёт посты в PostList', () => {
    (useQuery as any).mockReturnValue({ data: mockUser, isLoading: false, isError: false });
    (useInfiniteQuery as any).mockReturnValue({
      data: onePosts,
      isLoading: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });
    renderProfilePage();
    expect(screen.getByTestId('post-item')).toBeInTheDocument();
    expect(screen.queryByText(/постов пока нет/i)).not.toBeInTheDocument();
  });
});

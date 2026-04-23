import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PostCard } from './PostCard';
import { Post } from '../../model/types';

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

describe('PostCard', () => {
  it('отображает контент поста и имя автора', () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getByText('Тестовый контент поста')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('отображает дату в правильном формате', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText(/23 апреля/i)).toBeInTheDocument();
  });

  it('не отображает галерею, если изображений нет', () => {
    const { container } = render(<PostCard post={mockPost} />);
    // Ищем класс gallery из модуля. В тестах CSS модули обычно возвращают само имя класса.
    const gallery = container.querySelector('[class*="gallery"]');
    expect(gallery).not.toBeInTheDocument();
  });

  it('отображает галерею, если есть изображения', () => {
    const postWithImages: Post = {
      ...mockPost,
      images: [{ id: 'img-1', postId: '1', path: '/uploads/test.png', order: 0 }],
    };
    render(<PostCard post={postWithImages} />);

    const images = screen.getAllByRole('img');
    // 1 аватар + 1 картинка в посте = 2
    expect(images.length).toBe(2);
  });

  it('использует фоллбек для аватара, если он не задан', () => {
    render(<PostCard post={mockPost} />);
    const avatar = screen.getByAltText('testuser');
    expect(avatar).toHaveAttribute('src', expect.stringContaining('ui-avatars.com'));
  });
});

import React, { useState } from 'react';
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Menu } from '@base-ui/react/menu';
import { useUserStore } from '@/entities/user';
import { api } from '@/shared/api';
import { useQueryClient } from '@tanstack/react-query';
import { PostFormModal } from '@/features/post-form';
import { ConfirmDialog } from '@/shared/ui';
import type { Post } from '../../model/types';
import styles from './PostCard.module.scss';

interface PostCardProps {
  post: Post;
  className?: string;
}

const IconComment = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconHeart = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const IconShare = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

export const PostCard: React.FC<PostCardProps> = ({ post, className = '' }) => {
  const { author, content, images, createdAt } = post;
  const authData = useUserStore((state) => state.authData);
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthor = authData?.id === author?.id;

  const formattedDate = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(createdAt));

  const uploadsUrl = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3000';
  const avatarSrc = author?.avatarPath
    ? `${uploadsUrl}${author.avatarPath}`
    : `https://ui-avatars.com/api/?name=${author?.username || 'U'}&background=6366f1&color=fff&bold=true`;

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await api.api.postControllerDelete(post.id);
      void queryClient.invalidateQueries({ queryKey: ['posts'] });
      setIsConfirmDeleteOpen(false);
    } catch {
      setIsDeleting(false);
      setIsConfirmDeleteOpen(false);
    }
  };

  return (
    <article className={`${styles.postCard} ${className} ${isDeleting ? styles.deleting : ''}`}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link
            to={isAuthor ? '/user/me' : `/user/${author?.username}`}
            className={styles.authorLink}
          >
            <img src={avatarSrc} alt={author?.username} className={styles.avatar} />
          </Link>
          <div className={styles.authorInfo}>
            <Link
              to={isAuthor ? '/user/me' : `/user/${author?.username}`}
              className={styles.usernameLink}
            >
              <span className={styles.username}>
                {author?.firstName || author?.lastName
                  ? `${author.firstName || ''} ${author.lastName || ''}`.trim()
                  : author?.username || 'Аноним'}
              </span>
            </Link>
            <time className={styles.date} dateTime={createdAt}>
              {formattedDate}
            </time>
          </div>
        </div>

        {isAuthor && (
          <Menu.Root>
            <Menu.Trigger className={styles.moreButton}>
              <MoreHorizontal size={20} />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner sideOffset={8} align="end">
                <Menu.Popup className={styles.menuPopup}>
                  <Menu.Item className={styles.menuItem} onClick={() => setIsEditModalOpen(true)}>
                    <Edit2 size={16} />
                    <span>Редактировать</span>
                  </Menu.Item>
                  <Menu.Item
                    className={`${styles.menuItem} ${styles.menuItemDelete}`}
                    onClick={() => setIsConfirmDeleteOpen(true)}
                  >
                    <Trash2 size={16} />
                    <span>Удалить</span>
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        )}
      </header>

      <div className={styles.content}>{content}</div>

      {images.length > 0 && (
        <div className={`${styles.gallery} ${images.length === 1 ? styles.gallerySingle : ''}`}>
          {images.map((image) => (
            <div key={image.id} className={styles.imageWrapper}>
              <img
                src={`${uploadsUrl}${image.path}`}
                alt="Изображение поста"
                className={styles.image}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      <footer className={styles.footer}>
        <button type="button" className={styles.actionButton}>
          <IconComment /> <span>0</span>
        </button>
        <button type="button" className={`${styles.actionButton} ${styles.likeButton}`}>
          <IconHeart /> <span>0</span>
        </button>
        <button type="button" className={`${styles.actionButton} ${styles.shareButton}`}>
          <IconShare /> <span>Поделиться</span>
        </button>
      </footer>

      <PostFormModal
        key={post.id + (isEditModalOpen ? '-open' : '-closed')}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        post={post}
      />

      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        title="Удалить пост"
        message="Вы уверены, что хотите удалить этот пост? Это действие нельзя отменить."
        confirmLabel="Удалить"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />
    </article>
  );
};

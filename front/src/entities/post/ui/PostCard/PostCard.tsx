import React from 'react';
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

  return (
    <article className={`${styles.postCard} ${className}`}>
      <header className={styles.header}>
        <img src={avatarSrc} alt={author?.username} className={styles.avatar} />
        <div className={styles.authorInfo}>
          <span className={styles.username}>{author?.username || 'Аноним'}</span>
          <time className={styles.date} dateTime={createdAt}>
            {formattedDate}
          </time>
        </div>
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
    </article>
  );
};

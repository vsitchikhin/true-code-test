import React from 'react';
import type { Post } from '../../model/types';
import { PostCard } from '../PostCard/PostCard';
import styles from './PostList.module.scss';

interface PostListProps {
  posts: Post[];
  isLoading?: boolean;
  className?: string;
}

const PostSkeleton = () => (
  <div className={styles.skeleton}>
    <div className={styles.skeletonHeader}>
      <div className={styles.skeletonAvatar} />
      <div className={styles.skeletonMeta}>
        <div className={styles.skeletonLine} style={{ width: '120px' }} />
        <div className={styles.skeletonLine} style={{ width: '80px', marginTop: '4px' }} />
      </div>
    </div>
    <div className={styles.skeletonLine} style={{ width: '100%' }} />
    <div className={styles.skeletonLine} style={{ width: '85%' }} />
    <div className={styles.skeletonLine} style={{ width: '60%' }} />
  </div>
);

export const PostList: React.FC<PostListProps> = ({ posts, isLoading, className = '' }) => {
  if (isLoading) {
    return (
      <div className={`${styles.postList} ${className}`}>
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={`${styles.postList} ${className}`}>
        <div className={styles.empty}>
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#d1d5db"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p>Лента пуста</p>
          <span>Будьте первым, кто создаст пост!</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.postList} ${className}`}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

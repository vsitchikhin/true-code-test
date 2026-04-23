import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { PostList, type Post } from '@/entities/post';
import { PageLayout } from '@/shared/ui';
import styles from './HomePage.module.scss';

const HomePage: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['posts', { page: 1, limit: 10 }],
    queryFn: async () => {
      const response = await api.api.postControllerGetFeed({ page: '1', limit: '10' });
      return response.data as unknown as { posts: Post[]; total: number };
    },
  });

  return (
    <div className={styles.pageWrapper}>
      <PageLayout>
        <div className={styles.feed}>
          {isError && <div className={styles.error}>Не удалось загрузить посты</div>}
          <PostList posts={data?.posts || []} isLoading={isLoading} />
        </div>
      </PageLayout>
    </div>
  );
};

export default HomePage;

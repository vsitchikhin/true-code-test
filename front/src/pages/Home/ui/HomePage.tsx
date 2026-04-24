import React, { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { api } from '@/shared/api';
import { PostList, type Post } from '@/entities/post';
import { PageLayout } from '@/shared/ui';
import type { FeedResponseDto } from '@/shared/api/generated/api';
import styles from './HomePage.module.scss';

const LIMIT = 10;

const HomePage: React.FC = () => {
  const { ref, inView } = useInView({
    rootMargin: '200px',
  });

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['posts', 'infinite'],
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        const response = await api.api.postControllerGetFeed({
          page: String(pageParam),
          limit: String(LIMIT),
        });
        return response.data;
      },
      getNextPageParam: (lastPage: FeedResponseDto) => {
        const page = lastPage?.meta?.page;
        const totalPages = lastPage?.meta?.totalPages;
        if (page != null && totalPages != null && page < totalPages) {
          return page + 1;
        }
        return undefined;
      },
    });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const allPosts = (data?.pages.flatMap((page) => page.posts) as Post[]) || [];

  return (
    <div className={styles.pageWrapper}>
      <PageLayout>
        <div className={styles.feed}>
          {isError && allPosts.length === 0 ? (
            <div className={styles.error}>Не удалось загрузить посты</div>
          ) : (
            <>
              <PostList posts={allPosts} isLoading={isLoading} />

              {hasNextPage && (
                <div ref={ref} className={styles.loaderTrigger}>
                  {isFetchingNextPage && <div className={styles.miniLoader} />}
                </div>
              )}
            </>
          )}
        </div>
      </PageLayout>
    </div>
  );
};

export default HomePage;

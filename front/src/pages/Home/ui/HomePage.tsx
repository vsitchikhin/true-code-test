import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';
import { api } from '@/shared/api';
import { PostList, type Post } from '@/entities/post';
import { PageLayout } from '@/shared/ui';
import type { FeedResponseDto } from '@/shared/api/generated/api';
import styles from './HomePage.module.scss';

const LIMIT = 10;

type SortOrder = 'ASC' | 'DESC';

const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawOrder = searchParams.get('order')?.toUpperCase();
  const order: SortOrder = rawOrder === 'ASC' ? 'ASC' : 'DESC';

  const setOrder = (newOrder: SortOrder) => {
    setSearchParams({ order: newOrder }, { replace: true });
  };

  const { ref, inView } = useInView({ rootMargin: '200px' });

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['posts', 'infinite', order],
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        const response = await api.api.postControllerGetFeed({
          page: String(pageParam),
          limit: String(LIMIT),
          order,
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
    <PageLayout>
      <div className={styles.feedWrapper}>
        <div className={styles.feed}>
          <div className={styles.sortBar}>
            <button
              className={`${styles.sortBtn} ${order === 'DESC' ? styles.sortBtnActive : ''}`}
              onClick={() => setOrder('DESC')}
            >
              <ArrowDownWideNarrow size={14} />
              Сначала новые
            </button>
            <button
              className={`${styles.sortBtn} ${order === 'ASC' ? styles.sortBtnActive : ''}`}
              onClick={() => setOrder('ASC')}
            >
              <ArrowUpWideNarrow size={14} />
              Сначала старые
            </button>
          </div>

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
      </div>
    </PageLayout>
  );
};

export default HomePage;

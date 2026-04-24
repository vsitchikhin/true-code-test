import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { Settings, Calendar, Mail, Phone, Cake, FileText } from 'lucide-react';
import { api } from '@/shared/api';
import { PostList, type Post } from '@/entities/post';
import { PageLayout, Button } from '@/shared/ui';
import { useUserStore } from '@/entities/user';
import { ProfileEditModal } from '@/features/profile-edit';
import type { FeedResponseDto } from '@/shared/api/generated/api';
import styles from './ProfilePage.module.scss';

const LIMIT = 10;

export const ProfilePage: React.FC = () => {
  const params = useParams<{ username: string }>();
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.authData);
  const { ref, inView } = useInView({ rootMargin: '200px' });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isMe =
    !params.username || params.username === 'me' || params.username === currentUser?.username;
  const targetUsername = isMe ? currentUser?.username : params.username;

  useEffect(() => {
    if (params.username && params.username !== 'me' && params.username === currentUser?.username) {
      navigate('/user/me', { replace: true });
    }
  }, [params.username, currentUser?.username, navigate]);

  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useQuery({
    queryKey: ['user', targetUsername],
    queryFn: async () => {
      const response = await api.api.userControllerGetByUsername(targetUsername!);
      return response.data;
    },
    enabled: !!targetUsername,
  });

  const user = isMe ? currentUser : userData;

  const {
    data: postsData,
    isLoading: isPostsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts', 'user', targetUsername],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await api.api.postControllerGetByUsername(targetUsername!, {
        page: String(pageParam),
        limit: String(LIMIT),
        order: 'DESC',
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
    enabled: !!targetUsername,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (!targetUsername && !isUserLoading) {
    return (
      <PageLayout>
        <div className={styles.error}>Загрузка...</div>
      </PageLayout>
    );
  }

  if (isUserError) {
    return (
      <PageLayout>
        <div className={styles.error}>Пользователь не найден</div>
      </PageLayout>
    );
  }

  const allPosts = (postsData?.pages.flatMap((page) => page.posts) as Post[]) || [];
  const totalPosts = postsData?.pages[0]?.meta?.total ?? null;

  const avatarUrl = user?.avatarPath
    ? `${import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3000'}${user.avatarPath}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user?.firstName || user?.lastName
          ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
          : user?.username || 'U',
      )}&background=6366f1&color=fff&bold=true&size=128`;

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
    : '';

  const formattedBirthDate = user?.birthDate
    ? new Date(user.birthDate).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const handleAvatarClick = () => {
    if (isMe) setIsEditModalOpen(true);
  };

  return (
    <PageLayout>
      <div className={styles.profileWrapper}>
        <div className={styles.profile}>
          <div className={styles.profileCard}>
            <div className={styles.cover} />

            <div className={styles.mainInfo}>
              <div
                className={`${styles.avatarWrapper} ${isMe ? styles.avatarMe : ''}`}
                onClick={handleAvatarClick}
                title={isMe ? 'Изменить аватар' : undefined}
              >
                {isUserLoading ? (
                  <div className={styles.avatarPlaceholder} />
                ) : (
                  <img src={avatarUrl} alt={user?.username} className={styles.avatar} />
                )}
                {isMe && (
                  <div className={styles.avatarOverlay}>
                    <Settings size={22} />
                  </div>
                )}
              </div>

              <div className={styles.actions}>
                {isMe && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className={styles.editBtn}
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <Settings size={15} />
                    Редактировать
                  </Button>
                )}
              </div>
            </div>

            {isUserLoading ? (
              <div className={styles.skeletonDetails}>
                <div className={styles.skeletonLine} style={{ width: '40%', height: 20 }} />
                <div className={styles.skeletonLine} style={{ width: '25%' }} />
                <div className={styles.skeletonLine} style={{ width: '70%' }} />
              </div>
            ) : (
              <div className={styles.details}>
                <div className={styles.nameRow}>
                  <h1 className={styles.username} data-testid="profile-username">
                    {user?.firstName || user?.lastName
                      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                      : user?.username}
                  </h1>
                  <span className={styles.handle} data-testid="profile-handle">
                    @{user?.username?.toLowerCase()}
                  </span>
                </div>

                {user?.bio && <p className={styles.bio}>{user.bio}</p>}

                <div className={styles.meta}>
                  <div className={styles.metaItem}>
                    <Calendar size={14} />
                    <span>с {formattedDate}</span>
                  </div>
                  {formattedBirthDate && (
                    <div className={styles.metaItem}>
                      <Cake size={14} />
                      <span>Родился {formattedBirthDate}</span>
                    </div>
                  )}
                  {user?.email && (
                    <div className={styles.metaItem}>
                      <Mail size={14} />
                      <span>{user.email}</span>
                    </div>
                  )}
                  {user?.phoneNumber && (
                    <div className={styles.metaItem}>
                      <Phone size={14} />
                      <span>{user.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {totalPosts !== null && (
              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <span className={styles.statCount}>{totalPosts}</span>
                  <span className={styles.statLabel}>
                    {totalPosts === 1
                      ? 'пост'
                      : totalPosts >= 2 && totalPosts <= 4
                        ? 'поста'
                        : 'постов'}
                  </span>
                </div>
              </div>
            )}

            <div className={styles.tabs}>
              <div className={`${styles.tab} ${styles.tabActive}`}>
                <FileText size={14} />
                Посты
              </div>
            </div>
          </div>
          {/* end profileCard */}

          <div className={styles.content}>
            <PostList posts={allPosts} isLoading={isPostsLoading || isUserLoading} />

            {hasNextPage && (
              <div ref={ref} className={styles.loaderTrigger}>
                {isFetchingNextPage && <div className={styles.miniLoader} />}
              </div>
            )}

            {!isPostsLoading && !isUserLoading && allPosts.length === 0 && (
              <div className={styles.empty}>
                <p>Постов пока нет</p>
                <span>{isMe ? 'Напишите свой первый пост!' : 'Здесь пока ничего нет'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProfileEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
    </PageLayout>
  );
};

export default ProfilePage;

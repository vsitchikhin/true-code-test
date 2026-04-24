import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Plus } from 'lucide-react';
import { api } from '@/shared/api';
import { useUserStore } from '@/entities/user';
import { Button } from '@/shared/ui';
import { PostFormModal } from '@/features/post-form';
import styles from './Header.module.scss';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const authData = useUserStore((state) => state.authData);
  const logout = useUserStore((state) => state.logout);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.api.authControllerLogout();
    } catch {
      // сервер недоступен — всё равно выходим на клиенте
    } finally {
      logout();
      navigate('/login');
    }
  };

  const avatarUrl = authData?.avatarPath
    ? `${import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3000'}${authData.avatarPath}`
    : null;

  const isHome = location.pathname === '/';

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <div className={styles.left}>
            <Link to="/" className={styles.logo}>
              true<span className={styles.logoDivider}>{'//'}</span>code
            </Link>
            <nav className={styles.nav}>
              <Link to="/" className={`${styles.navLink} ${isHome ? styles.navLinkActive : ''}`}>
                Лента
              </Link>
            </nav>
          </div>

          <div className={styles.right}>
            <div className={styles.createBtnWrapper}>
              <Button variant="primary" size="xs" onClick={() => setIsCreateModalOpen(true)}>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="6" y1="1" x2="6" y2="11" />
                  <line x1="1" y1="6" x2="11" y2="6" />
                </svg>
                Создать пост
              </Button>
            </div>

            <Link to="/user/me" className={styles.user}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={authData?.username} className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {(authData?.firstName?.[0] || authData?.username?.[0])?.toUpperCase()}
                </div>
              )}
              <span className={styles.username}>
                {authData?.firstName || authData?.lastName
                  ? `${authData.firstName || ''} ${authData.lastName || ''}`.trim()
                  : authData?.username}
              </span>
            </Link>

            <button className={styles.logoutBtn} onClick={handleLogout} title="Выйти">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <nav className={styles.bottomNav}>
        <Link
          to="/"
          className={`${styles.bottomNavItem} ${isHome ? styles.bottomNavItemActive : ''}`}
        >
          <Home size={22} />
          <span>Лента</span>
        </Link>
        <button className={styles.bottomNavItem} onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={22} />
          <span>Создать</span>
        </button>
      </nav>

      <PostFormModal
        key={isCreateModalOpen ? 'open' : 'closed'}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
};

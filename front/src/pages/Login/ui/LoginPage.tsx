import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/shared/ui';
import { LoginForm } from '@/features/auth-by-credentials';
import styles from './LoginPage.module.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/');
  };

  return (
    <div className={styles.page}>
      <Card padding="lg" className={styles.card}>
        <LoginForm onSuccess={handleSuccess} />
        <div className={styles.footer}>
          Нет аккаунта?{' '}
          <Link to="/register" className={styles.link}>
            Зарегистрироваться
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;

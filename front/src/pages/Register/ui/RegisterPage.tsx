import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/shared/ui';
import { RegistrationForm } from '@/features/auth-by-credentials';
import styles from './RegisterPage.module.css';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/login');
  };

  return (
    <div className={styles.page}>
      <Card padding="lg" className={styles.card}>
        <RegistrationForm onSuccess={handleSuccess} />
        <div className={styles.footer}>
          Уже есть аккаунт?{' '}
          <Link to="/login" className={styles.link}>
            Войти
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;

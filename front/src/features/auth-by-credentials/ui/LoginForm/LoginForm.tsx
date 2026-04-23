import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { api } from '@/shared/api';
import { Button, Input } from '@/shared/ui';
import { useUserStore } from '@/entities/user';
import { loginSchema } from '@/features/auth-by-credentials/model/login.schema';
import type { LoginFormData } from '@/features/auth-by-credentials/model/login.schema';
import styles from './LoginForm.module.scss';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const setAuthData = useUserStore((state) => state.setAuthData);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError(null);
      await api.api.authControllerLogin(data);

      const meResponse = await api.api.userControllerGetMe();
      setAuthData(meResponse.data);

      onSuccess?.();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : (error as Error).message || String(error);
      setServerError(message);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <h2 className={styles.title}>Вход в аккаунт</h2>

      {serverError && <div className={styles.serverError}>{serverError}</div>}

      <Input
        label="Логин, email или телефон"
        placeholder="Введите логин, email или телефон"
        {...register('identifier')}
        error={errors.identifier?.message}
        fullWidth
      />

      <Input
        label="Пароль"
        type="password"
        placeholder="••••••••"
        {...register('password')}
        error={errors.password?.message}
        fullWidth
      />

      <Button type="submit" fullWidth isLoading={isSubmitting}>
        Войти
      </Button>
    </form>
  );
};

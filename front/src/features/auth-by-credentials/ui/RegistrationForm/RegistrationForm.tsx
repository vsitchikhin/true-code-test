import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { api } from '@/shared/api';
import { Button, Input } from '@/shared/ui';
import { registrationSchema } from '@/features/auth-by-credentials/model/registration.schema';
import type { RegistrationFormData } from '@/features/auth-by-credentials/model/registration.schema';
import styles from './RegistrationForm.module.scss';

interface RegistrationFormProps {
  onSuccess?: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess }) => {
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      setServerError(null);
      await api.api.userControllerRegister(data);
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
      <h2 className={styles.title}>Регистрация</h2>

      {serverError && <div className={styles.serverError}>{serverError}</div>}

      <div className={styles.row}>
        <Input
          label="Имя"
          placeholder="Иван"
          {...register('firstName')}
          error={errors.firstName?.message}
          fullWidth
        />
        <Input
          label="Фамилия"
          placeholder="Иванов"
          {...register('lastName')}
          error={errors.lastName?.message}
          fullWidth
        />
      </div>

      <Input
        label="Имя пользователя (@username)"
        placeholder="Введите имя пользователя"
        {...register('username')}
        error={errors.username?.message}
        fullWidth
      />

      <Input
        label="Email"
        type="email"
        placeholder="example@mail.com"
        {...register('email')}
        error={errors.email?.message}
        fullWidth
      />

      <Input
        label="Телефон"
        placeholder="+79991234567"
        {...register('phoneNumber')}
        error={errors.phoneNumber?.message}
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
        Создать аккаунт
      </Button>
    </form>
  );
};

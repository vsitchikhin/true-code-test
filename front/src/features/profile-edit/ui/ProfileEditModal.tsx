import React, { useState, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Camera, User, FileText, Cake } from 'lucide-react';
import { Modal, Button, Input } from '@/shared/ui';
import { api } from '@/shared/api';
import { useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '@/entities/user';
import { AvatarCropper } from './AvatarCropper';
import styles from './ProfileEditModal.module.scss';

const MAX_BIO = 2000;

const profileSchema = z.object({
  username: z.string().min(3, 'Минимум 3 символа').max(20, 'Максимум 20 символов'),
  firstName: z.string().max(50, 'Максимум 50 символов').optional().nullable(),
  lastName: z.string().max(50, 'Максимум 50 символов').optional().nullable(),
  birthDate: z.string().optional().nullable(),
  bio: z.string().max(MAX_BIO, `Максимум ${MAX_BIO} символов`).optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose }) => {
  const authData = useUserStore((state) => state.authData);
  const setAuthData = useUserStore((state) => state.setAuthData);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [tempImage, setTempImage] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [croppedImage, setCroppedImage] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    authData?.avatarPath
      ? `${import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3000'}${authData.avatarPath}`
      : null,
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: authData?.username || '',
      firstName: authData?.firstName || '',
      lastName: authData?.lastName || '',
      birthDate: authData?.birthDate ? authData.birthDate.split('T')[0] : '',
      bio: authData?.bio || '',
    },
  });

  const bioValue = useWatch({ control, name: 'bio' }) ?? '';
  const bioLength = bioValue.length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImage(reader.result as string);
        setIsCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (blob: Blob) => {
    setCroppedImage(blob);
    setPreviewUrl(URL.createObjectURL(blob));
    setIsCropperOpen(false);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (croppedImage) {
        const file = new File([croppedImage], 'avatar.jpg', { type: 'image/jpeg' });
        await api.api.userControllerUpdateAvatar({ avatar: file });
      }

      const response = await api.api.userControllerUpdateMe({
        username: data.username,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        birthDate: data.birthDate || null,
        bio: data.bio || '',
      });

      setAuthData(response.data);
      void queryClient.invalidateQueries({ queryKey: ['user', response.data.username] });
      void queryClient.invalidateQueries({ queryKey: ['posts', 'user', response.data.username] });
      void queryClient.invalidateQueries({ queryKey: ['posts', 'infinite'] });

      onClose();
    } catch {
      setSubmitError('Не удалось обновить профиль. Возможно, имя уже занято.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const avatarFallback = `https://ui-avatars.com/api/?name=${authData?.username || 'U'}&background=6366f1&color=fff&bold=true&size=88`;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Редактировать профиль">
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper} onClick={() => fileInputRef.current?.click()}>
              {previewUrl ? (
                <img src={previewUrl} alt="Аватар" className={styles.avatarPreview} />
              ) : (
                <img src={avatarFallback} alt="Аватар" className={styles.avatarPreview} />
              )}
              <div className={styles.avatarOverlay}>
                <Camera size={22} />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className={styles.hiddenInput}
            />
            <div className={styles.avatarInfo}>
              <span className={styles.avatarTitle}>Фото профиля</span>
              <span className={styles.avatarHint}>
                Нажмите на аватар,
                <br />
                чтобы загрузить новое фото
              </span>
            </div>
          </div>

          <div className={styles.fields}>
            <div className={styles.row}>
              <Input
                label="Имя"
                placeholder="Имя"
                {...register('firstName')}
                error={errors.firstName?.message}
                fullWidth
              />
              <Input
                label="Фамилия"
                placeholder="Фамилия"
                {...register('lastName')}
                error={errors.lastName?.message}
                fullWidth
              />
            </div>

            <Input
              label={
                <>
                  <User size={13} /> Имя пользователя (ID)
                </>
              }
              placeholder="username"
              {...register('username')}
              error={errors.username?.message}
              fullWidth
            />

            <Input
              label={
                <>
                  <Cake size={13} /> Дата рождения
                </>
              }
              type="date"
              {...register('birthDate')}
              error={errors.birthDate?.message}
              fullWidth
            />

            <div className={styles.field}>
              <label className={styles.label}>
                <FileText size={13} />О себе
              </label>
              <div className={styles.inputWrapper}>
                <textarea
                  {...register('bio')}
                  className={`${styles.textarea} ${errors.bio ? styles.inputError : ''}`}
                  placeholder="Расскажите немного о себе..."
                  rows={4}
                />
                {bioLength > MAX_BIO * 0.8 && (
                  <span
                    className={`${styles.charCounter} ${
                      bioLength > MAX_BIO ? styles.charCounterOver : styles.charCounterWarn
                    }`}
                  >
                    {bioLength}/{MAX_BIO}
                  </span>
                )}
              </div>
              {errors.bio && <span className={styles.errorText}>{errors.bio.message}</span>}
            </div>
          </div>

          {submitError && <div className={styles.submitError}>{submitError}</div>}

          <div className={styles.footer}>
            <Button variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
              Отмена
            </Button>
            <Button size="sm" type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
              Сохранить
            </Button>
          </div>
        </form>
      </Modal>

      {tempImage && (
        <AvatarCropper
          image={tempImage}
          isOpen={isCropperOpen}
          onClose={() => setIsCropperOpen(false)}
          onCropComplete={onCropComplete}
        />
      )}
    </>
  );
};

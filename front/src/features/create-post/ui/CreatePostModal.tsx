import React, { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Send, ImagePlus } from 'lucide-react';
import { Modal, Button } from '@/shared/ui';
import { api } from '@/shared/api';
import { useUserStore } from '@/entities/user';
import { useQueryClient } from '@tanstack/react-query';
import styles from './CreatePostModal.module.scss';

const createPostSchema = z.object({
  content: z.string().min(1, 'Введите текст поста').max(1000, 'Слишком длинный текст'),
});

type CreatePostFormValues = z.infer<typeof createPostSchema>;

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAX_IMAGES = 10;

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const authData = useUserStore((state) => state.authData);

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostSchema),
  });

  const addImages = useCallback((files: File[]) => {
    const imageFiles = files.filter(
      (f) =>
        f.type.startsWith('image/') ||
        f.type === 'image/heic' ||
        f.type === 'image/heif' ||
        /\.(heic|heif)$/i.test(f.name),
    );
    if (!imageFiles.length) return;

    setSelectedImages((prev) => {
      const merged = [...prev, ...imageFiles].slice(0, MAX_IMAGES);
      return merged;
    });

    setPreviews((prev) => {
      const newUrls = imageFiles.map((f) => URL.createObjectURL(f));
      return [...prev, ...newUrls].slice(0, MAX_IMAGES);
    });
  }, []);

  const removeImage = useCallback((index: number) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addImages(Array.from(e.target.files));
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) addImages(Array.from(e.dataTransfer.files));
    },
    [addImages],
  );

  const handleClose = () => {
    previews.forEach((url) => URL.revokeObjectURL(url));
    reset();
    setSelectedImages([]);
    setPreviews([]);
    setSubmitError(null);
    onClose();
  };

  const onSubmit = async (data: CreatePostFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await api.api.postControllerCreate({ content: data.content, images: selectedImages });
      void queryClient.invalidateQueries({ queryKey: ['posts', 'infinite'] });
      handleClose();
    } catch {
      setSubmitError('Не удалось опубликовать пост. Попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadsUrl = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3000';
  const avatarUrl = authData?.avatarPath
    ? `${uploadsUrl}${authData.avatarPath}`
    : `https://ui-avatars.com/api/?name=${authData?.username || 'U'}&background=6366f1&color=fff&bold=true`;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Новый пост">
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* Автор + текст */}
        <div className={styles.compose}>
          <img src={avatarUrl} alt={authData?.username} className={styles.avatar} />
          <div className={styles.textareaWrap}>
            <textarea
              {...register('content')}
              placeholder="Что нового?"
              className={styles.textarea}
              autoFocus
            />
            {errors.content && <span className={styles.fieldError}>{errors.content.message}</span>}
          </div>
        </div>

        {/* Зона drag & drop */}
        <div
          className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''} ${selectedImages.length > 0 ? styles.dropZoneHasImages : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !selectedImages.length && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.heic,.heif"
            onChange={handleFileInput}
            className={styles.hiddenInput}
          />

          {selectedImages.length === 0 ? (
            <div className={styles.dropHint}>
              <ImagePlus size={28} strokeWidth={1.5} className={styles.dropIcon} />
              <span className={styles.dropText}>Перетащите фото или нажмите для выбора</span>
              <span className={styles.dropSub}>
                JPG, PNG, WEBP, GIF, AVIF, BMP, HEIC · до {MAX_IMAGES} файлов
              </span>
            </div>
          ) : (
            <div className={styles.previewGrid}>
              {previews.map((src, i) => (
                <div key={i} className={styles.previewItem}>
                  <img src={src} alt="" className={styles.previewImage} />
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(i);
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {selectedImages.length < MAX_IMAGES && (
                <button
                  type="button"
                  className={styles.addMoreBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <ImagePlus size={22} strokeWidth={1.5} />
                  <span>Ещё</span>
                </button>
              )}
            </div>
          )}
        </div>

        {submitError && <div className={styles.submitError}>{submitError}</div>}

        {/* Футер */}
        <div className={styles.footer}>
          <span className={styles.counter}>
            {selectedImages.length > 0 && `${selectedImages.length} / ${MAX_IMAGES} фото`}
          </span>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting} size="sm">
            <Send size={15} />
            Опубликовать
          </Button>
        </div>
      </form>
    </Modal>
  );
};

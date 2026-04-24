import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ImagePlus, X, Send, Save, Plus } from 'lucide-react';
import { Modal, Button } from '@/shared/ui';
import { api } from '@/shared/api';
import { useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '@/entities/user';
import type { Post } from '@/entities/post';
import styles from './PostFormModal.module.scss';

const MAX_IMAGES = 10;

const postSchema = z.object({
  content: z.string().max(1000, 'Слишком длинный текст'),
});

type PostFormValues = z.infer<typeof postSchema>;

interface PostFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  post?: Post;
}

const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3000';

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/') || /\.(heic|heif)$/i.test(file.name);
}

export const PostFormModal: React.FC<PostFormModalProps> = ({ isOpen, onClose, post }) => {
  const queryClient = useQueryClient();
  const authData = useUserStore((state) => state.authData);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!post;

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(() =>
    post ? post.images.map((img) => `${UPLOADS_URL}${img.path}`) : [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imagesToRemoveIds, setImagesToRemoveIds] = useState<string[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const previewsRef = useRef(previews);
  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: { content: post?.content ?? '' },
  });

  useEffect(() => {
    if (post) setValue('content', post.content);
  }, [post, setValue]);

  const addFiles = useCallback((files: File[]) => {
    const valid = files.filter(isImageFile);
    if (!valid.length) return;

    const remaining = MAX_IMAGES - previewsRef.current.length;
    if (remaining <= 0) return;

    const toAdd = valid.slice(0, remaining);
    setSelectedFiles((prev) => [...prev, ...toAdd]);
    setPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
  }, []);

  const removeImage = (index: number) => {
    const url = previews[index];

    if (post) {
      const original = post.images.find((img) => `${UPLOADS_URL}${img.path}` === url);
      if (original) setImagesToRemoveIds((prev) => [...prev, original.id]);
    }

    setPreviews((prev) => prev.filter((_, i) => i !== index));
    if (url.startsWith('blob:')) URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files));
  };

  const onSubmit = async (data: PostFormValues) => {
    if (!data.content.trim() && previews.length === 0) {
      setError('content', { message: 'Введите текст поста или добавьте фото' });
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (isEdit && post) {
        await api.api.postControllerUpdate(post.id, {
          content: data.content,
          removeImageIds: imagesToRemoveIds,
          images: selectedFiles,
        });
      } else {
        await api.api.postControllerCreate({ content: data.content, images: selectedFiles });
      }
      void queryClient.invalidateQueries({ queryKey: ['posts'] });
      onClose();
    } catch {
      setSubmitError('Не удалось сохранить пост. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const avatarUrl = authData?.avatarPath
    ? `${UPLOADS_URL}${authData.avatarPath}`
    : `https://ui-avatars.com/api/?name=${authData?.username ?? 'U'}&background=6366f1&color=fff&bold=true`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Редактировать пост' : 'Создать пост'}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.compose}>
          <img src={avatarUrl} alt={authData?.username} className={styles.avatar} />
          <div className={styles.textareaWrap}>
            <textarea
              {...register('content')}
              className={styles.textarea}
              placeholder="Что нового?"
              autoFocus
            />
            {errors.content && <span className={styles.fieldError}>{errors.content.message}</span>}
          </div>
        </div>

        <div
          className={[
            styles.dropZone,
            previews.length > 0 ? styles.dropZoneHasImages : '',
            isDragActive ? styles.dropZoneActive : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => previews.length === 0 && fileInputRef.current?.click()}
        >
          <input
            type="file"
            multiple
            accept="image/*,.heic,.heif"
            className={styles.hiddenInput}
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          {previews.length === 0 ? (
            <div className={styles.dropHint}>
              <ImagePlus className={styles.dropIcon} size={30} strokeWidth={1.5} />
              <span className={styles.dropText}>Перетащите фото или нажмите для выбора</span>
              <span className={styles.dropSub}>
                JPG, PNG, WEBP, GIF, AVIF, HEIC · до {MAX_IMAGES} файлов
              </span>
            </div>
          ) : (
            <div className={styles.previewGrid}>
              {previews.map((url, idx) => (
                <div key={idx} className={styles.previewItem}>
                  <img src={url} alt="" className={styles.previewImage} />
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {previews.length < MAX_IMAGES && (
                <button
                  type="button"
                  className={styles.addMoreBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Plus size={20} />
                  <span>Ещё</span>
                </button>
              )}
            </div>
          )}
        </div>

        {submitError && <div className={styles.submitError}>{submitError}</div>}

        <div className={styles.footer}>
          <span className={styles.counter}>
            {previews.length > 0 && `${previews.length} / ${MAX_IMAGES} фото`}
          </span>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting} size="sm">
            {isEdit ? <Save size={15} /> : <Send size={15} />}
            {isEdit ? 'Сохранить' : 'Опубликовать'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

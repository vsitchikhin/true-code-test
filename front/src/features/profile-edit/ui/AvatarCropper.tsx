import React, { useState, useCallback } from 'react';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import { Modal, Button } from '@/shared/ui';
import styles from './AvatarCropper.module.scss';

interface AvatarCropperProps {
  image: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImage: Blob) => void;
}

export const AvatarCropper: React.FC<AvatarCropperProps> = ({
  image,
  isOpen,
  onClose,
  onCropComplete,
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropCompleteCallback = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', reject);
      img.setAttribute('crossOrigin', 'anonymous');
      img.src = url;
    });

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      const img = await createImage(image);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const { x, y, width, height } = croppedAreaPixels;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) {
          onCropComplete(blob);
          onClose();
        }
      }, 'image/jpeg');
    } catch (e) {
      console.error(e);
    }
  };

  // --pct используется в CSS для закраски трека слева
  const pct = `${((zoom - 1) / 2) * 100}%`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Обрезать фото">
      <div className={styles.cropperWrapper}>
        <div className={styles.cropperContainer}>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteCallback}
            onZoomChange={setZoom}
          />
        </div>

        <div>
          <div className={styles.zoomLabel}>
            <span>Масштаб</span>
            <span className={styles.zoomValue}>{zoom.toFixed(1)}×</span>
          </div>
          <input
            type="range"
            className={styles.rangeInput}
            style={{ '--pct': pct } as React.CSSProperties}
            value={zoom}
            min={1}
            max={3}
            step={0.05}
            aria-label="Масштаб"
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button size="sm" onClick={handleSave}>
            Применить
          </Button>
        </div>
      </div>
    </Modal>
  );
};

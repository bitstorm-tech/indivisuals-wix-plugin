import { useCallback, useState } from 'react';
import { Crop, PixelCrop } from 'react-image-crop';
import { CropData } from '../types';

interface UseImageCropperReturn {
  crop: Crop;
  setCrop: (crop: Crop) => void;
  completedCrop: PixelCrop | null;
  setCompletedCrop: (crop: PixelCrop | null) => void;
  getCroppedImage: (image: HTMLImageElement, pixelCrop: PixelCrop) => Promise<File>;
  convertToCropData: (pixelCrop: PixelCrop, imageWidth: number, imageHeight: number) => CropData;
}

export function useImageCropper(aspect?: number): UseImageCropperReturn {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);

  const getCroppedImage = useCallback(async (image: HTMLImageElement, pixelCrop: PixelCrop): Promise<File> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );

    return new Promise<File>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'cropped-image.png', { type: 'image/png' });
          resolve(file);
        } else {
          reject(new Error('Canvas is empty'));
        }
      }, 'image/png');
    });
  }, []);

  const convertToCropData = useCallback((pixelCrop: PixelCrop, imageWidth: number, imageHeight: number): CropData => {
    return {
      unit: 'px',
      x: pixelCrop.x,
      y: pixelCrop.y,
      width: pixelCrop.width,
      height: pixelCrop.height,
    };
  }, []);

  return {
    crop,
    setCrop,
    completedCrop,
    setCompletedCrop,
    getCroppedImage,
    convertToCropData,
  };
}

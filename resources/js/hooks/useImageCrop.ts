import { useCallback, useRef, useState } from 'react';
import type { Crop, PixelCrop } from 'react-image-crop';

interface UseImageCropOptions {
  aspectRatio?: number;
  initialCropPercent?: number;
}

interface CroppedImageResult {
  url: string;
  file: File;
}

interface UseImageCropReturn {
  crop: Crop | undefined;
  setCrop: (crop: Crop | undefined) => void;
  completedCrop: PixelCrop | undefined;
  setCompletedCrop: (crop: PixelCrop | undefined) => void;
  imgRef: React.RefObject<HTMLImageElement | null>;
  getCroppedImage: (fileName?: string, fileType?: string) => Promise<CroppedImageResult | undefined>;
  setInitialCrop: (imageElement: HTMLImageElement) => void;
  resetCrop: () => void;
}

export function useImageCrop(options: UseImageCropOptions = {}): UseImageCropReturn {
  const { aspectRatio, initialCropPercent = 80 } = options;
  const [crop, setCrop] = useState<Crop | undefined>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | undefined>();
  const imgRef = useRef<HTMLImageElement>(null);
  const currentAspectRatioRef = useRef(aspectRatio);

  // Update the aspect ratio ref when it changes
  currentAspectRatioRef.current = aspectRatio;

  const setInitialCrop = useCallback(
    (imageElement: HTMLImageElement) => {
      const { width, height } = imageElement;
      const cropPercent = initialCropPercent / 100;
      const offset = (1 - cropPercent) / 2;

      let initialCrop: Crop = {
        unit: '%',
        x: offset * 100,
        y: offset * 100,
        width: cropPercent * 100,
        height: cropPercent * 100,
      };

      // Apply aspect ratio if specified
      if (aspectRatio) {
        const imageAspect = width / height;
        if (imageAspect > aspectRatio) {
          // Image is wider than aspect ratio
          const cropWidth = (cropPercent * 100 * aspectRatio) / imageAspect;
          initialCrop = {
            unit: '%',
            x: (100 - cropWidth) / 2,
            y: offset * 100,
            width: cropWidth,
            height: cropPercent * 100,
          };
        } else {
          // Image is taller than aspect ratio
          const cropHeight = (cropPercent * 100 * imageAspect) / aspectRatio;
          initialCrop = {
            unit: '%',
            x: offset * 100,
            y: (100 - cropHeight) / 2,
            width: cropPercent * 100,
            height: cropHeight,
          };
        }
      }

      setCrop(initialCrop);

      // Also set the pixel crop for immediate use
      const pixelCrop: PixelCrop = {
        unit: 'px',
        x: (initialCrop.x * width) / 100,
        y: (initialCrop.y * height) / 100,
        width: (initialCrop.width * width) / 100,
        height: (initialCrop.height * height) / 100,
      };
      setCompletedCrop(pixelCrop);
    },
    [aspectRatio, initialCropPercent],
  );

  const getCroppedImage = useCallback(
    async (fileName: string = 'cropped-image.png', fileType: string = 'image/png'): Promise<CroppedImageResult | undefined> => {
      if (!completedCrop || !imgRef.current) {
        return undefined;
      }

      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas 2D context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Set canvas size to the crop size
      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;

      // Draw the cropped image
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      return new Promise<CroppedImageResult>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas is empty'));
              return;
            }

            const file = new File([blob], fileName, { type: fileType });
            const url = URL.createObjectURL(blob);

            resolve({ url, file });
          },
          fileType,
          0.8, // Lower quality for smaller file sizes
        );
      });
    },
    [completedCrop],
  );

  const resetCrop = useCallback(() => {
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, []);

  return {
    crop,
    setCrop,
    completedCrop,
    setCompletedCrop,
    imgRef,
    getCroppedImage,
    setInitialCrop,
    resetCrop,
  };
}

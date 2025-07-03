import { Area } from 'react-easy-crop';
import { PixelCrop } from 'react-image-crop';

/**
 * Creates a cropped image from the source image using the provided crop data
 */
export async function getCroppedImg(imageSrc: string, pixelCrop: PixelCrop, targetWidth?: number, targetHeight?: number): Promise<string> {
  const image = new Image();
  image.src = imageSrc;

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Set canvas size to the target dimensions or crop dimensions
      canvas.width = targetWidth || pixelCrop.width;
      canvas.height = targetHeight || pixelCrop.height;

      // Draw the cropped image
      ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, canvas.width, canvas.height);

      // Convert to data URL
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }
          const url = URL.createObjectURL(blob);
          resolve(url);
        },
        'image/jpeg',
        0.95,
      );
    };

    image.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
}

/**
 * Creates a cropped image as base64 string
 */
export async function getCroppedImgBase64(imageSrc: string, pixelCrop: PixelCrop, targetWidth?: number, targetHeight?: number): Promise<string> {
  const image = new Image();
  image.src = imageSrc;

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Set canvas size to the target dimensions or crop dimensions
      canvas.width = targetWidth || pixelCrop.width;
      canvas.height = targetHeight || pixelCrop.height;

      // Draw the cropped image
      ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, canvas.width, canvas.height);

      // Convert to base64
      const base64 = canvas.toDataURL('image/jpeg', 0.95);
      resolve(base64);
    };

    image.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
}

/**
 * Creates a cropped image from react-easy-crop's Area format
 */
export async function getCroppedImgFromArea(imageSrc: string, pixelCrop: Area, targetWidth?: number, targetHeight?: number): Promise<string> {
  const image = new Image();
  image.src = imageSrc;

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Set canvas size to the target dimensions or crop dimensions
      canvas.width = targetWidth || pixelCrop.width;
      canvas.height = targetHeight || pixelCrop.height;

      // Draw the cropped image
      ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, canvas.width, canvas.height);

      // Convert to blob URL
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }
          const url = URL.createObjectURL(blob);
          resolve(url);
        },
        'image/jpeg',
        0.95,
      );
    };

    image.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
}

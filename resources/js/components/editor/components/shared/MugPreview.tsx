import { getCroppedImg } from '@/lib/imageCropUtils';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { PixelCrop } from 'react-image-crop';
import { CropData, MugOption } from '../../types';

interface MugPreviewProps {
  mug: MugOption;
  imageUrl: string;
  cropData?: CropData | null;
  className?: string;
}

export default function MugPreview({ mug, imageUrl, cropData, className }: MugPreviewProps) {
  const [displayImageUrl, setDisplayImageUrl] = useState<string>(imageUrl);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (cropData && cropData.width > 0 && cropData.height > 0) {
      setIsProcessing(true);

      // If crop data is in percentage, we need to load the image first to convert to pixels
      if (cropData.unit === '%') {
        const img = new Image();
        img.onload = () => {
          const pixelCrop: PixelCrop = {
            unit: 'px',
            x: (cropData.x / 100) * img.width,
            y: (cropData.y / 100) * img.height,
            width: (cropData.width / 100) * img.width,
            height: (cropData.height / 100) * img.height,
          };

          getCroppedImg(imageUrl, pixelCrop)
            .then((croppedUrl) => {
              setDisplayImageUrl(croppedUrl);
              setIsProcessing(false);
            })
            .catch((error) => {
              console.error('Failed to crop image:', error);
              setDisplayImageUrl(imageUrl); // Fallback to original
              setIsProcessing(false);
            });
        };
        img.src = imageUrl;
      } else {
        // Already in pixels
        const pixelCrop: PixelCrop = {
          unit: 'px',
          x: cropData.x,
          y: cropData.y,
          width: cropData.width,
          height: cropData.height,
        };

        getCroppedImg(imageUrl, pixelCrop)
          .then((croppedUrl) => {
            setDisplayImageUrl(croppedUrl);
            setIsProcessing(false);
          })
          .catch((error) => {
            console.error('Failed to crop image:', error);
            setDisplayImageUrl(imageUrl); // Fallback to original
            setIsProcessing(false);
          });
      }
    } else {
      setDisplayImageUrl(imageUrl);
    }
  }, [imageUrl, cropData]);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (displayImageUrl !== imageUrl && displayImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(displayImageUrl);
      }
    };
  }, [displayImageUrl, imageUrl]);

  return (
    <div className={cn('relative', className)}>
      <div className="relative mx-auto h-96 w-96">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-80 w-64 transform transition-transform hover:rotate-y-12">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gray-200 to-gray-300 shadow-2xl">
              <div className="absolute top-1/2 right-0 h-24 w-12 translate-x-8 -translate-y-1/2 rounded-full bg-gradient-to-r from-gray-300 to-gray-200 shadow-lg" />
            </div>

            <div className="absolute inset-4 overflow-hidden rounded-2xl">
              {isProcessing ? (
                <div className="flex h-full w-full items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="border-t-primary mb-2 h-8 w-8 animate-spin rounded-full border-2 border-gray-300"></div>
                    <p className="text-sm text-gray-600">Processing...</p>
                  </div>
                </div>
              ) : (
                <img src={displayImageUrl} alt="Your design" className="h-full w-full object-cover" />
              )}
            </div>

            <div className="absolute inset-x-0 bottom-0 h-1/3 rounded-b-3xl bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <h4 className="text-lg font-semibold">{mug.name}</h4>
        <p className="mt-1 text-sm text-gray-600">{mug.capacity}</p>
        {mug.special && (
          <span className="mt-2 inline-block rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">{mug.special}</span>
        )}
      </div>
    </div>
  );
}

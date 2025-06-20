import { cn } from '@/lib/utils';
import { useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  imageUrl: string;
  crop: Crop;
  onCropChange: (crop: Crop) => void;
  onCropComplete: (crop: PixelCrop) => void;
  className?: string;
}

export default function ImageCropper({ imageUrl, crop, onCropChange, onCropComplete, className }: ImageCropperProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
        <ReactCrop crop={crop} onChange={onCropChange} onComplete={onCropComplete} className="max-h-[500px]">
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Upload preview"
            className="max-h-[500px] max-w-full"
            onLoad={() => {
              if (!crop.width && !crop.height) {
                const newCrop: Crop = {
                  unit: '%',
                  width: 90,
                  height: 90,
                  x: 5,
                  y: 5,
                };
                onCropChange(newCrop);
              }
            }}
          />
        </ReactCrop>
      </div>
    </div>
  );
}

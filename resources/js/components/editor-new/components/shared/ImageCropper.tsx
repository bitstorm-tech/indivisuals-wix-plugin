import { cn } from '@/lib/utils';
import { useRef, useState } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { CROP_ASPECT_RATIOS } from '../../constants';

interface ImageCropperProps {
  imageUrl: string;
  crop: Crop;
  onCropChange: (crop: Crop) => void;
  onCropComplete: (crop: PixelCrop) => void;
  className?: string;
}

export default function ImageCropper({ imageUrl, crop, onCropChange, onCropComplete, className }: ImageCropperProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [selectedAspect, setSelectedAspect] = useState<number | undefined>(1);

  const handleAspectChange = (value: number | undefined) => {
    setSelectedAspect(value);
    if (value && imgRef.current) {
      const { width, height } = imgRef.current;
      const newCrop: Crop = {
        unit: '%',
        width: 50,
        height: value ? 50 / value : 50,
        x: 25,
        y: 25,
      };
      onCropChange(newCrop);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap gap-2">
        {CROP_ASPECT_RATIOS.map((ratio) => (
          <button
            key={ratio.label}
            onClick={() => handleAspectChange(ratio.value)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              selectedAspect === ratio.value ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            )}
          >
            {ratio.label}
          </button>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
        <ReactCrop crop={crop} onChange={onCropChange} onComplete={onCropComplete} aspect={selectedAspect} className="max-h-[500px]">
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Upload preview"
            className="max-h-[500px] max-w-full"
            onLoad={(e) => {
              const { width, height } = e.currentTarget;
              if (!crop.width && !crop.height) {
                const newCrop: Crop = {
                  unit: '%',
                  width: 90,
                  height: selectedAspect ? 90 / selectedAspect : 90,
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

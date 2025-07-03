import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { MugOption } from '../../types';

interface GeneratedImageCropperProps {
  imageUrl: string;
  crop: Crop;
  onCropChange: (crop: Crop) => void;
  onCropComplete: (crop: PixelCrop) => void;
  mug: MugOption;
  className?: string;
}

export default function GeneratedImageCropper({ imageUrl, crop, onCropChange, onCropComplete, mug, className }: GeneratedImageCropperProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(1);

  useEffect(() => {
    if (mug.print_template_width_mm && mug.print_template_height_mm) {
      const ratio = mug.print_template_width_mm / mug.print_template_height_mm;
      setAspectRatio(ratio);
    }
  }, [mug]);

  const handleImageLoad = () => {
    if (!crop.width && !crop.height && imgRef.current) {
      const { width: imgWidth, height: imgHeight } = imgRef.current;

      // Calculate initial crop to fit the mug aspect ratio
      let cropWidth = imgWidth * 0.9;
      let cropHeight = cropWidth / aspectRatio;

      // If the calculated height is too tall, base it on height instead
      if (cropHeight > imgHeight * 0.9) {
        cropHeight = imgHeight * 0.9;
        cropWidth = cropHeight * aspectRatio;
      }

      // Center the crop
      const x = (imgWidth - cropWidth) / 2;
      const y = (imgHeight - cropHeight) / 2;

      const newCrop: PixelCrop = {
        unit: 'px',
        width: cropWidth,
        height: cropHeight,
        x,
        y,
      };

      onCropChange(newCrop);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-semibold">Crop your generated image</h3>
          <p className="text-sm text-gray-600">Adjust the crop area to select the part of the image that will appear on your {mug.name}.</p>
          <p className="mt-1 text-xs text-gray-500">
            Aspect ratio is locked to match the mug's printable area ({mug.print_template_width_mm}mm × {mug.print_template_height_mm}mm)
          </p>
        </div>

        <div className="flex items-center justify-center rounded-lg bg-white p-4 shadow-inner">
          <ReactCrop crop={crop} onChange={onCropChange} onComplete={onCropComplete} aspect={aspectRatio} keepSelection>
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Generated image to crop"
              className="max-h-[500px] max-w-full object-contain"
              onLoad={handleImageLoad}
            />
          </ReactCrop>
        </div>
      </div>
    </div>
  );
}

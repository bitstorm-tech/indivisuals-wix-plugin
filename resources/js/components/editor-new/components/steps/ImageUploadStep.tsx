import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Upload, X } from 'lucide-react';
import React, { useCallback, useRef } from 'react';
import { PixelCrop } from 'react-image-crop';
import { useImageCropper } from '../../hooks/useImageCropper';
import { CropData } from '../../types';
import ImageCropper from '../shared/ImageCropper';

interface ImageUploadStepProps {
  uploadedImage: File | null;
  uploadedImageUrl: string | null;
  cropData: CropData | null;
  onImageUpload: (file: File, url: string) => void;
  onCropComplete: (cropData: CropData) => void;
  onRemoveImage: () => void;
}

export default function ImageUploadStep({ uploadedImageUrl, onImageUpload, onCropComplete, onRemoveImage }: ImageUploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { crop, setCrop, setCompletedCrop, convertToCropData } = useImageCropper();

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        onImageUpload(file, url);
      }
    },
    [onImageUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        onImageUpload(file, url);
      }
    },
    [onImageUpload],
  );

  const handleCropComplete = useCallback(
    (pixelCrop: PixelCrop) => {
      setCompletedCrop(pixelCrop);
      if (pixelCrop.width && pixelCrop.height) {
        const cropData = convertToCropData(pixelCrop);
        onCropComplete(cropData);
      }
    },
    [setCompletedCrop, convertToCropData, onCropComplete],
  );

  if (!uploadedImageUrl) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            'relative h-64 w-full max-w-md cursor-pointer rounded-lg border-2 border-dashed border-gray-300',
            'flex flex-col items-center justify-center bg-gray-50 transition-colors hover:bg-gray-100',
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mb-4 h-12 w-12 text-gray-400" />
          <p className="mb-2 text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP up to 4MB</p>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>

        <p className="text-center text-sm text-gray-600">Upload an image to get started with your personalized mug design</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Crop Your Image</h3>
        <Button variant="ghost" size="sm" onClick={onRemoveImage} className="text-red-600 hover:text-red-700">
          <X className="mr-2 h-4 w-4" />
          Remove Image
        </Button>
      </div>

      <p className="text-sm text-gray-600">Adjust the crop area to select the perfect portion of your image for the mug</p>

      <ImageCropper imageUrl={uploadedImageUrl} crop={crop} onCropChange={setCrop} onCropComplete={handleCropComplete} />
    </div>
  );
}

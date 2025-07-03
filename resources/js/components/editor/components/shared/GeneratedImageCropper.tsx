import { Slider } from '@/components/ui/Slider';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { MugOption } from '../../types';

interface GeneratedImageCropperProps {
  imageUrl: string;
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
  mug: MugOption;
  className?: string;
}

export default function GeneratedImageCropper({ imageUrl, onCropComplete, mug, className }: GeneratedImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Calculate aspect ratio from mug dimensions
  const aspectRatio = mug.print_template_width_mm && mug.print_template_height_mm ? mug.print_template_width_mm / mug.print_template_height_mm : 1;

  const handleCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    onCropComplete(croppedArea, croppedAreaPixels);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-semibold">Position and scale your design</h3>
          <p className="text-sm text-gray-600">Drag to move your image and use the slider to zoom in or out</p>
          <p className="mt-1 text-xs text-gray-500">
            The crop area matches your {mug.name}'s printable area ({mug.print_template_width_mm}mm × {mug.print_template_height_mm}mm)
          </p>
        </div>

        {/* Cropper container with fixed height */}
        <div className="custom-cropper relative h-[500px] w-full overflow-hidden rounded-lg bg-gray-100">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
            cropShape="rect"
            showGrid={false}
            restrictPosition={false}
            minZoom={0.5}
            maxZoom={3}
          />
        </div>

        {/* Zoom controls */}
        <div className="mt-6 space-y-2">
          <label className="text-sm font-medium text-gray-700">Zoom</label>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">-</span>
            <Slider value={[zoom]} onValueChange={(value) => setZoom(value[0])} min={0.5} max={3} step={0.1} className="flex-1" />
            <span className="text-sm text-gray-500">+</span>
          </div>
          <p className="text-center text-xs text-gray-500">{Math.round(zoom * 100)}%</p>
        </div>
      </div>
    </div>
  );
}

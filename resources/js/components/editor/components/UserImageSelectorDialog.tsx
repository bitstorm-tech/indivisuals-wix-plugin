import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { useImageCrop } from '@/hooks/useImageCrop';
import { Crop as CropIcon, Image, Square, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface UserImageSelectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelected?: (croppedImageUrl: string, croppedFile: File) => void;
}

type AspectRatioOption = 'free' | '1:1' | '16:9' | '4:3' | '3:2';

const ASPECT_RATIOS: Record<AspectRatioOption, { value: number | undefined; label: string; icon?: React.ReactElement }> = {
  free: { value: undefined, label: 'Frei', icon: <CropIcon className="h-4 w-4" /> },
  '1:1': { value: 1, label: '1:1 (Quadrat)', icon: <Square className="h-4 w-4" /> },
  '16:9': { value: 16 / 9, label: '16:9 (Breitbild)' },
  '4:3': { value: 4 / 3, label: '4:3 (Standard)' },
  '3:2': { value: 3 / 2, label: '3:2 (Foto)' },
};

export default function UserImageSelectorDialog({ isOpen, onClose, onImageSelected }: UserImageSelectorDialogProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('free');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageKey, setImageKey] = useState(0); // Force re-render of ReactCrop

  const { crop, setCrop, completedCrop, setCompletedCrop, imgRef, getCroppedImage, setInitialCrop, resetCrop } = useImageCrop({
    initialCropPercent: 80,
    aspectRatio: ASPECT_RATIOS[aspectRatio].value,
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        resetCrop(); // Reset crop state for new image
        setAspectRatio('free'); // Reset aspect ratio to free
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
          setSelectedImage(event.target?.result as string);
          resetCrop(); // Reset crop state for new image
          setAspectRatio('free'); // Reset aspect ratio to free
        };
        reader.readAsDataURL(file);
      }
    },
    [resetCrop],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleConfirm = async () => {
    if (completedCrop && imgRef.current && selectedFile) {
      try {
        const result = await getCroppedImage(selectedFile.name, selectedFile.type);
        if (result) {
          onImageSelected?.(result.url, result.file);
          handleClose();
        }
      } catch (error) {
        console.error('Error cropping image:', error);
      }
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    resetCrop();
    setAspectRatio('free');
    onClose();
  };

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setInitialCrop(e.currentTarget);
  };

  const handleAspectRatioChange = (newRatio: AspectRatioOption) => {
    setAspectRatio(newRatio);
    setImageKey((prev) => prev + 1); // Force re-render
    // The crop will be re-initialized when the image loads again
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Bild auswählen und zuschneiden</DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          {!selectedImage ? (
            <div
              className="flex min-h-[400px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:border-gray-400 hover:bg-gray-100"
              onClick={handleAreaClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Upload className="mb-4 h-12 w-12 text-gray-400" />
              <p className="mb-2 text-lg font-medium text-gray-700">Bild hier ablegen oder klicken zum Auswählen</p>
              <p className="text-sm text-gray-500">Unterstützte Formate: JPG, PNG, GIF, WebP</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Aspect Ratio Options */}
              <div className="space-y-2">
                <Label>Seitenverhältnis</Label>
                <RadioGroup value={aspectRatio} onValueChange={(value) => handleAspectRatioChange(value as AspectRatioOption)}>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ASPECT_RATIOS).map(([key, { label, icon }]) => (
                      <div key={key} className="flex items-center">
                        <RadioGroupItem value={key} id={`ratio-${key}`} className="sr-only" />
                        <Label
                          htmlFor={`ratio-${key}`}
                          className={`flex cursor-pointer items-center gap-1 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                            aspectRatio === key ? 'border-primary bg-primary text-primary-foreground' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {icon}
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center justify-center rounded-lg bg-gray-100 p-4">
                <ReactCrop
                  key={imageKey}
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={ASPECT_RATIOS[aspectRatio].value}
                >
                  <img ref={imgRef} src={selectedImage} alt="Crop preview" className="max-h-[500px] max-w-full object-contain" onLoad={onImageLoad} />
                </ReactCrop>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Reset to initial state
                    setSelectedImage(null);
                    setSelectedFile(null);
                    resetCrop();
                    setAspectRatio('free');
                  }}
                >
                  <Image className="mr-2 h-4 w-4" />
                  Anderes Bild wählen
                </Button>

                <div className="space-x-2">
                  <Button variant="outline" onClick={handleClose}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleConfirm} disabled={!completedCrop}>
                    Bild verwenden
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

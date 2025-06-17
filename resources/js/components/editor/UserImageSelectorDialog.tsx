import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Image, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface UserImageSelectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelected?: (croppedImageUrl: string, croppedFile: File) => void;
}

export default function UserImageSelectorDialog({ isOpen, onClose, onImageSelected }: UserImageSelectorDialogProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        // Initial crop will be set in onImageLoad
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        // Initial crop will be set in onImageLoad
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const getCroppedImg = useCallback(async (): Promise<{ url: string; file: File } | undefined> => {
    if (!completedCrop || !imgRef.current || !selectedFile) return undefined;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height,
    );

    return new Promise<{ url: string; file: File }>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Canvas is empty');
        }
        const croppedFile = new File([blob], selectedFile.name, { type: selectedFile.type });
        const croppedImageUrl = URL.createObjectURL(blob);
        resolve({ url: croppedImageUrl, file: croppedFile });
      }, selectedFile.type);
    });
  }, [completedCrop, selectedFile]);

  const handleConfirm = async () => {
    if (completedCrop && imgRef.current) {
      try {
        const result = await getCroppedImg();
        if (result) {
          const { url, file } = result;
          onImageSelected?.(url, file);
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
    setCrop(undefined);
    setCompletedCrop(undefined);
    onClose();
  };

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;

    // Set initial crop to center 80% of the image
    const initialCrop: PixelCrop = {
      unit: 'px',
      x: width * 0.1,
      y: height * 0.1,
      width: width * 0.8,
      height: height * 0.8,
    };

    // Set both crop and completedCrop so the button is enabled immediately
    setCrop({
      unit: '%',
      x: 10,
      y: 10,
      width: 80,
      height: 80,
    });
    setCompletedCrop(initialCrop);
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
              <div className="flex items-center justify-center rounded-lg bg-gray-100 p-4">
                <ReactCrop crop={crop} onChange={(c) => setCrop(c)} onComplete={(c) => setCompletedCrop(c)} aspect={undefined}>
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
                    setCrop(undefined);
                    setCompletedCrop(undefined);
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

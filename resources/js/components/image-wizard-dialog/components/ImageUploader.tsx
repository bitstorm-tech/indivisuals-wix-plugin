import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Upload } from 'lucide-react';
import React from 'react';

interface ImageUploaderProps {
  onFileUpload: (file: File) => void;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileUpload, isDragging, onDragOver, onDragLeave, onDrop }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div key="upload" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <p className="text-center text-lg font-medium">
        <Upload className="mr-2 inline h-5 w-5 text-blue-500" />
        Now add your photo to the cauldron!
      </p>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          'rounded-lg border-2 border-dashed p-12 text-center transition-all',
          isDragging ? 'scale-105 border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400',
        )}
      >
        <motion.div
          animate={{
            y: isDragging ? -10 : 0,
            scale: isDragging ? 1.1 : 1,
          }}
        >
          <ImageIcon className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <p className="mb-2 text-lg font-medium">{isDragging ? "Drop it like it's hot! 🔥" : 'Drag & drop your photo here'}</p>
          <p className="mb-4 text-sm text-gray-500">or</p>
          <Button variant="outline" onClick={handleChooseFile}>
            Choose from device
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileUpload(file);
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ImageUploader;

import { Image } from 'lucide-react';
import React, { useRef } from 'react';
import { Button } from '../ui/Button';

interface EditorImageUploaderProps {
  onFileSelect: (files: File[]) => void;
  maxFiles: number;
  currentCount: number;
  disabled?: boolean;
  onButtonClick?: () => void;
}

export default function EditorImageUploader({ onFileSelect, maxFiles, currentCount, disabled = false, onButtonClick }: EditorImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const remainingSlots = maxFiles - currentCount;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => file.type.startsWith('image/'));
    const filesToAdd = validFiles.slice(0, remainingSlots);

    if (filesToAdd.length > 0) {
      onFileSelect(filesToAdd);
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      inputRef.current?.click();
    }
  };

  const isDisabled = disabled || remainingSlots <= 0;

  return (
    <>
      <Button onClick={handleButtonClick} disabled={isDisabled}>
        <Image className="mr-2 h-4 w-4" />
        Bild auswählen ({currentCount}/{maxFiles})
      </Button>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isDisabled} />
    </>
  );
}

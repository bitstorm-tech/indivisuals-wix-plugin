import React, { useRef } from 'react';
import { Button } from '../ui/Button';

interface FileUploaderProps {
  selectedFile: File | undefined;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  canUpload: boolean;
  isProcessing: boolean;
}

export default function FileUploader({ selectedFile, onFileChange, onUpload, canUpload, isProcessing }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center space-x-2">
      <Button onClick={() => inputRef?.current?.click()} disabled={isProcessing}>
        Bild wählen
      </Button>
      {selectedFile && (
        <Button onClick={onUpload} disabled={!canUpload || isProcessing}>
          {isProcessing && <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>}
          {isProcessing ? 'Wird bearbeitet...' : 'Bild hochladen'}
        </Button>
      )}
      <input type="file" className="input" onChange={onFileChange} ref={inputRef} accept="image/*" hidden />
    </div>
  );
}

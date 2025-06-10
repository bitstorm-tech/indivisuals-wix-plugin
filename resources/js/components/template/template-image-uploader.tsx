import React, { useRef } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface TemplateImageUploaderProps {
  onFileSelect: (files: File[]) => void;
  maxFiles: number;
  currentCount: number;
  disabled?: boolean;
}

export default function TemplateImageUploader({ onFileSelect, maxFiles, currentCount, disabled = false }: TemplateImageUploaderProps) {
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter((file) => file.type.startsWith('image/'));
    const filesToAdd = validFiles.slice(0, remainingSlots);

    if (filesToAdd.length > 0) {
      onFileSelect(filesToAdd);
    }
  };

  const isDisabled = disabled || remainingSlots <= 0;

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Bilder hinzufügen</h4>
          <span className="text-sm text-gray-500">
            {currentCount}/{maxFiles}
          </span>
        </div>

        <div
          className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            isDisabled ? 'cursor-not-allowed border-gray-200 bg-gray-50' : 'cursor-pointer border-gray-300 hover:border-gray-400'
          } `}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !isDisabled && inputRef.current?.click()}
        >
          {isDisabled ? (
            <div className="text-gray-400">
              <div className="mb-2 text-2xl">📷</div>
              <div>Maximale Anzahl erreicht</div>
            </div>
          ) : (
            <div className="text-gray-600">
              <div className="mb-2 text-2xl">📷</div>
              <div className="font-medium">Bilder hierher ziehen</div>
              <div className="text-sm">oder klicken zum Auswählen</div>
              <div className="mt-2 text-xs text-gray-500">
                Noch {remainingSlots} Bild{remainingSlots !== 1 ? 'er' : ''} möglich
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={isDisabled} className="flex-1">
            📁 Dateien auswählen
          </Button>
        </div>

        <div className="text-xs text-gray-500">Unterstützte Formate: JPG, PNG, GIF, WebP</div>
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} disabled={isDisabled} />
    </Card>
  );
}

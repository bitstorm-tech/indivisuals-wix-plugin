import React, { useCallback } from 'react';
import { TemplateCanvasProps, TemplateImage } from '../../types/template';
import DraggableImage from './draggable-image';

interface TemplateCanvasExtendedProps extends TemplateCanvasProps {
  selectedImageId: string | null;
  onImageSelect: (id: string | null) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
}

export default function TemplateCanvas({
  images,
  onImageUpdate,
  onImageDelete,
  onImageSelect,
  selectedImageId,
  canvasSize,
  onDrop,
  onDragOver
}: TemplateCanvasExtendedProps) {
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onImageSelect(null);
    }
  }, [onImageSelect]);

  const handleImageUpdate = useCallback((id: string, updates: Partial<TemplateImage>) => {
    onImageUpdate(id, updates);
  }, [onImageUpdate]);

  const handleImageSelect = useCallback((id: string) => {
    onImageSelect(id);
  }, [onImageSelect]);

  const handleImageDelete = useCallback((id: string) => {
    onImageDelete(id);
    if (selectedImageId === id) {
      onImageSelect(null);
    }
  }, [onImageDelete, onImageSelect, selectedImageId]);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Template Bearbeitung</h3>
        <div className="text-sm text-gray-500">
          {images.length}/3 Bilder
        </div>
      </div>
      
      <div
        className="relative bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
        onClick={handleCanvasClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        {images.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-center">
            <div>
              <div className="text-4xl mb-2">📷</div>
              <div>Ziehen Sie Bilder hierher oder</div>
              <div>verwenden Sie den Upload-Button</div>
              <div className="text-sm mt-2">(Maximal 3 Bilder)</div>
            </div>
          </div>
        )}
        
        {images.map((image) => (
          <DraggableImage
            key={image.id}
            image={image}
            isSelected={selectedImageId === image.id}
            onUpdate={(updates) => handleImageUpdate(image.id, updates)}
            onSelect={() => handleImageSelect(image.id)}
            onDelete={() => handleImageDelete(image.id)}
            canvasSize={canvasSize}
          />
        ))}
      </div>
      
      {images.length > 0 && (
        <div className="text-xs text-gray-500 space-y-1">
          <div>💡 Tipps:</div>
          <div>• Klicken Sie auf ein Bild zum Auswählen</div>
          <div>• Ziehen Sie Bilder zum Verschieben</div>
          <div>• Ziehen Sie an den Ecken zum Größe ändern</div>
          <div>• Klicken Sie auf × zum Löschen</div>
        </div>
      )}
    </div>
  );
}
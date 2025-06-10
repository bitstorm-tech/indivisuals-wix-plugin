import React, { useCallback } from 'react';
import { TemplateCanvasProps, TemplateImage, TemplateText } from '../../types/template';
import DraggableImage from './draggable-image';
import DraggableText from './draggable-text';

interface TemplateCanvasExtendedProps extends TemplateCanvasProps {
  selectedElementId: string | null;
  selectedElementType: 'image' | 'text' | null;
  onElementSelect: (id: string | null, type: 'image' | 'text' | null) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  backgroundColor: string;
}

export default function TemplateCanvas({
  images,
  texts,
  onImageUpdate,
  onImageDelete,
  onTextUpdate,
  onTextDelete,
  onElementSelect,
  selectedElementId,
  selectedElementType,
  canvasSize,
  onDrop,
  onDragOver,
  backgroundColor,
}: TemplateCanvasExtendedProps) {
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onElementSelect(null, null);
      }
    },
    [onElementSelect],
  );

  const handleImageUpdate = useCallback(
    (id: string, updates: Partial<TemplateImage>) => {
      onImageUpdate(id, updates);
    },
    [onImageUpdate],
  );

  const handleImageSelect = useCallback(
    (id: string) => {
      onElementSelect(id, 'image');
    },
    [onElementSelect],
  );

  const handleImageDelete = useCallback(
    (id: string) => {
      onImageDelete(id);
      if (selectedElementId === id && selectedElementType === 'image') {
        onElementSelect(null, null);
      }
    },
    [onImageDelete, onElementSelect, selectedElementId, selectedElementType],
  );

  const handleTextUpdate = useCallback(
    (id: string, updates: Partial<TemplateText>) => {
      onTextUpdate(id, updates);
    },
    [onTextUpdate],
  );

  const handleTextSelect = useCallback(
    (id: string) => {
      onElementSelect(id, 'text');
    },
    [onElementSelect],
  );

  const handleTextDelete = useCallback(
    (id: string) => {
      onTextDelete(id);
      if (selectedElementId === id && selectedElementType === 'text') {
        onElementSelect(null, null);
      }
    },
    [onTextDelete, onElementSelect, selectedElementId, selectedElementType],
  );

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Template Bearbeitung</h3>
        <div className="text-sm text-gray-500">
          {images.length}/3 Bilder • {texts.length} Texte
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-lg border-2 border-dashed border-gray-300"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          backgroundColor,
        }}
        onClick={handleCanvasClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        {images.length === 0 && texts.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-center text-gray-400">
            <div>
              <div className="mb-2 text-4xl">📷📝</div>
              <div>Ziehen Sie Bilder hierher oder</div>
              <div>fügen Sie Text hinzu</div>
              <div className="mt-2 text-sm">(Maximal 3 Bilder + unbegrenzt Text)</div>
            </div>
          </div>
        )}

        {images.map((image) => (
          <DraggableImage
            key={image.id}
            image={image}
            isSelected={selectedElementId === image.id && selectedElementType === 'image'}
            onUpdate={(updates) => handleImageUpdate(image.id, updates)}
            onSelect={() => handleImageSelect(image.id)}
            onDelete={() => handleImageDelete(image.id)}
            canvasSize={canvasSize}
          />
        ))}

        {texts.map((text) => (
          <DraggableText
            key={text.id}
            text={text}
            isSelected={selectedElementId === text.id && selectedElementType === 'text'}
            onUpdate={(updates) => handleTextUpdate(text.id, updates)}
            onSelect={() => handleTextSelect(text.id)}
            onDelete={() => handleTextDelete(text.id)}
            canvasSize={canvasSize}
          />
        ))}
      </div>

      {(images.length > 0 || texts.length > 0) && (
        <div className="space-y-1 text-xs text-gray-500">
          <div>💡 Tipps:</div>
          <div>• Klicken Sie auf Elemente zum Auswählen</div>
          <div>• Ziehen Sie Elemente zum Verschieben</div>
          <div>• Ziehen Sie an den Ecken zum Größe ändern</div>
          <div>• Doppelklick auf Text zum Bearbeiten</div>
          <div>• Klicken Sie auf × zum Löschen</div>
        </div>
      )}
    </div>
  );
}

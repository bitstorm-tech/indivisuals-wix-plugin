import React, { useCallback } from 'react';
import { EditorCanvasProps, EditorImage, EditorText } from '../../types/editor';
import DraggableImage from './DraggableImage';
import DraggableText from './DraggableText';

interface EditorCanvasExtendedProps extends EditorCanvasProps {
  selectedElementId: string | null;
  selectedElementType: 'image' | 'text' | null;
  onElementSelect: (id: string | null, type: 'image' | 'text' | null) => void;
  backgroundColor: string;
}

export default function EditorCanvas({
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
  backgroundColor,
}: EditorCanvasExtendedProps) {
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onElementSelect(null, null);
      }
    },
    [onElementSelect],
  );

  const handleImageUpdate = useCallback(
    (id: string, updates: Partial<EditorImage>) => {
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
    (id: string, updates: Partial<EditorText>) => {
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
      <div
        className="relative overflow-hidden rounded-lg border-2 border-dashed border-gray-300"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          backgroundColor,
        }}
        onClick={handleCanvasClick}
      >
        {images.length === 0 && texts.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-center text-gray-400">
            <div>
              <div className="mb-2 text-4xl">📷📝</div>
              <div>Fügen Sie Bilder und Text hinzu</div>
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
    </div>
  );
}

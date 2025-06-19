import { EditorImage, EditorText } from '@/types/editor';
import React from 'react';

interface EditorCanvasProps {
  images: EditorImage[];
  texts: EditorText[];
  selectedElementId: string | null;
  selectedElementType: 'image' | 'text' | null;
  onImageUpdate: (id: string, updates: Partial) => void;
  onImageDelete: (id: string) => void;
  onTextUpdate: (id: string, updates: Partial) => void;
  onTextDelete: (id: string) => void;
  onSelectElement: (id: string, type: 'image' | 'text') => void;
  onClearSelection: () => void;
}

export default React.memo(function EditorCanvas({
  images,
  texts,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedElementId: _selectedElementId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedElementType: _selectedElementType,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onImageUpdate: _onImageUpdate,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onImageDelete: _onImageDelete,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onTextUpdate: _onTextUpdate,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onTextDelete: _onTextDelete,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSelectElement: _onSelectElement,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClearSelection: _onClearSelection,
}: EditorCanvasProps) {
  return (
    <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
      <div className="text-center">
        <p className="text-lg font-medium text-gray-600">Editor Canvas</p>
        <p className="mt-1 text-sm text-gray-500">Canvas implementation coming soon</p>
        {(images.length > 0 || texts.length > 0) && (
          <div className="mt-4 text-xs text-gray-400">
            {images.length} images, {texts.length} texts
          </div>
        )}
      </div>
    </div>
  );
});

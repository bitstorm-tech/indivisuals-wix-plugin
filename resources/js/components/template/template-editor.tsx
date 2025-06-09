import React, { useState, useCallback } from 'react';
import { TemplateImage, TemplateEditorState, TemplateSize } from '../../types/template';
import TemplateCanvas from './template-canvas';
import TemplateImageUploader from './template-image-uploader';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface TemplateEditorProps {
  canvasSize?: TemplateSize;
  maxImages?: number;
  onExport?: (images: TemplateImage[]) => void;
}

const DEFAULT_CANVAS_SIZE: TemplateSize = {
  width: 800,
  height: 600
};

const DEFAULT_IMAGE_SIZE: TemplateSize = {
  width: 200,
  height: 150
};

export default function TemplateEditor({
  canvasSize = DEFAULT_CANVAS_SIZE,
  maxImages = 3,
  onExport
}: TemplateEditorProps) {
  const [state, setState] = useState<TemplateEditorState>({
    images: [],
    selectedImageId: null,
    maxImages
  });

  const generateImageId = () => `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const findAvailablePosition = useCallback((existingImages: TemplateImage[]): { x: number; y: number } => {
    const positions = [
      { x: 50, y: 50 },
      { x: 300, y: 50 },
      { x: 550, y: 50 },
      { x: 50, y: 200 },
      { x: 300, y: 200 },
      { x: 550, y: 200 },
      { x: 50, y: 350 },
      { x: 300, y: 350 },
      { x: 550, y: 350 }
    ];

    for (const pos of positions) {
      const occupied = existingImages.some(img => 
        Math.abs(img.position.x - pos.x) < 100 && 
        Math.abs(img.position.y - pos.y) < 100
      );
      if (!occupied) return pos;
    }

    return { x: 50 + (existingImages.length * 30), y: 50 + (existingImages.length * 30) };
  }, []);

  const handleFileSelect = useCallback((files: File[]) => {
    setState(prevState => {
      const remainingSlots = prevState.maxImages - prevState.images.length;
      const filesToAdd = files.slice(0, remainingSlots);
      
      const newImages: TemplateImage[] = filesToAdd.map((file, index) => {
        const position = findAvailablePosition([...prevState.images]);
        
        return {
          id: generateImageId(),
          file,
          url: URL.createObjectURL(file),
          position: {
            x: position.x + (index * 30),
            y: position.y + (index * 30)
          },
          size: { ...DEFAULT_IMAGE_SIZE },
          zIndex: prevState.images.length + index + 1
        };
      });

      return {
        ...prevState,
        images: [...prevState.images, ...newImages],
        selectedImageId: newImages.length > 0 ? newImages[0].id : prevState.selectedImageId
      };
    });
  }, [findAvailablePosition]);

  const handleImageUpdate = useCallback((id: string, updates: Partial<TemplateImage>) => {
    setState(prevState => ({
      ...prevState,
      images: prevState.images.map(img =>
        img.id === id ? { ...img, ...updates } : img
      )
    }));
  }, []);

  const handleImageDelete = useCallback((id: string) => {
    setState(prevState => {
      const imageToDelete = prevState.images.find(img => img.id === id);
      if (imageToDelete) {
        URL.revokeObjectURL(imageToDelete.url);
      }
      
      return {
        ...prevState,
        images: prevState.images.filter(img => img.id !== id),
        selectedImageId: prevState.selectedImageId === id ? null : prevState.selectedImageId
      };
    });
  }, []);

  const handleImageSelect = useCallback((id: string | null) => {
    setState(prevState => ({
      ...prevState,
      selectedImageId: id
    }));
  }, []);

  const handleClearAll = useCallback(() => {
    setState(prevState => {
      prevState.images.forEach(img => URL.revokeObjectURL(img.url));
      return {
        ...prevState,
        images: [],
        selectedImageId: null
      };
    });
  }, []);

  const handleExport = useCallback(() => {
    if (onExport) {
      onExport(state.images);
    } else {
      console.log('Template Export:', state.images);
    }
  }, [state.images, onExport]);

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (state.images.length >= state.maxImages) return;
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length > 0) {
      handleFileSelect(validFiles);
    }
  }, [state.images.length, state.maxImages, handleFileSelect]);

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Template Editor</h2>
          <div className="flex gap-2">
            {state.images.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                >
                  Alle löschen
                </Button>
                <Button
                  size="sm"
                  onClick={handleExport}
                >
                  Exportieren
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TemplateCanvas
              images={state.images}
              onImageUpdate={handleImageUpdate}
              onImageDelete={handleImageDelete}
              onImageSelect={handleImageSelect}
              selectedImageId={state.selectedImageId}
              canvasSize={canvasSize}
              onDrop={handleCanvasDrop}
              onDragOver={handleCanvasDragOver}
            />
          </div>
          
          <div className="space-y-4">
            <TemplateImageUploader
              onFileSelect={handleFileSelect}
              maxFiles={state.maxImages}
              currentCount={state.images.length}
            />
            
            {state.selectedImageId && (
              <Card className="p-4">
                <h4 className="font-medium mb-3">Bild Eigenschaften</h4>
                <div className="space-y-2 text-sm">
                  {(() => {
                    const selectedImage = state.images.find(img => img.id === state.selectedImageId);
                    if (!selectedImage) return null;
                    
                    return (
                      <div className="space-y-1">
                        <div>Position: {Math.round(selectedImage.position.x)}, {Math.round(selectedImage.position.y)}</div>
                        <div>Größe: {Math.round(selectedImage.size.width)} × {Math.round(selectedImage.size.height)}</div>
                        <div>Datei: {selectedImage.file.name}</div>
                      </div>
                    );
                  })()}
                </div>
              </Card>
            )}
            
            <Card className="p-4">
              <h4 className="font-medium mb-3">Anleitung</h4>
              <div className="text-sm space-y-1 text-gray-600">
                <div>1. Bilder per Drag & Drop oder Upload hinzufügen</div>
                <div>2. Bilder durch Anklicken auswählen</div>
                <div>3. Ausgewählte Bilder verschieben und skalieren</div>
                <div>4. Mit Exportieren das Ergebnis speichern</div>
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
}
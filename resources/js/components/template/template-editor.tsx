import React, { useCallback, useState } from 'react';
import { TemplateEditorState, TemplateImage, TemplateSize, TemplateText } from '../../types/template';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import TemplateCanvas from './template-canvas';
import TemplateImageUploader from './template-image-uploader';
import TextAdder from './text-adder';
import TextPropertiesPanel from './text-properties-panel';

interface TemplateEditorProps {
  canvasSize?: TemplateSize;
  maxImages?: number;
  onExport?: (data: { images: TemplateImage[]; texts: TemplateText[] }) => void;
}

const DEFAULT_CANVAS_SIZE: TemplateSize = {
  width: 800,
  height: 600,
};

const DEFAULT_IMAGE_SIZE: TemplateSize = {
  width: 200,
  height: 150,
};

export default function TemplateEditor({ canvasSize = DEFAULT_CANVAS_SIZE, maxImages = 3, onExport }: TemplateEditorProps) {
  const [state, setState] = useState<TemplateEditorState>({
    images: [],
    texts: [],
    selectedElementId: null,
    selectedElementType: null,
    maxImages,
  });

  const generateId = (type: 'img' | 'txt') => `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const findAvailablePosition = useCallback((existingElements: Array<{ position: { x: number; y: number } }>): { x: number; y: number } => {
    const positions = [
      { x: 50, y: 50 },
      { x: 300, y: 50 },
      { x: 550, y: 50 },
      { x: 50, y: 200 },
      { x: 300, y: 200 },
      { x: 550, y: 200 },
      { x: 50, y: 350 },
      { x: 300, y: 350 },
      { x: 550, y: 350 },
    ];

    for (const pos of positions) {
      const occupied = existingElements.some((element) => Math.abs(element.position.x - pos.x) < 100 && Math.abs(element.position.y - pos.y) < 100);
      if (!occupied) return pos;
    }

    return { x: 50 + existingElements.length * 30, y: 50 + existingElements.length * 30 };
  }, []);

  const handleFileSelect = useCallback(
    (files: File[]) => {
      setState((prevState) => {
        const remainingSlots = prevState.maxImages - prevState.images.length;
        const filesToAdd = files.slice(0, remainingSlots);

        const newImages: TemplateImage[] = filesToAdd.map((file, index) => {
          const position = findAvailablePosition([...prevState.images, ...prevState.texts]);

          return {
            id: generateId('img'),
            file,
            url: URL.createObjectURL(file),
            position: {
              x: position.x + index * 30,
              y: position.y + index * 30,
            },
            size: { ...DEFAULT_IMAGE_SIZE },
            zIndex: prevState.images.length + index + 1,
          };
        });

        return {
          ...prevState,
          images: [...prevState.images, ...newImages],
          selectedElementId: newImages.length > 0 ? newImages[0].id : prevState.selectedElementId,
          selectedElementType: newImages.length > 0 ? 'image' : prevState.selectedElementType,
        };
      });
    },
    [findAvailablePosition],
  );

  const handleImageUpdate = useCallback((id: string, updates: Partial<TemplateImage>) => {
    setState((prevState) => ({
      ...prevState,
      images: prevState.images.map((img) => (img.id === id ? { ...img, ...updates } : img)),
    }));
  }, []);

  const handleImageDelete = useCallback((id: string) => {
    setState((prevState) => {
      const imageToDelete = prevState.images.find((img) => img.id === id);
      if (imageToDelete) {
        URL.revokeObjectURL(imageToDelete.url);
      }

      return {
        ...prevState,
        images: prevState.images.filter((img) => img.id !== id),
        selectedElementId: prevState.selectedElementId === id ? null : prevState.selectedElementId,
        selectedElementType: prevState.selectedElementId === id ? null : prevState.selectedElementType,
      };
    });
  }, []);

  const handleTextUpdate = useCallback((id: string, updates: Partial<TemplateText>) => {
    setState((prevState) => ({
      ...prevState,
      texts: prevState.texts.map((text) => (text.id === id ? { ...text, ...updates } : text)),
    }));
  }, []);

  const handleTextDelete = useCallback((id: string) => {
    setState((prevState) => ({
      ...prevState,
      texts: prevState.texts.filter((text) => text.id !== id),
      selectedElementId: prevState.selectedElementId === id ? null : prevState.selectedElementId,
      selectedElementType: prevState.selectedElementId === id ? null : prevState.selectedElementType,
    }));
  }, []);

  const handleElementSelect = useCallback((id: string | null, type: 'image' | 'text' | null) => {
    setState((prevState) => ({
      ...prevState,
      selectedElementId: id,
      selectedElementType: type,
    }));
  }, []);

  const handleAddText = useCallback(() => {
    setState((prevState) => {
      const position = findAvailablePosition([...prevState.images, ...prevState.texts]);

      const newText: TemplateText = {
        id: generateId('txt'),
        content: 'Neuer Text',
        position,
        size: { width: 200, height: 60 },
        style: {
          fontFamily: 'Arial',
          fontSize: 24,
          color: '#000000',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textAlign: 'left',
        },
        zIndex: 1000 + prevState.texts.length + 1,
      };

      return {
        ...prevState,
        texts: [...prevState.texts, newText],
        selectedElementId: newText.id,
        selectedElementType: 'text',
      };
    });
  }, [findAvailablePosition]);

  const handleClearAll = useCallback(() => {
    setState((prevState) => {
      prevState.images.forEach((img) => URL.revokeObjectURL(img.url));
      return {
        ...prevState,
        images: [],
        texts: [],
        selectedElementId: null,
        selectedElementType: null,
      };
    });
  }, []);

  const handleExport = useCallback(() => {
    const exportData = { images: state.images, texts: state.texts };
    if (onExport) {
      onExport(exportData);
    } else {
      console.log('Template Export:', exportData);
    }
  }, [state.images, state.texts, onExport]);

  const handleCanvasDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      if (state.images.length >= state.maxImages) return;

      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter((file) => file.type.startsWith('image/'));

      if (validFiles.length > 0) {
        handleFileSelect(validFiles);
      }
    },
    [state.images.length, state.maxImages, handleFileSelect],
  );

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Template Editor</h2>
          <div className="flex gap-2">
            {(state.images.length > 0 || state.texts.length > 0) && (
              <>
                <Button variant="outline" size="sm" onClick={handleClearAll}>
                  Alle löschen
                </Button>
                <Button size="sm" onClick={handleExport}>
                  Exportieren
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TemplateCanvas
              images={state.images}
              texts={state.texts}
              onImageUpdate={handleImageUpdate}
              onImageDelete={handleImageDelete}
              onTextUpdate={handleTextUpdate}
              onTextDelete={handleTextDelete}
              onElementSelect={handleElementSelect}
              selectedElementId={state.selectedElementId}
              selectedElementType={state.selectedElementType}
              canvasSize={canvasSize}
              onDrop={handleCanvasDrop}
              onDragOver={handleCanvasDragOver}
            />
          </div>

          <div className="space-y-4">
            <TemplateImageUploader onFileSelect={handleFileSelect} maxFiles={state.maxImages} currentCount={state.images.length} />

            <TextAdder onAddText={handleAddText} />

            {state.selectedElementId && state.selectedElementType === 'image' && (
              <Card className="p-4">
                <h4 className="mb-3 font-medium">Bild Eigenschaften</h4>
                <div className="space-y-2 text-sm">
                  {(() => {
                    const selectedImage = state.images.find((img) => img.id === state.selectedElementId);
                    if (!selectedImage) return null;

                    return (
                      <div className="space-y-1">
                        <div>
                          Position: {Math.round(selectedImage.position.x)}, {Math.round(selectedImage.position.y)}
                        </div>
                        <div>
                          Größe: {Math.round(selectedImage.size.width)} × {Math.round(selectedImage.size.height)}
                        </div>
                        <div>Datei: {selectedImage.file.name}</div>
                      </div>
                    );
                  })()}
                </div>
              </Card>
            )}

            {state.selectedElementId &&
              state.selectedElementType === 'text' &&
              (() => {
                const selectedText = state.texts.find((text) => text.id === state.selectedElementId);
                return selectedText ? (
                  <TextPropertiesPanel text={selectedText} onUpdate={(updates) => handleTextUpdate(selectedText.id, updates)} />
                ) : null;
              })()}

            <Card className="p-4">
              <h4 className="mb-3 font-medium">Anleitung</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>1. Bilder per Drag & Drop oder Upload hinzufügen</div>
                <div>2. Text mit dem "Text erstellen" Button hinzufügen</div>
                <div>3. Elemente durch Anklicken auswählen</div>
                <div>4. Ausgewählte Elemente verschieben und skalieren</div>
                <div>5. Text per Doppelklick bearbeiten</div>
                <div>6. Mit Exportieren das Ergebnis speichern</div>
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
}

import { ChevronDown, Download, Info, Palette } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { EditorImage, EditorSize, EditorState, EditorText, EXPORT_RESOLUTIONS, ExportResolutionId, ExportSettings } from '../../types/editor';
import { Prompt } from '../image-wizard-dialog/constants';
import ImageWizardDialog from '../image-wizard-dialog/ImageWizardDialog';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../ui/DropdownMenu';
import { Label } from '../ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import EditorCanvas from './EditorCanvas';
import EditorImageUploader from './EditorImageUploader';
import TextAdder from './TextAdder';
import TextPropertiesPanel from './TextPropertiesPanel';

interface EditorProps {
  canvasSize?: EditorSize;
  maxImages?: number;
  onExport?: (data: { images: EditorImage[]; texts: EditorText[] }) => void;
}

const DEFAULT_CANVAS_SIZE: EditorSize = {
  width: 800,
  height: 600,
};

const DEFAULT_IMAGE_SIZE: EditorSize = {
  width: 200,
  height: 150,
};

const DEFAULT_BACKGROUND_COLOR = '#ffffff';

export default function Editor({ canvasSize = DEFAULT_CANVAS_SIZE, maxImages = 3, onExport }: EditorProps) {
  const [state, setState] = useState<EditorState>({
    images: [],
    texts: [],
    selectedElementId: null,
    selectedElementType: null,
    maxImages,
    backgroundColor: DEFAULT_BACKGROUND_COLOR,
    exportSettings: {
      resolution: 'fullhd',
      quality: 0.95,
      format: 'png',
      pixelRatio: window.devicePixelRatio || 1,
    },
  });

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    fetch('/prompts')
      .then((response) => response.json())
      .then((data) => setPrompts(data))
      .catch((error) => console.error('Failed to fetch prompts:', error));
  }, []);

  const generateId = (type: 'img' | 'txt') => `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

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

        const newImages: EditorImage[] = filesToAdd.map((file, index) => {
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

  const handleImageUpdate = useCallback((id: string, updates: Partial<EditorImage>) => {
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

  const handleTextUpdate = useCallback((id: string, updates: Partial<EditorText>) => {
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

      const newText: EditorText = {
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

  const handleBackgroundColorChange = useCallback((color: string) => {
    setState((prevState) => ({
      ...prevState,
      backgroundColor: color,
    }));
  }, []);

  const handleExportSettingsChange = useCallback((updates: Partial<ExportSettings>) => {
    setState((prevState) => ({
      ...prevState,
      exportSettings: {
        ...prevState.exportSettings,
        ...updates,
      },
    }));
  }, []);

  const handleExport = useCallback(() => {
    // Call the onExport callback if provided
    if (onExport) {
      onExport({ images: state.images, texts: state.texts });
    }

    // Get selected resolution
    const selectedResolution = EXPORT_RESOLUTIONS.find((res) => res.id === state.exportSettings.resolution);
    if (!selectedResolution) {
      console.error('Invalid resolution selected');
      return;
    }

    // Calculate scaling factor
    const scaleX = selectedResolution.width / canvasSize.width;
    const scaleY = selectedResolution.height / canvasSize.height;
    const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio

    // Calculate centered offset if aspect ratios don't match
    const scaledWidth = canvasSize.width * scale;
    const scaledHeight = canvasSize.height * scale;
    const offsetX = (selectedResolution.width - scaledWidth) / 2;
    const offsetY = (selectedResolution.height - scaledHeight) / 2;

    // Create an offscreen canvas with export resolution
    const canvas = document.createElement('canvas');
    canvas.width = selectedResolution.width;
    canvas.height = selectedResolution.height;
    const ctx = canvas.getContext('2d', {
      alpha: state.exportSettings.format === 'png',
      willReadFrequently: false,
      desynchronized: true,
    });

    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Set background color
    ctx.fillStyle = state.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Combine all elements and sort by zIndex
    const allElements = [
      ...state.images.map((img) => ({ ...img, type: 'image' as const })),
      ...state.texts.map((text) => ({ ...text, type: 'text' as const })),
    ].sort((a, b) => a.zIndex - b.zIndex);

    // Track loading of images
    let imagesLoaded = 0;
    const totalImages = state.images.length;

    // Function to render after all images are loaded
    const renderCanvas = () => {
      // Clear canvas with background color
      ctx.fillStyle = state.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply transformation for centering and scaling
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      // Render all elements in order
      allElements.forEach((element) => {
        if (element.type === 'image') {
          const img = new Image();
          img.src = element.url;
          ctx.drawImage(img, element.position.x, element.position.y, element.size.width, element.size.height);
        } else if (element.type === 'text') {
          ctx.save();

          // Set text properties with scaled font size
          const scaledFontSize = element.style.fontSize;
          ctx.font = `${element.style.fontStyle === 'italic' ? 'italic ' : ''}${
            element.style.fontWeight === 'bold' ? 'bold ' : ''
          }${scaledFontSize}px ${element.style.fontFamily}`;
          ctx.fillStyle = element.style.color;
          ctx.textAlign = element.style.textAlign as CanvasTextAlign;
          ctx.textBaseline = 'top';

          // Helper function to wrap text using DOM measurement for accuracy
          const wrapText = (text: string, maxWidth: number, style: typeof element.style): string[] => {
            // Create a temporary div to measure text exactly as the browser would
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.visibility = 'hidden';
            tempDiv.style.whiteSpace = 'nowrap';
            tempDiv.style.fontFamily = style.fontFamily;
            tempDiv.style.fontSize = `${style.fontSize}px`;
            tempDiv.style.fontWeight = style.fontWeight;
            tempDiv.style.fontStyle = style.fontStyle;
            tempDiv.style.lineHeight = '1.2';
            document.body.appendChild(tempDiv);

            const lines: string[] = [];
            // First split by explicit line breaks
            const paragraphs = text.split('\n');

            paragraphs.forEach((paragraph) => {
              if (paragraph === '') {
                lines.push(''); // Preserve empty lines
                return;
              }

              const words = paragraph.split(' ');
              let currentLine = '';

              words.forEach((word) => {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                tempDiv.textContent = testLine;
                const width = tempDiv.offsetWidth;

                if (width > maxWidth && currentLine) {
                  // Current line is too long, push it and start new line
                  lines.push(currentLine);
                  currentLine = word;

                  // Check if the single word is too long
                  tempDiv.textContent = word;
                  if (tempDiv.offsetWidth > maxWidth) {
                    // Break the word into smaller parts
                    let tempWord = '';
                    for (let i = 0; i < word.length; i++) {
                      const char = word[i];
                      tempDiv.textContent = tempWord + char;
                      if (tempDiv.offsetWidth > maxWidth && tempWord) {
                        lines.push(tempWord);
                        tempWord = char;
                      } else {
                        tempWord += char;
                      }
                    }
                    currentLine = tempWord;
                  }
                } else {
                  currentLine = testLine;
                }
              });

              if (currentLine) {
                lines.push(currentLine);
              }
            });

            // Clean up
            document.body.removeChild(tempDiv);
            return lines;
          };

          // Calculate padding and effective width
          const padding = 4; // 4px padding to match p-2 class
          const effectiveWidth = element.size.width - padding * 2;

          // Wrap text
          const wrappedLines = wrapText(element.content, effectiveWidth, element.style);
          const lineHeight = element.style.fontSize * 1.2;

          // Calculate text position based on alignment
          let textX = element.position.x;
          if (element.style.textAlign === 'left') {
            textX += padding;
          } else if (element.style.textAlign === 'center') {
            textX += element.size.width / 2;
          } else if (element.style.textAlign === 'right') {
            textX += element.size.width - padding;
          }

          // Render each wrapped line
          wrappedLines.forEach((line, index) => {
            ctx.fillText(line, textX, element.position.y + padding + index * lineHeight);
          });

          ctx.restore();
        }
      });

      // Restore canvas transformation
      ctx.restore();

      // Convert to blob and download
      const mimeType = state.exportSettings.format === 'jpeg' ? 'image/jpeg' : state.exportSettings.format === 'webp' ? 'image/webp' : 'image/png';
      const quality = state.exportSettings.format === 'png' ? undefined : state.exportSettings.quality;

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `editor-export-${Date.now()}.${state.exportSettings.format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        },
        mimeType,
        quality,
      );
    };

    // If no images, render immediately
    if (totalImages === 0) {
      renderCanvas();
      return;
    }

    // Preload all images before rendering
    state.images.forEach((imageElement) => {
      const img = new Image();
      img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
          renderCanvas();
        }
      };
      img.onerror = () => {
        console.error('Failed to load image:', imageElement.url);
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
          renderCanvas();
        }
      };
      img.src = imageElement.url;
    });
  }, [state.images, state.texts, state.backgroundColor, state.exportSettings, canvasSize, onExport]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <EditorImageUploader
              onFileSelect={handleFileSelect}
              maxFiles={state.maxImages}
              currentCount={state.images.length}
              onButtonClick={() => setIsWizardOpen(true)}
            />
            <TextAdder onAddText={handleAddText} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Palette className="mr-2 h-4 w-4" />
                  Hintergrundfarbe
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="start">
                <div className="p-4">
                  <h4 className="mb-3 font-medium">Hintergrundfarbe</h4>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={state.backgroundColor}
                      onChange={(e) => handleBackgroundColorChange(e.target.value)}
                      className="h-10 w-20 cursor-pointer rounded border border-gray-300"
                    />
                    <span className="text-sm text-gray-600">{state.backgroundColor.toUpperCase()}</span>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Einstellungen
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="start">
                <div className="p-4">
                  <h4 className="mb-3 font-medium">Export Einstellungen</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="export-resolution" className="mb-2 block text-sm font-medium">
                        Auflösung
                      </Label>
                      <Select
                        value={state.exportSettings.resolution}
                        onValueChange={(value: ExportResolutionId) => handleExportSettingsChange({ resolution: value })}
                      >
                        <SelectTrigger id="export-resolution" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPORT_RESOLUTIONS.map((res) => (
                            <SelectItem key={res.id} value={res.id}>
                              <div className="flex flex-col">
                                <span>{res.name}</span>
                                {res.description && <span className="text-xs text-gray-500">{res.description}</span>}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="export-format" className="mb-2 block text-sm font-medium">
                        Format
                      </Label>
                      <Select
                        value={state.exportSettings.format}
                        onValueChange={(value: 'png' | 'jpeg' | 'webp') => handleExportSettingsChange({ format: value })}
                      >
                        <SelectTrigger id="export-format" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="png">PNG (verlustfrei)</SelectItem>
                          <SelectItem value="jpeg">JPEG (komprimiert)</SelectItem>
                          <SelectItem value="webp">WebP (modern)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {state.exportSettings.format !== 'png' && (
                      <div>
                        <Label htmlFor="export-quality" className="mb-2 block text-sm font-medium">
                          Qualität: {Math.round(state.exportSettings.quality * 100)}%
                        </Label>
                        <input
                          id="export-quality"
                          type="range"
                          min="10"
                          max="100"
                          value={state.exportSettings.quality * 100}
                          onChange={(e) => handleExportSettingsChange({ quality: parseInt(e.target.value) / 100 })}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>

                  <Button className="mt-4 w-full" onClick={handleExport} disabled={state.images.length === 0 && state.texts.length === 0}>
                    Exportieren
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Info className="mr-2 h-4 w-4" />
                  Anleitung
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="start">
                <div className="p-4">
                  <h4 className="mb-3 font-medium">Anleitung</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>1. Bilder per Drag & Drop oder Upload hinzufügen</div>
                    <div>2. Text mit dem "Text erstellen" Button hinzufügen</div>
                    <div>3. Elemente durch Anklicken auswählen</div>
                    <div>4. Ausgewählte Elemente verschieben und skalieren</div>
                    <div>5. Text per Doppelklick bearbeiten</div>
                    <div>6. Export über "Export Einstellungen" → "Exportieren"</div>
                  </div>

                  <div className="mt-4 space-y-1 text-sm text-gray-600">
                    <div className="font-medium">💡 Tipps:</div>
                    <div>• Klicken Sie auf Elemente zum Auswählen</div>
                    <div>• Ziehen Sie Elemente zum Verschieben</div>
                    <div>• Ziehen Sie an den Ecken zum Größe ändern</div>
                    <div>• Doppelklick auf Text zum Bearbeiten</div>
                    <div>• Klicken Sie auf × zum Löschen</div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="ml-auto text-sm text-gray-500">
              {state.images.length}/{state.maxImages} Bilder • {state.texts.length} Texte
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <EditorCanvas
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
                backgroundColor={state.backgroundColor}
              />
            </div>

            <div className="space-y-4">
              {state.selectedElementId &&
                state.selectedElementType === 'text' &&
                (() => {
                  const selectedText = state.texts.find((text) => text.id === state.selectedElementId);
                  return selectedText ? (
                    <TextPropertiesPanel text={selectedText} onUpdate={(updates) => handleTextUpdate(selectedText.id, updates)} />
                  ) : null;
                })()}
            </div>
          </div>
        </div>
      </Card>

      <ImageWizardDialog
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        prompts={prompts}
        onImageGenerated={async (imageUrl) => {
          try {
            // Fetch the generated image as a file
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], `generated-${Date.now()}.png`, { type: 'image/png' });

            // Add the generated image to the editor
            handleFileSelect([file]);
            setIsWizardOpen(false);
          } catch (error) {
            console.error('Failed to load generated image:', error);
          }
        }}
      />
    </div>
  );
}

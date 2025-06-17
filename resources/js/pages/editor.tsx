import EditorImageUploader from '@/components/editor/EditorImageUploader';
import TextAdder from '@/components/editor/TextAdder';
import UserImageSelectorDialog from '@/components/editor/UserImageSelectorDialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { EditorImage, EditorText } from '@/types/editor';
import { Prompt } from '@/types/prompt';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function EditorPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<{ url: string; file: File }[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/prompts', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch prompts');
        }
        return response.json();
      })
      .then((data) => setPrompts(data))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Failed to fetch prompts:', error);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  const handleExport = (data: { images: EditorImage[]; texts: EditorText[] }) => {
    console.log('Exporting editor data:', data);
  };

  const handleSelectPrompt = (promptId: number) => {
    setSelectedPromptId(promptId);
    console.log('Selected prompt:', promptId);
  };

  const handleAddText = () => {
    // For now, this is a placeholder. In a real implementation,
    // you would need to communicate with the Editor component
    // through a shared state management solution or context
    alert('Text hinzufügen functionality will be connected to the Editor');
  };

  const handleFileSelect = (files: File[]) => {
    // For now, this is a placeholder. In a real implementation,
    // you would need to communicate with the Editor component
    // to add the selected images
    console.log('Selected files:', files);
  };

  const handleImageCropped = (croppedImageUrl: string, croppedFile: File) => {
    // Add the cropped image to the selected images array
    if (selectedImages.length < 3) {
      setSelectedImages((prev) => [...prev, { url: croppedImageUrl, file: croppedFile }]);
      handleFileSelect([croppedFile]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageButtonClick = () => {
    setIsImageSelectorOpen(true);
  };

  // Get unique categories from prompts
  const categories = Array.from(new Set(prompts.map((p) => p.category))).sort();

  // Filter prompts based on selected category
  const filteredPrompts = prompts.filter((p) => {
    const hasImage = p.example_image_url;
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return hasImage && matchesCategory;
  });

  return (
    <>
      <Head title="Editor - TheIndivisuals" />
      <UserImageSelectorDialog isOpen={isImageSelectorOpen} onClose={() => setIsImageSelectorOpen(false)} onImageSelected={handleImageCropped} />
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="flex w-80 flex-col border-r border-gray-200 bg-white p-6">
          <nav className="flex flex-col gap-8">
            <EditorImageUploader
              onFileSelect={handleFileSelect}
              maxFiles={3}
              currentCount={selectedImages.length}
              onButtonClick={handleImageButtonClick}
            />

            {/* Image Previews */}
            {selectedImages.length > 0 && (
              <div className="space-y-2">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative rounded-lg border border-gray-200 p-2">
                    <img src={image.url} alt={`Selected ${index + 1}`} className="h-20 w-full rounded object-cover" />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div>
              {prompts.length > 0 ? (
                <>
                  {/* Category Filter */}
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="mb-3 h-8 w-full text-xs">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Prompt List */}
                  <div className="space-y-2 overflow-y-auto">
                    {filteredPrompts.length > 0 ? (
                      filteredPrompts.map((prompt) => (
                        <button
                          key={prompt.id}
                          onClick={() => handleSelectPrompt(prompt.id)}
                          className={`w-full rounded-md border p-2 text-left transition-colors ${
                            selectedPromptId === prompt.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            {prompt.example_image_url && (
                              <img src={prompt.example_image_url} alt={prompt.name} className="h-12 w-12 rounded object-cover" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium text-gray-900">{prompt.name}</p>
                              <p className="truncate text-xs text-gray-500">{prompt.category}</p>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-center text-xs text-gray-500">No prompts in this category</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-xs text-gray-500">Loading prompts...</p>
              )}
            </div>

            {/* Add Text Button */}
            <TextAdder onAddText={handleAddText} />
          </nav>

          <div className="mt-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="instructions" className="border-0">
                <AccordionTrigger className="py-3 text-sm font-medium text-gray-700 hover:no-underline">Anleitung & Tipps</AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-3">
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="font-medium text-gray-700">Anleitung:</div>
                      <div>1. Bilder per Drag & Drop oder Upload hinzufügen</div>
                      <div>2. Text mit dem "Text erstellen" Button hinzufügen</div>
                      <div>3. Elemente durch Anklicken auswählen</div>
                      <div>4. Ausgewählte Elemente verschieben und skalieren</div>
                      <div>5. Text per Doppelklick bearbeiten</div>
                      <div>6. Export über "Export Einstellungen" → "Exportieren"</div>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="font-medium text-gray-700">💡 Tipps:</div>
                      <div>• Klicken Sie auf Elemente zum Auswählen</div>
                      <div>• Ziehen Sie Elemente zum Verschieben</div>
                      <div>• Ziehen Sie an den Ecken zum Größe ändern</div>
                      <div>• Doppelklick auf Text zum Bearbeiten</div>
                      <div>• Klicken Sie auf × zum Löschen</div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4">
          <div className="mx-auto max-w-7xl">EditorCanvas</div>
        </main>
      </div>
    </>
  );
}

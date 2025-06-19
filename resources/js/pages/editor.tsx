import EditorCanvas from '@/components/editor/components/canvas/EditorCanvas';
import EditorImageUploader from '@/components/editor/components/EditorImageUploader';
import ImageGenerationSection from '@/components/editor/components/ImageGenerationSection';
import CategoryFilter from '@/components/editor/components/sidebar/CategoryFilter';
import ImagePreviewList from '@/components/editor/components/sidebar/ImagePreviewList';
import InstructionsPanel from '@/components/editor/components/sidebar/InstructionsPanel';
import PromptList from '@/components/editor/components/sidebar/PromptList';
import TextAdder from '@/components/editor/components/TextAdder';
import UserImageSelectorDialog from '@/components/editor/components/UserImageSelectorDialog';
import { MAX_IMAGES } from '@/components/editor/constants';
import { useEditorState } from '@/components/editor/hooks/useEditorState';
import { usePrompts } from '@/components/editor/hooks/usePrompts';
import { useSelectedImages } from '@/components/editor/hooks/useSelectedImages';
import { Head } from '@inertiajs/react';
import { useCallback } from 'react';

export default function EditorPage() {
  const { prompts, filteredPrompts, categories, selectedPromptId, selectedCategory, isLoading, setSelectedPromptId, setSelectedCategory } =
    usePrompts();

  const { selectedImages, isImageSelectorOpen, currentCount, addImage, removeImage, openImageSelector, closeImageSelector } =
    useSelectedImages(MAX_IMAGES);

  const {
    images,
    texts,
    selectedElementId,
    selectedElementType,
    addText,
    updateImage,
    deleteImage,
    updateText,
    deleteText,
    selectElement,
    clearSelection,
  } = useEditorState();

  const handleFileSelect = useCallback(
    (files: File[]) => {
      files.forEach((file) => {
        const url = URL.createObjectURL(file);
        addImage(url, file);
      });
    },
    [addImage],
  );

  const handleImageCropped = useCallback(
    (croppedImageUrl: string, croppedFile: File) => {
      addImage(croppedImageUrl, croppedFile);
    },
    [addImage],
  );

  const handleAddText = useCallback(() => {
    const newText = {
      id: `text-${Date.now()}`,
      content: 'New Text',
      position: { x: 100, y: 100 },
      size: { width: 200, height: 50 },
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        color: '#000000',
        fontWeight: 'normal' as const,
        fontStyle: 'normal' as const,
        textAlign: 'left' as const,
      },
      zIndex: texts.length + images.length,
    };
    addText(newText);
  }, [texts.length, images.length, addText]);

  return (
    <>
      <Head title="Editor - TheIndivisuals" />
      <UserImageSelectorDialog isOpen={isImageSelectorOpen} onClose={closeImageSelector} onImageSelected={handleImageCropped} />

      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="flex w-80 flex-col border-r border-gray-200 bg-white p-6">
          <nav className="flex flex-col gap-8">
            <EditorImageUploader
              onFileSelect={handleFileSelect}
              maxFiles={MAX_IMAGES}
              currentCount={currentCount}
              onButtonClick={openImageSelector}
            />

            <ImagePreviewList images={selectedImages} onRemoveImage={removeImage} />

            <div>
              {!isLoading && prompts.length > 0 && (
                <>
                  <CategoryFilter categories={categories} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
                  <PromptList prompts={filteredPrompts} selectedPromptId={selectedPromptId} onSelectPrompt={setSelectedPromptId} />
                </>
              )}
              {isLoading && <p className="text-xs text-gray-500">Loading prompts...</p>}
            </div>

            <TextAdder onAddText={handleAddText} />
          </nav>

          <div className="mt-auto">
            <InstructionsPanel />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4">
          <div className="mx-auto max-w-7xl space-y-4">
            <EditorCanvas
              images={images}
              texts={texts}
              selectedElementId={selectedElementId}
              selectedElementType={selectedElementType}
              onImageUpdate={updateImage}
              onImageDelete={deleteImage}
              onTextUpdate={updateText}
              onTextDelete={deleteText}
              onSelectElement={selectElement}
              onClearSelection={clearSelection}
            />
            <ImageGenerationSection selectedImages={selectedImages} selectedPromptId={selectedPromptId} prompts={prompts} />
          </div>
        </main>
      </div>
    </>
  );
}

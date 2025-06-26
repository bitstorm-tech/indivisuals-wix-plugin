import { apiFetch } from '@/lib/utils';
import { Prompt } from '@/types/prompt';
import { useState } from 'react';

interface ImageGenerationSectionProps {
  selectedImages: { url: string; file: File }[];
  selectedPromptId: number | null;
  prompts: Prompt[];
}

export default function ImageGenerationSection({ selectedImages, selectedPromptId, prompts }: ImageGenerationSectionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const selectedPrompt = prompts.find((p: Prompt) => p.id === selectedPromptId);
  const canGenerate = selectedImages.length > 0 && selectedPromptId !== null;

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsProcessing(true);
    setGeneratedImages([]);

    try {
      const formData = new FormData();
      // Currently the backend expects a single image
      formData.append('image', selectedImages[0].file);
      formData.append('prompt_id', selectedPromptId!.toString());
      formData.append('n', '4');

      const response = await apiFetch('/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        if (result.generated_image_urls) {
          setGeneratedImages(result.generated_image_urls);
        }
      } else {
        throw new Error(result.message || 'Generation failed');
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (generatedImages.length > 0) {
    return (
      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Generated Images</h3>
          <button onClick={() => setGeneratedImages([])} className="text-sm text-gray-500 hover:text-gray-700">
            Generate More
          </button>
        </div>
        <div className={`grid gap-4 ${generatedImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {generatedImages.map((imageUrl, index) => (
            <div key={index} className="relative">
              <img src={imageUrl} alt={`Generated ${index + 1}`} className="w-full rounded-lg shadow-lg" />
              <div className="bg-opacity-50 absolute right-2 bottom-2 rounded bg-black px-2 py-1 text-xs text-white">
                {index + 1} / {generatedImages.length}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Generation area */}
      <div
        className={`cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
          canGenerate ? 'border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100' : 'border-gray-300 bg-gray-50'
        }`}
        onClick={canGenerate ? handleGenerate : undefined}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-lg font-medium text-gray-700">Generating 4 images...</p>
            <p className="mt-2 text-sm text-gray-500">This may take a few moments</p>
          </div>
        ) : !canGenerate ? (
          <div className="flex flex-col items-center">
            <svg className="mb-4 h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-lg font-medium text-gray-700">
              {selectedImages.length === 0 ? 'Select user images to continue' : 'Select a prompt to generate'}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {selectedImages.length === 0 ? 'Upload at least one image from the sidebar' : 'Choose a prompt from the sidebar'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg className="mb-4 h-16 w-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-lg font-medium text-blue-700">Click to generate 4 images</p>
            <p className="mt-2 text-sm text-gray-600">Transform images with "{selectedPrompt?.name}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

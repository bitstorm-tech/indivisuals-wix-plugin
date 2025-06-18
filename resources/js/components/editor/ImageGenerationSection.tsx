import { useState } from 'react';

interface ImageGenerationSectionProps {
  selectedImages: { url: string; file: File }[];
  selectedPromptId: number | null;
  prompts: Array<{ id: number; name: string }>;
}

export default function ImageGenerationSection({ selectedImages, selectedPromptId, prompts }: ImageGenerationSectionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const selectedPrompt = prompts.find((p) => p.id === selectedPromptId);
  const canGenerate = selectedImages.length > 0 && selectedPromptId !== null;

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsProcessing(true);
    setGeneratedImage(null);

    try {
      const formData = new FormData();
      // Currently the backend expects a single image
      formData.append('image', selectedImages[0].file);
      formData.append('prompt_id', selectedPromptId!.toString());

      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (!csrfToken) {
        throw new Error('CSRF token not found');
      }

      const response = await fetch('/upload-image', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrfToken,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.generated_image_url) {
        setGeneratedImage(result.generated_image_url);
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

  if (generatedImage) {
    return (
      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Generated Image</h3>
          <button onClick={() => setGeneratedImage(null)} className="text-sm text-gray-500 hover:text-gray-700">
            Generate Another
          </button>
        </div>
        <img src={generatedImage} alt="Generated" className="w-full rounded-lg shadow-lg" />
      </div>
    );
  }

  return (
    <div
      className={`mt-8 cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
        canGenerate ? 'border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100' : 'border-gray-300 bg-gray-50'
      }`}
      onClick={canGenerate ? handleGenerate : undefined}
    >
      {isProcessing ? (
        <div className="flex flex-col items-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-lg font-medium text-gray-700">Generating image...</p>
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
          <p className="text-lg font-medium text-blue-700">Click to generate image</p>
          <p className="mt-2 text-sm text-gray-600">
            Using first image with "{selectedPrompt?.name}"
          </p>
        </div>
      )}
    </div>
  );
}

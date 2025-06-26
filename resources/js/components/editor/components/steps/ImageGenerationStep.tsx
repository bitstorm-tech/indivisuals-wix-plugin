import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Loader2, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useImageGeneration } from '../../hooks/useImageGeneration';
import ImageVariantSelector from '../shared/ImageVariantSelector';

interface ImageGenerationStepProps {
  uploadedImage: File | null;
  promptId: number | null;
  generatedImageUrls: string[] | null;
  selectedGeneratedImage: string | null;
  onImagesGenerated: (urls: string[]) => void;
  onImageSelect: (url: string) => void;
  onGenerationStart: () => void;
  onGenerationEnd: () => void;
}

export default function ImageGenerationStep({
  uploadedImage,
  promptId,
  generatedImageUrls,
  selectedGeneratedImage,
  onImagesGenerated,
  onImageSelect,
  onGenerationStart,
  onGenerationEnd,
}: ImageGenerationStepProps) {
  const { isGenerating, error, generateImages } = useImageGeneration();
  const hasStartedGeneration = useRef(false);

  useEffect(() => {
    if (!generatedImageUrls && uploadedImage && promptId && !hasStartedGeneration.current) {
      hasStartedGeneration.current = true;
      const performGeneration = async () => {
        onGenerationStart();
        const urls = await generateImages(uploadedImage, promptId);
        if (urls) {
          onImagesGenerated(urls);
        }
        onGenerationEnd();
      };
      performGeneration();
    }
  }, [uploadedImage, promptId, generatedImageUrls, generateImages, onGenerationStart, onGenerationEnd, onImagesGenerated]);

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <Loader2 className="text-primary h-16 w-16 animate-spin" />
          <Sparkles className="absolute inset-0 h-16 w-16 animate-pulse text-yellow-500" />
        </div>
        <h3 className="mt-6 text-lg font-semibold">Creating Your Magic Designs</h3>
        <p className="mt-2 text-sm text-gray-600">Our AI is working hard to generate 4 unique variations of your image...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <p className="text-sm text-gray-600">Please go back and try again with a different image or prompt.</p>
      </div>
    );
  }

  if (!generatedImageUrls) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-lg font-semibold">Choose Your Favorite Design</h3>
        <p className="text-sm text-gray-600">Select the design that best captures your vision from these AI-generated variations</p>
      </div>

      <ImageVariantSelector variants={generatedImageUrls} selectedVariant={selectedGeneratedImage} onVariantSelect={onImageSelect} />

      {selectedGeneratedImage && (
        <div className="rounded-lg bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">Great choice! Click Next to see how it looks on your selected mug.</p>
        </div>
      )}
    </div>
  );
}

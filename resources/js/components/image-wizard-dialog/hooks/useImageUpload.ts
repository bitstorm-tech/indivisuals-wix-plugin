import { useCallback, useEffect, useState } from 'react';

interface UseImageUploadReturn {
  uploadedImage: File | null;
  uploadedImageUrl: string | null;
  generatedImageUrl: string | null;
  isProcessing: boolean;
  isDragging: boolean;
  handleFileUpload: (file: File) => void;
  processImage: (file: File, selectedPromptId: number) => Promise<void>;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent) => void;
  reset: () => void;
}

interface UseImageUploadProps {
  onImageGenerated?: (imageUrl: string, originalFile: File) => void;
  onFileUploaded?: (file: File) => void;
}

export function useImageUpload({ onImageGenerated, onFileUploaded }: UseImageUploadProps = {}): UseImageUploadReturn {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl);
      }
    };
  }, [uploadedImageUrl]);

  const handleFileUpload = useCallback(
    (file: File) => {
      if (file && file.type.startsWith('image/')) {
        setUploadedImage(file);
        const url = URL.createObjectURL(file);
        setUploadedImageUrl(url);
        onFileUploaded?.(file);
      }
    },
    [onFileUploaded],
  );

  const processImage = useCallback(
    async (file: File, selectedPromptId: number) => {
      setIsProcessing(true);

      const formData = new FormData();
      formData.append('image', file);
      formData.append('prompt_id', selectedPromptId.toString());

      try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        const response = await fetch('/upload-image', {
          method: 'POST',
          headers: {
            'X-CSRF-TOKEN': csrfToken || '',
            Accept: 'application/json',
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setGeneratedImageUrl(data.generated_image_url);

          if (onImageGenerated && uploadedImage) {
            onImageGenerated(data.generated_image_url, uploadedImage);
          }
        }
      } catch (error) {
        console.error('Error processing image:', error);
      } finally {
        setIsProcessing(false);
      }
    },
    [uploadedImage, onImageGenerated],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    },
    [handleFileUpload],
  );

  const reset = useCallback(() => {
    setUploadedImage(null);
    if (uploadedImageUrl) {
      URL.revokeObjectURL(uploadedImageUrl);
    }
    setUploadedImageUrl(null);
    setGeneratedImageUrl(null);
    setIsProcessing(false);
  }, [uploadedImageUrl]);

  return {
    uploadedImage,
    uploadedImageUrl,
    generatedImageUrl,
    isProcessing,
    isDragging,
    handleFileUpload,
    processImage,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    reset,
  };
}

import { useCallback, useState } from 'react';

interface SelectedImage {
  url: string;
  file: File;
}

export function useSelectedImages(maxImages: number = 3) {
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);

  const addImage = useCallback(
    (url: string, file: File) => {
      if (selectedImages.length < maxImages) {
        setSelectedImages((prev) => [...prev, { url, file }]);
      }
    },
    [selectedImages.length, maxImages],
  );

  const removeImage = useCallback((index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearImages = useCallback(() => {
    setSelectedImages([]);
  }, []);

  const openImageSelector = useCallback(() => {
    setIsImageSelectorOpen(true);
  }, []);

  const closeImageSelector = useCallback(() => {
    setIsImageSelectorOpen(false);
  }, []);

  return {
    selectedImages,
    isImageSelectorOpen,
    currentCount: selectedImages.length,
    remainingSlots: maxImages - selectedImages.length,
    canAddMore: selectedImages.length < maxImages,
    addImage,
    removeImage,
    clearImages,
    openImageSelector,
    closeImageSelector,
  };
}

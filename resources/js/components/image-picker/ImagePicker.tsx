import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { useImageCrop } from '@/hooks/useImageCrop';
import { Prompt } from '@/types/prompt';
import React, { useCallback, useEffect, useState } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { UploadResponse } from '../../types/image-picker';
import FileUploader from './FileUploader';
import ImageDisplay from './ImageDisplay';
import ProcessingIndicator from './ProcessingIndicator';
import PromptSelector from './PromptSelector';

interface ImagePickerProps {
  defaultPromptId?: number;
  storeImages?: boolean;
}

export default function ImagePicker({ defaultPromptId, storeImages = true }: ImagePickerProps) {
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [previewImage, setPreviewImage] = useState<string | undefined>(undefined);
  const [generatedImage, setGeneratedImage] = useState<string | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<number | undefined>(defaultPromptId);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [croppedFile, setCroppedFile] = useState<File | undefined>(undefined);

  const { crop, setCrop, completedCrop, setCompletedCrop, imgRef, getCroppedImage, setInitialCrop } = useImageCrop({
    aspectRatio: 1,
    initialCropPercent: 80,
  });

  const fetchPrompts = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/prompts?active_only=true', {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (response.ok) {
        const promptsData: Prompt[] = await response.json();
        setPrompts(promptsData);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
    }
  }, []);

  const uploadImage = useCallback(
    async (fileOverride?: File): Promise<void> => {
      const fileToUpload = fileOverride || croppedFile || selectedFile;
      if (!fileToUpload) {
        return;
      }

      setIsProcessing(true);
      setGeneratedImage(undefined);

      try {
        const formData = new FormData();
        formData.append('image', fileToUpload);

        if (selectedPromptId) {
          formData.append('prompt_id', selectedPromptId.toString());
        }

        formData.append('store_images', storeImages.toString());

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

        const result: UploadResponse = await response.json();

        if (result.success && result.generated_image_url) {
          setGeneratedImage(result.generated_image_url);
          setSelectedFile(undefined);
          setCroppedFile(undefined);
          setShowCropDialog(false);
        } else {
          throw new Error(result.message || 'Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedFile, croppedFile, selectedPromptId, storeImages],
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }

      if (file) {
        setSelectedFile(file);
        setPreviewImage(URL.createObjectURL(file));
        setGeneratedImage(undefined);
        setCroppedFile(undefined);
        setShowCropDialog(true);
      } else {
        setSelectedFile(undefined);
        setPreviewImage(undefined);
        setCroppedFile(undefined);
      }
    },
    [previewImage],
  );

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleCropConfirm = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImage('cropped-image.png', 'image/png');
      if (croppedImage) {
        setCroppedFile(croppedImage.file);
        setShowCropDialog(false);
        // Automatically upload the cropped image
        await uploadImage(croppedImage.file);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again.');
    }
  }, [getCroppedImage, uploadImage]);

  const handleCropCancel = useCallback(async () => {
    setShowCropDialog(false);
    setCroppedFile(undefined);
    // Upload the original file without cropping
    await uploadImage();
  }, [uploadImage]);

  const canUpload = (selectedFile || croppedFile) && selectedPromptId && !isProcessing;

  return (
    <>
      <div className="space-y-4">
        <PromptSelector prompts={prompts} selectedPromptId={selectedPromptId} onPromptChange={setSelectedPromptId} disabled={isProcessing} />

        <FileUploader
          selectedFile={selectedFile}
          onFileChange={handleFileChange}
          onUpload={uploadImage}
          canUpload={!!canUpload}
          isProcessing={isProcessing}
        />
      </div>

      <ProcessingIndicator isVisible={isProcessing} />

      <ImageDisplay previewImage={previewImage} generatedImage={generatedImage} />

      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
            <DialogDescription>Adjust the crop area for your image. The image will be cropped to a square aspect ratio.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {previewImage && (
              <ReactCrop crop={crop} onChange={(c) => setCrop(c)} onComplete={(c) => setCompletedCrop(c)} aspect={1}>
                <img
                  ref={imgRef}
                  src={previewImage}
                  alt="Crop preview"
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    setInitialCrop(img);
                  }}
                  className="max-h-[400px] w-full object-contain"
                />
              </ReactCrop>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCropCancel}>
              Skip Cropping
            </Button>
            <Button type="button" onClick={handleCropConfirm} disabled={!completedCrop}>
              Apply Crop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

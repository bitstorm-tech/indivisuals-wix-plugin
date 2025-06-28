import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { useImageCrop } from '@/hooks/useImageCrop';
import { apiFetch } from '@/lib/utils';
import { Prompt } from '@/types/prompt';
import React, { useEffect, useState } from 'react';
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

  const uploadImage = async (fileOverride?: File): Promise<void> => {
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

      // Debug logging
      console.log('Uploading file:', {
        name: fileToUpload.name,
        type: fileToUpload.type,
        size: fileToUpload.size,
        lastModified: fileToUpload.lastModified,
      });

      const response = await apiFetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result: UploadResponse = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (response.status === 422 && result.errors) {
          const errorMessages = Object.values(result.errors).flat().join(', ');
          throw new Error(errorMessages || result.message || `HTTP error! status: ${response.status}`);
        }
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

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
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  useEffect(() => {
    const fetchPrompts = async (): Promise<void> => {
      try {
        const response = await apiFetch('/api/prompts?active_only=true');

        if (response.ok) {
          const promptsData: Prompt[] = await response.json();
          setPrompts(promptsData);
        }
      } catch (error) {
        console.error('Error fetching prompts:', error);
      }
    };

    fetchPrompts();
  }, []);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleCropConfirm = async () => {
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
  };

  const handleCropCancel = async () => {
    setShowCropDialog(false);
    setCroppedFile(undefined);
    // Upload the original file without cropping
    if (selectedFile) {
      await uploadImage(selectedFile);
    }
  };

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

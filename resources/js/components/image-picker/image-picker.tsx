import React, { useEffect, useState } from 'react';
import { Prompt, UploadResponse } from '../../types/image-picker';
import FileUploader from './file-uploader';
import ImageDisplay from './image-display';
import ProcessingIndicator from './processing-indicator';
import PromptSelector from './prompt-selector';

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

  useEffect(() => {
    fetchPrompts();
  }, []);

  async function fetchPrompts(): Promise<void> {
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
  }

  async function uploadImage(): Promise<void> {
    if (!selectedFile) {
      return;
    }

    setIsProcessing(true);
    setGeneratedImage(undefined);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

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
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }

    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
      setGeneratedImage(undefined);
    } else {
      setSelectedFile(undefined);
      setPreviewImage(undefined);
    }
  }

  const canUpload = selectedFile && selectedPromptId && !isProcessing;

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
    </>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { useWizardSounds } from '@/hooks/useWizardSounds';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback } from 'react';

// Hooks
import { useImageDownload } from './hooks/useImageDownload';
import { useImageUpload } from './hooks/useImageUpload';
import { useWizardStep } from './hooks/useWizardStep';

// Components
import ImageUploader from './components/ImageUploader';
import ProcessingIndicator from './components/ProcessingIndicator';
import PromptSelector from './components/PromptSelector';
import ResultDisplay from './components/ResultDisplay';
import WizardMascot from './components/WizardMascot';
import WizardProgress from './components/WizardProgress';

// Types
import { Prompt } from '@/types/prompt';

interface ImageWizardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: Prompt[];
  onImageGenerated?: (imageUrl: string, originalFile: File) => void;
}

export default function ImageWizardDialog({ isOpen, onClose, prompts, onImageGenerated }: ImageWizardDialogProps) {
  const sounds = useWizardSounds();

  // Custom hooks
  const {
    currentStep,
    selectedPromptId,
    progress,
    setCurrentStep,
    handleTemplateSelect: handleTemplateSelectBase,
    reset: resetStep,
  } = useWizardStep();

  const {
    uploadedImage,
    uploadedImageUrl,
    generatedImageUrl,
    isProcessing,
    isDragging,
    handleFileUpload: handleFileUploadBase,
    processImage,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    reset: resetUpload,
  } = useImageUpload({ onImageGenerated });

  const { handleDownload } = useImageDownload();

  // Enhanced handlers
  const handleTemplateSelect = useCallback(
    (templateId: number) => {
      sounds.playSelect();
      handleTemplateSelectBase(templateId, prompts);
    },
    [sounds, handleTemplateSelectBase, prompts],
  );

  const handleFileUpload = useCallback(
    (file: File) => {
      sounds.playUpload();
      handleFileUploadBase(file);

      setTimeout(() => {
        setCurrentStep('result');
        sounds.playMagic();
        processImage(file, selectedPromptId!);
      }, 500);
    },
    [sounds, handleFileUploadBase, setCurrentStep, processImage, selectedPromptId],
  );

  const handleCompleteDownload = useCallback(() => {
    if (generatedImageUrl) {
      handleDownload(generatedImageUrl);
    }
  }, [generatedImageUrl, handleDownload]);

  const handleUseInEditor = useCallback(() => {
    if (generatedImageUrl && uploadedImage && onImageGenerated) {
      sounds.playComplete();
      onImageGenerated(generatedImageUrl, uploadedImage);
      onClose();
      resetStep();
      resetUpload();
    }
  }, [generatedImageUrl, uploadedImage, onImageGenerated, sounds, onClose, resetStep, resetUpload]);

  const handleTryAgain = useCallback(() => {
    resetStep();
    resetUpload();
  }, [resetStep, resetUpload]);

  const handleClose = useCallback(() => {
    onClose();
    resetStep();
    resetUpload();
  }, [onClose, resetStep, resetUpload]);

  // Effects
  React.useEffect(() => {
    if (currentStep === 'result' && !isProcessing && generatedImageUrl) {
      sounds.playComplete();
    }
  }, [currentStep, isProcessing, generatedImageUrl, sounds]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="h-[600px] max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent">
            ✨ Magic Image Wizard ✨
          </DialogTitle>
        </DialogHeader>

        <WizardMascot
          emotion={currentStep === 'result' && !isProcessing ? 'excited' : currentStep === 'upload' ? 'happy' : 'neutral'}
          onClick={() => sounds.playMagic()}
        />

        <div className="space-y-6">
          <WizardProgress currentStep={currentStep} progress={progress} />

          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {currentStep === 'template' && <PromptSelector onSelectTemplate={handleTemplateSelect} prompts={prompts} />}

              {currentStep === 'upload' && (
                <ImageUploader
                  onFileUpload={handleFileUpload}
                  isDragging={isDragging}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                />
              )}

              {currentStep === 'result' && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="h-full"
                >
                  {isProcessing ? (
                    <ProcessingIndicator />
                  ) : (
                    <ResultDisplay
                      uploadedImageUrl={uploadedImageUrl}
                      generatedImageUrl={generatedImageUrl}
                      onDownload={handleCompleteDownload}
                      onUseInEditor={onImageGenerated ? handleUseInEditor : undefined}
                      onTryAgain={handleTryAgain}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

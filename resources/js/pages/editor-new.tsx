import WizardNavigationButtons from '@/components/editor-new/components/WizardNavigationButtons';
import WizardStepIndicator from '@/components/editor-new/components/WizardStepIndicator';
import ImageGenerationStep from '@/components/editor-new/components/steps/ImageGenerationStep';
import ImageUploadStep from '@/components/editor-new/components/steps/ImageUploadStep';
import MugSelectionStep from '@/components/editor-new/components/steps/MugSelectionStep';
import PreviewStep from '@/components/editor-new/components/steps/PreviewStep';
import PromptSelectionStep from '@/components/editor-new/components/steps/PromptSelectionStep';
import UserDataStep from '@/components/editor-new/components/steps/UserDataStep';
import { WizardStep } from '@/components/editor-new/constants';
import { useWizardNavigation } from '@/components/editor-new/hooks/useWizardNavigation';
import { CropData, MugOption, UserData } from '@/components/editor-new/types';
import { usePrompts } from '@/components/editor/hooks/usePrompts';
import { Prompt } from '@/types/prompt';
import { useCallback } from 'react';

export default function EditorNewPage() {
  const { prompts, isLoading, error } = usePrompts();
  const wizard = useWizardNavigation();

  const handleImageUpload = useCallback(
    (file: File, url: string) => {
      wizard.updateState('uploadedImage', file);
      wizard.updateState('uploadedImageUrl', url);
    },
    [wizard],
  );

  const handleCropComplete = useCallback(
    (cropData: CropData) => {
      wizard.updateState('cropData', cropData);
    },
    [wizard],
  );

  const handleRemoveImage = useCallback(() => {
    if (wizard.uploadedImageUrl) {
      URL.revokeObjectURL(wizard.uploadedImageUrl);
    }
    wizard.updateState('uploadedImage', null);
    wizard.updateState('uploadedImageUrl', null);
    wizard.updateState('cropData', null);
  }, [wizard]);

  const handlePromptSelect = useCallback(
    (prompt: Prompt) => {
      wizard.updateState('selectedPrompt', prompt);
    },
    [wizard],
  );

  const handleMugSelect = useCallback(
    (mug: MugOption) => {
      wizard.updateState('selectedMug', mug);
    },
    [wizard],
  );

  const handleUserDataComplete = useCallback(
    (data: UserData) => {
      wizard.updateState('userData', data);
    },
    [wizard],
  );

  const handleImagesGenerated = useCallback(
    (urls: string[]) => {
      wizard.updateState('generatedImageUrls', urls);
    },
    [wizard],
  );

  const handleImageSelect = useCallback(
    (url: string) => {
      wizard.updateState('selectedGeneratedImage', url);
    },
    [wizard],
  );

  const handleGenerationStart = useCallback(() => {
    wizard.updateState('isProcessing', true);
  }, [wizard]);

  const handleGenerationEnd = useCallback(() => {
    wizard.updateState('isProcessing', false);
  }, [wizard]);

  const getCompletedSteps = useCallback((): WizardStep[] => {
    const completed: WizardStep[] = [];
    if (wizard.uploadedImage && wizard.cropData) completed.push('image-upload');
    if (wizard.selectedPrompt) completed.push('prompt-selection');
    if (wizard.selectedMug) completed.push('mug-selection');
    if (wizard.userData) completed.push('user-data');
    if (wizard.selectedGeneratedImage) completed.push('image-generation');
    return completed;
  }, [wizard]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading editor: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-center text-3xl font-bold">Create Your Custom Mug</h1>
          <p className="text-center text-gray-600">Follow the steps below to design your personalized mug</p>
        </div>

        <div className="mb-8">
          <WizardStepIndicator currentStep={wizard.currentStep} completedSteps={getCompletedSteps()} />
        </div>

        <div className="mb-8 min-h-[400px] rounded-lg bg-white p-6 shadow-sm">
          {wizard.currentStep === 'image-upload' && (
            <ImageUploadStep
              uploadedImage={wizard.uploadedImage}
              uploadedImageUrl={wizard.uploadedImageUrl}
              cropData={wizard.cropData}
              onImageUpload={handleImageUpload}
              onCropComplete={handleCropComplete}
              onRemoveImage={handleRemoveImage}
            />
          )}

          {wizard.currentStep === 'prompt-selection' && (
            <PromptSelectionStep prompts={prompts} selectedPrompt={wizard.selectedPrompt} onPromptSelect={handlePromptSelect} />
          )}

          {wizard.currentStep === 'mug-selection' && <MugSelectionStep selectedMug={wizard.selectedMug} onMugSelect={handleMugSelect} />}

          {wizard.currentStep === 'user-data' && <UserDataStep userData={wizard.userData} onUserDataComplete={handleUserDataComplete} />}

          {wizard.currentStep === 'image-generation' && (
            <ImageGenerationStep
              uploadedImage={wizard.uploadedImage}
              promptId={wizard.selectedPrompt?.id || null}
              generatedImageUrls={wizard.generatedImageUrls}
              selectedGeneratedImage={wizard.selectedGeneratedImage}
              onImagesGenerated={handleImagesGenerated}
              onImageSelect={handleImageSelect}
              onGenerationStart={handleGenerationStart}
              onGenerationEnd={handleGenerationEnd}
            />
          )}

          {wizard.currentStep === 'preview' && (
            <PreviewStep selectedMug={wizard.selectedMug} selectedGeneratedImage={wizard.selectedGeneratedImage} userData={wizard.userData} />
          )}
        </div>

        <WizardNavigationButtons
          currentStep={wizard.currentStep}
          canGoNext={wizard.canGoNext}
          canGoPrevious={wizard.canGoPrevious}
          onNext={wizard.goNext}
          onPrevious={wizard.goPrevious}
          isProcessing={wizard.isProcessing}
          wizardData={{
            selectedMug: wizard.selectedMug,
            selectedGeneratedImage: wizard.selectedGeneratedImage,
            userData: wizard.userData,
          }}
        />
      </div>
    </div>
  );
}

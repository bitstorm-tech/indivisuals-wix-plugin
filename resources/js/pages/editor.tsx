import WizardNavigationButtons from '@/components/editor/components/WizardNavigationButtons';
import WizardStepIndicator from '@/components/editor/components/WizardStepIndicator';
import ImageGenerationStep from '@/components/editor/components/steps/ImageGenerationStep';
import ImageUploadStep from '@/components/editor/components/steps/ImageUploadStep';
import MugSelectionStep from '@/components/editor/components/steps/MugSelectionStep';
import PreviewStep from '@/components/editor/components/steps/PreviewStep';
import PromptSelectionStep from '@/components/editor/components/steps/PromptSelectionStep';
import UserDataStep from '@/components/editor/components/steps/UserDataStep';
import { WizardStep } from '@/components/editor/constants';
import { useWizardNavigation } from '@/components/editor/hooks/useWizardNavigation';
import { CropData, MugOption, UserData } from '@/components/editor/types';
import { usePrompts } from '@/hooks/usePrompts';
import { apiFetch } from '@/lib/utils';
import { Prompt } from '@/types/prompt';
import { useEffect, useState } from 'react';

export default function EditorNewPage() {
  const { prompts, isLoading, error } = usePrompts();
  const wizard = useWizardNavigation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await apiFetch('/api/auth/check');
        const data = await response.json();
        setIsAuthenticated(data.authenticated);

        if (!data.authenticated && wizard.currentStep === 'image-generation') {
          // Go back to user data step if not authenticated
          wizard.goToStep('user-data');
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
      }
    };

    // Check if user is authenticated when navigating to step 5
    if (wizard.currentStep === 'image-generation' && isAuthenticated === null) {
      checkAuthentication();
    }
  }, [wizard.currentStep, isAuthenticated, wizard]);

  const handleImageUpload = (file: File, url: string) => {
    wizard.updateState('uploadedImage', file);
    wizard.updateState('uploadedImageUrl', url);
  };

  const handleCropComplete = (cropData: CropData) => {
    wizard.updateState('cropData', cropData);
  };

  const handleRemoveImage = () => {
    if (wizard.uploadedImageUrl) {
      URL.revokeObjectURL(wizard.uploadedImageUrl);
    }
    wizard.updateState('uploadedImage', null);
    wizard.updateState('uploadedImageUrl', null);
    wizard.updateState('cropData', null);
  };

  const handlePromptSelect = (prompt: Prompt) => {
    wizard.updateState('selectedPrompt', prompt);
  };

  const handleMugSelect = (mug: MugOption) => {
    wizard.updateState('selectedMug', mug);
  };

  const handleUserDataComplete = (data: UserData) => {
    wizard.updateState('userData', data);
  };

  const handleUserRegistration = async (): Promise<boolean> => {
    if (wizard.currentStep !== 'user-data' || !wizard.userData) {
      return true; // Not on user data step, proceed normally
    }

    setIsRegistering(true);
    setRegistrationError(null);

    try {
      const response = await apiFetch('/api/register-or-login', {
        method: 'POST',
        body: JSON.stringify({
          email: wizard.userData.email,
          first_name: wizard.userData.firstName || null,
          last_name: wizard.userData.lastName || null,
          phone_number: wizard.userData.phoneNumber || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        return true; // Success, allow navigation
      }
      return false;
    } catch (error) {
      setRegistrationError(error instanceof Error ? error.message : 'An error occurred during registration');
      return false; // Error, prevent navigation
    } finally {
      setIsRegistering(false);
    }
  };

  const handleNext = async () => {
    if (wizard.currentStep === 'user-data') {
      const success = await handleUserRegistration();
      if (success) {
        wizard.goNext();
      }
    } else {
      wizard.goNext();
    }
  };

  const handleImagesGenerated = (urls: string[]) => {
    wizard.updateState('generatedImageUrls', urls);
  };

  const handleImageSelect = (url: string) => {
    wizard.updateState('selectedGeneratedImage', url);
  };

  const handleGenerationStart = () => {
    wizard.updateState('isProcessing', true);
  };

  const handleGenerationEnd = () => {
    wizard.updateState('isProcessing', false);
  };

  const getCompletedSteps = (): WizardStep[] => {
    const completed: WizardStep[] = [];
    if (wizard.uploadedImage && wizard.cropData) completed.push('image-upload');
    if (wizard.selectedPrompt) completed.push('prompt-selection');
    if (wizard.selectedMug) completed.push('mug-selection');
    if (wizard.userData) completed.push('user-data');
    if (wizard.selectedGeneratedImage) completed.push('image-generation');
    return completed;
  };

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
      <div className="mx-auto max-w-5xl px-4 py-8 pb-24 sm:pb-8">
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

          {wizard.currentStep === 'user-data' && (
            <>
              <UserDataStep userData={wizard.userData} onUserDataComplete={handleUserDataComplete} />
              {registrationError && (
                <div className="mt-4 rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{registrationError}</p>
                </div>
              )}
            </>
          )}

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
      </div>

      {/* Sticky navigation for mobile */}
      <div className="fixed right-0 bottom-0 left-0 p-4 sm:static sm:p-0">
        <div className="mx-auto max-w-5xl sm:px-4">
          <WizardNavigationButtons
            currentStep={wizard.currentStep}
            canGoNext={wizard.canGoNext}
            canGoPrevious={wizard.canGoPrevious}
            onNext={handleNext}
            onPrevious={wizard.goPrevious}
            isProcessing={wizard.isProcessing || isRegistering}
            wizardData={{
              selectedMug: wizard.selectedMug,
              selectedGeneratedImage: wizard.selectedGeneratedImage,
              userData: wizard.userData,
            }}
          />
        </div>
      </div>

      {isRegistering && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              <p className="text-sm font-medium">Creating your account...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

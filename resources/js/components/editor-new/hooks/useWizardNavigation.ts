import { useCallback, useState } from 'react';
import { STEP_INDEX, WIZARD_STEPS, WizardStep } from '../constants';
import { WizardState } from '../types';

interface UseWizardNavigationReturn extends WizardState {
  goToStep: (step: WizardStep) => void;
  goNext: () => void;
  goPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  updateState: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
  reset: () => void;
}

const initialState: WizardState = {
  currentStep: 'image-upload',
  uploadedImage: null,
  uploadedImageUrl: null,
  cropData: null,
  selectedPrompt: null,
  selectedMug: null,
  userData: null,
  generatedImageUrls: null,
  selectedGeneratedImage: null,
  isProcessing: false,
  error: null,
};

export function useWizardNavigation(): UseWizardNavigationReturn {
  const [state, setState] = useState<WizardState>(initialState);

  const updateState = useCallback(<K extends keyof WizardState>(key: K, value: WizardState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const canProceedFromStep = useCallback(
    (step: WizardStep): boolean => {
      switch (step) {
        case 'image-upload':
          return state.uploadedImage !== null;
        case 'prompt-selection':
          return state.selectedPrompt !== null;
        case 'mug-selection':
          return state.selectedMug !== null;
        case 'user-data':
          return state.userData !== null && state.userData.email.length > 0;
        case 'image-generation':
          return state.selectedGeneratedImage !== null;
        case 'preview':
          return true;
        default:
          return false;
      }
    },
    [state],
  );

  const canGoNext = state.currentStep !== 'preview' && canProceedFromStep(state.currentStep);
  const canGoPrevious = state.currentStep !== 'image-upload';

  const goToStep = useCallback((step: WizardStep) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const goNext = useCallback(() => {
    const currentIndex = STEP_INDEX[state.currentStep];
    if (currentIndex < WIZARD_STEPS.length - 1 && canProceedFromStep(state.currentStep)) {
      const nextStep = WIZARD_STEPS[currentIndex + 1];
      goToStep(nextStep);
    }
  }, [state.currentStep, canProceedFromStep, goToStep]);

  const goPrevious = useCallback(() => {
    const currentIndex = STEP_INDEX[state.currentStep];
    if (currentIndex > 0) {
      const previousStep = WIZARD_STEPS[currentIndex - 1];
      goToStep(previousStep);
    }
  }, [state.currentStep, goToStep]);

  const reset = useCallback(() => {
    if (state.uploadedImageUrl) {
      URL.revokeObjectURL(state.uploadedImageUrl);
    }
    setState(initialState);
  }, [state.uploadedImageUrl]);

  return {
    ...state,
    goToStep,
    goNext,
    goPrevious,
    canGoNext,
    canGoPrevious,
    updateState,
    reset,
  };
}

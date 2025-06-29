import { useEffect, useState } from 'react';
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

export function useWizardNavigation(isAuthenticated: boolean = false): UseWizardNavigationReturn {
  const [state, setState] = useState<WizardState>(initialState);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [state.currentStep]);

  const updateState = <K extends keyof WizardState>(key: K, value: WizardState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const canProceedFromStep = (step: WizardStep): boolean => {
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
        return state.selectedMug !== null && state.selectedGeneratedImage !== null;
      default:
        return false;
    }
  };

  const canGoNext = canProceedFromStep(state.currentStep);
  const canGoPrevious = state.currentStep !== 'image-upload';

  const goToStep = (step: WizardStep) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  const goNext = () => {
    const currentIndex = STEP_INDEX[state.currentStep];
    if (currentIndex < WIZARD_STEPS.length - 1 && canProceedFromStep(state.currentStep)) {
      let nextStep = WIZARD_STEPS[currentIndex + 1];

      // Skip user-data step if user is already authenticated
      if (nextStep === 'user-data' && isAuthenticated) {
        nextStep = 'image-generation';
      }

      goToStep(nextStep);
    }
  };

  const goPrevious = () => {
    const currentIndex = STEP_INDEX[state.currentStep];
    if (currentIndex > 0) {
      let previousStep = WIZARD_STEPS[currentIndex - 1];

      // Skip user-data step when going back if user is already authenticated
      if (previousStep === 'user-data' && isAuthenticated) {
        previousStep = 'mug-selection';
      }

      goToStep(previousStep);
    }
  };

  const reset = () => {
    if (state.uploadedImageUrl) {
      URL.revokeObjectURL(state.uploadedImageUrl);
    }
    setState(initialState);
  };

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

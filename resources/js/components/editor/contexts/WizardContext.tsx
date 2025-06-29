import { apiFetch } from '@/lib/utils';
import type { Auth } from '@/types';
import { Prompt } from '@/types/prompt';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { WizardStep } from '../constants';
import { CropData, MugOption, UserData, WizardState } from '../types';

interface WizardContextValue extends WizardState {
  // Authentication state
  isAuthenticated: boolean;
  auth: Auth;

  // Registration state
  isRegistering: boolean;
  registrationError: string | null;

  // Navigation methods
  goToStep: (step: WizardStep) => void;
  goNext: () => void;
  goPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;

  // State update methods
  updateState: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
  reset: () => void;

  // Event handlers
  handleImageUpload: (file: File, url: string) => void;
  handleCropComplete: (cropData: CropData) => void;
  handleRemoveImage: () => void;
  handlePromptSelect: (prompt: Prompt) => void;
  handleMugSelect: (mug: MugOption) => void;
  handleUserDataComplete: (data: UserData) => void;
  handleImagesGenerated: (urls: string[]) => void;
  handleImageSelect: (url: string) => void;
  handleGenerationStart: () => void;
  handleGenerationEnd: () => void;
  handleNext: () => Promise<void>;
  handleUserRegistration: () => Promise<boolean>;

  // Computed values
  getCompletedSteps: () => WizardStep[];
}

const WizardContext = createContext<WizardContextValue | undefined>(undefined);

interface WizardProviderProps {
  children: ReactNode;
  auth: Auth;
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

export function WizardProvider({ children, auth }: WizardProviderProps) {
  const [state, setState] = useState<WizardState>(initialState);
  const [isAuthenticated, setIsAuthenticated] = useState(!!auth.user);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [state.currentStep]);

  // If user is not authenticated and tries to access image generation step, redirect back
  useEffect(() => {
    if (!isAuthenticated && state.currentStep === 'image-generation') {
      goToStep('user-data');
    }
  }, [state.currentStep, isAuthenticated]);

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
    const currentIndex = ['image-upload', 'prompt-selection', 'mug-selection', 'user-data', 'image-generation', 'preview'].indexOf(state.currentStep);
    const steps = ['image-upload', 'prompt-selection', 'mug-selection', 'user-data', 'image-generation', 'preview'] as const;

    if (currentIndex < steps.length - 1 && canProceedFromStep(state.currentStep)) {
      let nextStep = steps[currentIndex + 1];

      // Skip user-data step if user is already authenticated
      if (nextStep === 'user-data' && isAuthenticated) {
        nextStep = 'image-generation';
      }

      goToStep(nextStep);
    }
  };

  const goPrevious = () => {
    const currentIndex = ['image-upload', 'prompt-selection', 'mug-selection', 'user-data', 'image-generation', 'preview'].indexOf(state.currentStep);
    const steps = ['image-upload', 'prompt-selection', 'mug-selection', 'user-data', 'image-generation', 'preview'] as const;

    if (currentIndex > 0) {
      let previousStep = steps[currentIndex - 1];

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

  const handleImageUpload = (file: File, url: string) => {
    updateState('uploadedImage', file);
    updateState('uploadedImageUrl', url);
  };

  const handleCropComplete = (cropData: CropData) => {
    updateState('cropData', cropData);
  };

  const handleRemoveImage = () => {
    if (state.uploadedImageUrl) {
      URL.revokeObjectURL(state.uploadedImageUrl);
    }
    updateState('uploadedImage', null);
    updateState('uploadedImageUrl', null);
    updateState('cropData', null);
  };

  const handlePromptSelect = (prompt: Prompt) => {
    updateState('selectedPrompt', prompt);
  };

  const handleMugSelect = (mug: MugOption) => {
    updateState('selectedMug', mug);
  };

  const handleUserDataComplete = (data: UserData) => {
    updateState('userData', data);
  };

  const handleUserRegistration = async (): Promise<boolean> => {
    if (state.currentStep !== 'user-data' || !state.userData) {
      return true; // Not on user data step, proceed normally
    }

    setIsRegistering(true);
    setRegistrationError(null);

    try {
      const response = await apiFetch('/api/register-or-login', {
        method: 'POST',
        body: JSON.stringify({
          email: state.userData.email,
          first_name: state.userData.firstName || null,
          last_name: state.userData.lastName || null,
          phone_number: state.userData.phoneNumber || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      setIsAuthenticated(data.authenticated);

      return data.authenticated;
    } catch (error) {
      setRegistrationError(error instanceof Error ? error.message : 'An error occurred during registration');
      return false; // Error, prevent navigation
    } finally {
      setIsRegistering(false);
    }
  };

  const handleNext = async () => {
    // Only handle registration if on user-data step and not authenticated
    if (state.currentStep === 'user-data' && !isAuthenticated) {
      const success = await handleUserRegistration();
      if (success) {
        goNext();
      }
    } else {
      goNext();
    }
  };

  const handleImagesGenerated = (urls: string[]) => {
    updateState('generatedImageUrls', urls);
  };

  const handleImageSelect = (url: string) => {
    updateState('selectedGeneratedImage', url);
  };

  const handleGenerationStart = () => {
    updateState('isProcessing', true);
  };

  const handleGenerationEnd = () => {
    updateState('isProcessing', false);
  };

  const getCompletedSteps = (): WizardStep[] => {
    const completed: WizardStep[] = [];
    if (state.uploadedImage && state.cropData) completed.push('image-upload');
    if (state.selectedPrompt) completed.push('prompt-selection');
    if (state.selectedMug) completed.push('mug-selection');
    // Mark user-data as completed if user is authenticated OR if userData is filled
    if (isAuthenticated || state.userData) completed.push('user-data');
    if (state.selectedGeneratedImage) completed.push('image-generation');
    return completed;
  };

  const value: WizardContextValue = {
    ...state,
    isAuthenticated,
    auth,
    isRegistering,
    registrationError,
    goToStep,
    goNext,
    goPrevious,
    canGoNext,
    canGoPrevious,
    updateState,
    reset,
    handleImageUpload,
    handleCropComplete,
    handleRemoveImage,
    handlePromptSelect,
    handleMugSelect,
    handleUserDataComplete,
    handleImagesGenerated,
    handleImageSelect,
    handleGenerationStart,
    handleGenerationEnd,
    handleNext,
    handleUserRegistration,
    getCompletedSteps,
  };

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}

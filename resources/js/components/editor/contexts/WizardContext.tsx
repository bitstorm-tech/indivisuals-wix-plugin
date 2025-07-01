import { apiFetch } from '@/lib/utils';
import type { Auth } from '@/types';
import { Prompt } from '@/types/prompt';
import { ReactNode, createContext, useContext, useEffect, useReducer } from 'react';
import { WizardStep } from '../constants';
import { CropData, MugOption, UserData, WizardState } from '../types';
import { wizardActions } from './wizardActions';
import { createInitialWizardState, withLogger, wizardReducer } from './wizardReducer';

interface WizardContextValue extends WizardState {
  // Additional context-only values
  auth: Auth;

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

// Use the reducer with logging in development
const enhancedReducer = process.env.NODE_ENV === 'development' ? withLogger(wizardReducer) : wizardReducer;

export function WizardProvider({ children, auth }: WizardProviderProps) {
  const [state, dispatch] = useReducer(enhancedReducer, createInitialWizardState(!!auth.user));

  // Fetch prompts on mount
  useEffect(() => {
    const controller = new AbortController();
    dispatch(wizardActions.setPromptsLoading(true));
    dispatch(wizardActions.setPromptsError(null));

    apiFetch('/api/prompts', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch prompts');
        }
        return response.json();
      })
      .then((data) => {
        dispatch(wizardActions.setPrompts(data));
        dispatch(wizardActions.setPromptsLoading(false));
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          dispatch(wizardActions.setPromptsError(error.message));
          dispatch(wizardActions.setPromptsLoading(false));
        }
      });

    return () => {
      controller.abort();
    };
  }, [dispatch]);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [state.currentStep]);

  // If user is not authenticated and tries to access image generation step, redirect back
  useEffect(() => {
    if (!state.isAuthenticated && state.currentStep === 'image-generation') {
      dispatch(wizardActions.setStep('user-data'));
    }
  }, [state.currentStep, state.isAuthenticated]);

  const updateState = <K extends keyof WizardState>(key: K, value: WizardState[K]) => {
    // Map old updateState calls to appropriate actions
    switch (key) {
      case 'currentStep':
        dispatch(wizardActions.setStep(value as WizardStep));
        break;
      case 'uploadedImage':
        // This is handled by handleImageUpload
        break;
      case 'cropData':
        if (value) dispatch(wizardActions.cropImage(value as CropData));
        break;
      case 'selectedPrompt':
        if (value) dispatch(wizardActions.selectPrompt(value as Prompt));
        break;
      case 'selectedMug':
        if (value) dispatch(wizardActions.selectMug(value as MugOption));
        break;
      case 'userData':
        if (value) dispatch(wizardActions.setUserData(value as UserData));
        break;
      case 'generatedImageUrls':
        if (value) dispatch(wizardActions.setGeneratedImages(value as string[]));
        break;
      case 'selectedGeneratedImage':
        if (value) dispatch(wizardActions.selectGeneratedImage(value as string));
        break;
      case 'isProcessing':
        dispatch(wizardActions.setProcessing(value as boolean));
        break;
      case 'error':
        dispatch(wizardActions.setError(value as string | null));
        break;
      // These are now handled by the reducer
      case 'isAuthenticated':
      case 'isRegistering':
      case 'registrationError':
      case 'prompts':
      case 'promptsLoading':
      case 'promptsError':
        console.warn(`Attempted to update ${key} via updateState, but this should be handled by specific actions`);
        break;
    }
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
    dispatch(wizardActions.setStep(step));
  };

  const goNext = () => {
    dispatch(wizardActions.goNext(state.isAuthenticated));
  };

  const goPrevious = () => {
    dispatch(wizardActions.goPrevious(state.isAuthenticated));
  };

  const reset = () => {
    dispatch(wizardActions.reset());
  };

  const handleImageUpload = (file: File, url: string) => {
    dispatch(wizardActions.uploadImage(file, url));
  };

  const handleCropComplete = (cropData: CropData) => {
    dispatch(wizardActions.cropImage(cropData));
  };

  const handleRemoveImage = () => {
    dispatch(wizardActions.removeImage());
  };

  const handlePromptSelect = (prompt: Prompt) => {
    dispatch(wizardActions.selectPrompt(prompt));
  };

  const handleMugSelect = (mug: MugOption) => {
    dispatch(wizardActions.selectMug(mug));
  };

  const handleUserDataComplete = (data: UserData) => {
    dispatch(wizardActions.setUserData(data));
  };

  const handleUserRegistration = async (): Promise<boolean> => {
    if (state.currentStep !== 'user-data' || !state.userData) {
      return true; // Not on user data step, proceed normally
    }

    dispatch(wizardActions.setRegistering(true));
    dispatch(wizardActions.setRegistrationError(null));

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
      dispatch(wizardActions.setAuthenticated(data.authenticated));

      return data.authenticated;
    } catch (error) {
      dispatch(wizardActions.setRegistrationError(error instanceof Error ? error.message : 'An error occurred during registration'));
      return false; // Error, prevent navigation
    } finally {
      dispatch(wizardActions.setRegistering(false));
    }
  };

  const handleNext = async () => {
    // Only handle registration if on user-data step and not authenticated
    if (state.currentStep === 'user-data' && !state.isAuthenticated) {
      const success = await handleUserRegistration();
      if (success) {
        goNext();
      }
    } else {
      goNext();
    }
  };

  const handleImagesGenerated = (urls: string[]) => {
    dispatch(wizardActions.setGeneratedImages(urls));
  };

  const handleImageSelect = (url: string) => {
    dispatch(wizardActions.selectGeneratedImage(url));
  };

  const handleGenerationStart = () => {
    dispatch(wizardActions.setProcessing(true));
  };

  const handleGenerationEnd = () => {
    dispatch(wizardActions.setProcessing(false));
  };

  const getCompletedSteps = (): WizardStep[] => {
    const completed: WizardStep[] = [];
    if (state.uploadedImage && state.cropData) completed.push('image-upload');
    if (state.selectedPrompt) completed.push('prompt-selection');
    if (state.selectedMug) completed.push('mug-selection');
    // Mark user-data as completed if user is authenticated OR if userData is filled
    if (state.isAuthenticated || state.userData) completed.push('user-data');
    if (state.selectedGeneratedImage) completed.push('image-generation');
    return completed;
  };

  const value: WizardContextValue = {
    ...state,
    auth,
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

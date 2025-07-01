import { WizardStep } from '../constants';
import { WizardState } from '../types';
import { WIZARD_ACTIONS, WizardAction } from './wizardActions';

const WIZARD_STEPS: WizardStep[] = ['image-upload', 'prompt-selection', 'mug-selection', 'user-data', 'image-generation', 'preview'];

export function createInitialWizardState(isAuthenticated: boolean): WizardState {
  return {
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
    // Authentication state
    isAuthenticated,
    isRegistering: false,
    registrationError: null,
    // Prompts state
    prompts: [],
    promptsLoading: true,
    promptsError: null,
  };
}

export const initialWizardState = createInitialWizardState(false);

function canProceedFromStep(state: WizardState, step: WizardStep): boolean {
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
}

function getNextStep(currentStep: WizardStep, skipUserData: boolean): WizardStep | null {
  const currentIndex = WIZARD_STEPS.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === WIZARD_STEPS.length - 1) return null;

  let nextStep = WIZARD_STEPS[currentIndex + 1];
  if (nextStep === 'user-data' && skipUserData) {
    nextStep = 'image-generation';
  }

  return nextStep;
}

function getPreviousStep(currentStep: WizardStep, skipUserData: boolean): WizardStep | null {
  const currentIndex = WIZARD_STEPS.indexOf(currentStep);
  if (currentIndex <= 0) return null;

  let previousStep = WIZARD_STEPS[currentIndex - 1];
  if (previousStep === 'user-data' && skipUserData) {
    previousStep = 'mug-selection';
  }

  return previousStep;
}

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case WIZARD_ACTIONS.SET_STEP:
      return { ...state, currentStep: action.payload };

    case WIZARD_ACTIONS.UPLOAD_IMAGE:
      return {
        ...state,
        uploadedImage: action.payload.file,
        uploadedImageUrl: action.payload.url,
        cropData: null, // Reset crop data when new image is uploaded
      };

    case WIZARD_ACTIONS.CROP_IMAGE:
      return { ...state, cropData: action.payload };

    case WIZARD_ACTIONS.REMOVE_IMAGE:
      // Clean up the object URL if it exists
      if (state.uploadedImageUrl) {
        URL.revokeObjectURL(state.uploadedImageUrl);
      }
      return {
        ...state,
        uploadedImage: null,
        uploadedImageUrl: null,
        cropData: null,
      };

    case WIZARD_ACTIONS.SELECT_PROMPT:
      return { ...state, selectedPrompt: action.payload };

    case WIZARD_ACTIONS.SELECT_MUG:
      return { ...state, selectedMug: action.payload };

    case WIZARD_ACTIONS.SET_USER_DATA:
      return { ...state, userData: action.payload };

    case WIZARD_ACTIONS.SET_GENERATED_IMAGES:
      return {
        ...state,
        generatedImageUrls: action.payload,
        selectedGeneratedImage: null, // Reset selection when new images are generated
      };

    case WIZARD_ACTIONS.SELECT_GENERATED_IMAGE:
      return { ...state, selectedGeneratedImage: action.payload };

    case WIZARD_ACTIONS.SET_PROCESSING:
      return { ...state, isProcessing: action.payload };

    case WIZARD_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };

    case WIZARD_ACTIONS.RESET:
      // Clean up the object URL if it exists
      if (state.uploadedImageUrl) {
        URL.revokeObjectURL(state.uploadedImageUrl);
      }
      return initialWizardState;

    case WIZARD_ACTIONS.GO_NEXT: {
      if (!canProceedFromStep(state, state.currentStep)) {
        return state; // Can't proceed, return unchanged
      }

      const nextStep = getNextStep(state.currentStep, action.payload?.skipUserData || false);
      if (!nextStep) return state;

      return { ...state, currentStep: nextStep };
    }

    case WIZARD_ACTIONS.GO_PREVIOUS: {
      const previousStep = getPreviousStep(state.currentStep, action.payload?.skipUserData || false);
      if (!previousStep) return state;

      return { ...state, currentStep: previousStep };
    }

    // Authentication actions
    case WIZARD_ACTIONS.SET_AUTHENTICATED:
      return { ...state, isAuthenticated: action.payload };

    case WIZARD_ACTIONS.SET_REGISTERING:
      return { ...state, isRegistering: action.payload };

    case WIZARD_ACTIONS.SET_REGISTRATION_ERROR:
      return { ...state, registrationError: action.payload };

    // Prompts actions
    case WIZARD_ACTIONS.SET_PROMPTS:
      return { ...state, prompts: action.payload };

    case WIZARD_ACTIONS.SET_PROMPTS_LOADING:
      return { ...state, promptsLoading: action.payload };

    case WIZARD_ACTIONS.SET_PROMPTS_ERROR:
      return { ...state, promptsError: action.payload };

    default: {
      // Exhaustive check to ensure all actions are handled
      const exhaustiveCheck: never = action;
      console.warn('Unhandled action type:', exhaustiveCheck);
      return state;
    }
  }
}

// Helper function for logging in development
export function withLogger(reducer: typeof wizardReducer): typeof wizardReducer {
  return (state, action) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`Action: ${action.type}`);
      console.log('Previous State:', state);
      console.log('Action:', action);
      const nextState = reducer(state, action);
      console.log('Next State:', nextState);
      console.groupEnd();
      return nextState;
    }
    return reducer(state, action);
  };
}

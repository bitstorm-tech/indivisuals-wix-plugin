import { Prompt } from '@/types/prompt';
import { WizardStep } from './constants';

export interface MugOption {
  id: number;
  name: string;
  price: number;
  image: string;
  capacity: string;
  special?: string;
}

export interface CropData {
  unit: '%' | 'px';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UserData {
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface WizardState {
  currentStep: WizardStep;
  uploadedImage: File | null;
  uploadedImageUrl: string | null;
  cropData: CropData | null;
  selectedPrompt: Prompt | null;
  selectedMug: MugOption | null;
  userData: UserData | null;
  generatedImageUrls: string[] | null;
  selectedGeneratedImage: string | null;
  isProcessing: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isRegistering: boolean;
  registrationError: string | null;
  prompts: Prompt[];
  promptsLoading: boolean;
  promptsError: string | null;
  // Navigation state
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export interface WizardNavigationProps {
  currentStep: WizardStep;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  isProcessing?: boolean;
}

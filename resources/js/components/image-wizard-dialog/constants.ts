export type WizardStep = 'template' | 'upload' | 'result';

export interface PredefinedImage {
  id: number;
  src: string;
  alt: string;
}

export const PREDEFINED_IMAGES: PredefinedImage[] = [
  { id: 1, src: '/api/placeholder/300/300', alt: 'Mystical Forest' },
  { id: 2, src: '/api/placeholder/300/300', alt: 'Ocean Waves' },
  { id: 3, src: '/api/placeholder/300/300', alt: 'Mountain Peak' },
  { id: 4, src: '/api/placeholder/300/300', alt: 'City Lights' },
  { id: 5, src: '/api/placeholder/300/300', alt: 'Desert Sunset' },
  { id: 6, src: '/api/placeholder/300/300', alt: 'Aurora Borealis' },
];

export const WIZARD_STEPS = ['template', 'upload', 'result'] as const;

export const STEP_LABELS = {
  template: 'Choose Style',
  upload: 'Upload Photo',
  result: 'See Magic!',
};

export const STEP_INDEX = {
  template: 0,
  upload: 1,
  result: 2,
} as const;

export const WIZARD_STEPS = ['image-upload', 'prompt-selection', 'mug-selection', 'user-data', 'image-generation', 'preview'] as const;

export type WizardStep = (typeof WIZARD_STEPS)[number];

export const STEP_LABELS: Record<WizardStep, string> = {
  'image-upload': 'Upload & Crop Image',
  'prompt-selection': 'Select Style',
  'mug-selection': 'Choose Mug',
  'user-data': 'Personal Information',
  'image-generation': 'Generate Magic',
  preview: 'Preview Product',
} as const;

export const STEP_INDEX: Record<WizardStep, number> = {
  'image-upload': 0,
  'prompt-selection': 1,
  'mug-selection': 2,
  'user-data': 3,
  'image-generation': 4,
  preview: 5,
} as const;

export const MUG_OPTIONS = [
  {
    id: 'classic-white',
    name: 'Classic White Mug',
    price: 12.99,
    image: '/images/mugs/classic-white.jpg',
    capacity: '11oz',
    special: undefined,
  },
  {
    id: 'black-matte',
    name: 'Black Matte Mug',
    price: 14.99,
    image: '/images/mugs/black-matte.jpg',
    capacity: '11oz',
    special: undefined,
  },
  {
    id: 'color-changing',
    name: 'Color Changing Mug',
    price: 19.99,
    image: '/images/mugs/color-changing.jpg',
    capacity: '11oz',
    special: 'Heat Reactive',
  },
  {
    id: 'travel-mug',
    name: 'Travel Mug',
    price: 24.99,
    image: '/images/mugs/travel-mug.jpg',
    capacity: '16oz',
    special: 'Insulated',
  },
] as const;

export const CROP_ASPECT_RATIOS = [
  { label: 'Square (1:1)', value: 1 },
  { label: 'Portrait (3:4)', value: 3 / 4 },
  { label: 'Landscape (4:3)', value: 4 / 3 },
  { label: 'Free', value: undefined },
] as const;

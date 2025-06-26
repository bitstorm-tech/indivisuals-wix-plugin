import { Prompt } from '@/types/prompt';
import { useState } from 'react';
import { STEP_INDEX, WizardStep } from '../constants';

interface UseWizardStepReturn {
  currentStep: WizardStep;
  selectedTemplateId: number | null;
  selectedPromptId: number | null;
  progress: number;
  setCurrentStep: (step: WizardStep) => void;
  handleTemplateSelect: (templateId: number, prompts: Prompt[]) => void;
  reset: () => void;
}

export function useWizardStep(): UseWizardStepReturn {
  const [currentStep, setCurrentStep] = useState<WizardStep>('template');
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null);

  const progress = ((STEP_INDEX[currentStep] + 1) / 3) * 100;

  const handleTemplateSelect = (templateId: number, prompts: Prompt[]) => {
    setSelectedTemplateId(templateId);
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setSelectedPromptId(randomPrompt.id);

    setTimeout(() => {
      setCurrentStep('upload');
    }, 300);
  };

  const reset = () => {
    setCurrentStep('template');
    setSelectedTemplateId(null);
    setSelectedPromptId(null);
  };

  return {
    currentStep,
    selectedTemplateId,
    selectedPromptId,
    progress,
    setCurrentStep,
    handleTemplateSelect,
    reset,
  };
}

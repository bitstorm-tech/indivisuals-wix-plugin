import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import React from 'react';
import { STEP_INDEX, STEP_LABELS, WizardStep } from '../constants';

interface WizardProgressProps {
  currentStep: WizardStep;
  progress: number;
}

const WizardProgress: React.FC<WizardProgressProps> = ({ currentStep, progress }) => {
  const steps = Object.entries(STEP_LABELS) as Array<[WizardStep, string]>;

  return (
    <div className="relative">
      <Progress value={progress} className="h-2" />
      <div className="absolute -top-1 flex w-full justify-between">
        {steps.map(([step, label]) => (
          <motion.div
            key={step}
            className={cn('text-xs font-medium', STEP_INDEX[currentStep] >= STEP_INDEX[step] ? 'text-purple-600' : 'text-gray-400')}
            initial={{ scale: 0.8 }}
            animate={{ scale: STEP_INDEX[currentStep] >= STEP_INDEX[step] ? 1.1 : 0.9 }}
          >
            {label}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WizardProgress;

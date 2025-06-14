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
    <div className="relative space-y-3">
      <div className="flex w-full justify-between px-1">
        {steps.map(([step, label]) => (
          <motion.div
            key={step}
            className={cn('text-sm font-medium whitespace-nowrap', STEP_INDEX[currentStep] >= STEP_INDEX[step] ? 'text-purple-600' : 'text-gray-400')}
            initial={{ scale: 0.8 }}
            animate={{ scale: STEP_INDEX[currentStep] >= STEP_INDEX[step] ? 1.1 : 0.9 }}
          >
            {label}
          </motion.div>
        ))}
      </div>
      <Progress value={progress} className="h-3" />
    </div>
  );
};

export default WizardProgress;

import { Button } from '@/components/ui/Button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { WizardNavigationProps } from '../types';

export default function WizardNavigationButtons({ currentStep, canGoNext, canGoPrevious, onNext, onPrevious, isProcessing }: WizardNavigationProps) {
  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" onClick={onPrevious} disabled={!canGoPrevious || isProcessing} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Button onClick={onNext} disabled={!canGoNext || isProcessing} className="gap-2">
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {currentStep === 'preview' ? 'Finish' : 'Next'}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

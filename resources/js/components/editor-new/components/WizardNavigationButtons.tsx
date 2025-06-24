import { Button } from '@/components/ui/Button';
import { router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { MugOption, UserData, WizardNavigationProps } from '../types';

interface ExtendedWizardNavigationProps extends WizardNavigationProps {
  wizardData?: {
    selectedMug: MugOption | null;
    selectedGeneratedImage: string | null;
    userData: UserData | null;
  };
}

export default function WizardNavigationButtons({
  currentStep,
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious,
  isProcessing,
  wizardData,
}: ExtendedWizardNavigationProps) {
  const handleNext = () => {
    if (currentStep === 'preview' && canGoNext && wizardData) {
      router.visit('/checkout', {
        data: {
          selectedMug: wizardData.selectedMug,
          selectedGeneratedImage: wizardData.selectedGeneratedImage,
          userData: wizardData.userData,
        },
      });
    } else {
      onNext();
    }
  };

  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" onClick={onPrevious} disabled={!canGoPrevious || isProcessing} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Button onClick={handleNext} disabled={!canGoNext || isProcessing} className="gap-2">
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

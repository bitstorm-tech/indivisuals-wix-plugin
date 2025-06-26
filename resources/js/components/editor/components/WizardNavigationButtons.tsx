import { Button } from '@/components/ui/Button';
import { router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Loader2, ShoppingCart } from 'lucide-react';
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
      // Since this is going to the checkout page, we need to store the data in session or pass it differently
      // For now, let's just navigate to checkout - the checkout page will need to be updated to handle the cart data
      router.visit('/checkout');
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
        ) : currentStep === 'preview' ? (
          <>
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </>
        ) : (
          <>
            Next
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

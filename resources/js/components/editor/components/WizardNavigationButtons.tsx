import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Loader2, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { CropData, MugOption, UserData, WizardNavigationProps } from '../types';

interface ExtendedWizardNavigationProps extends WizardNavigationProps {
  wizardData?: {
    selectedMug: MugOption | null;
    selectedGeneratedImage: string | null;
    userData: UserData | null;
    uploadedImageUrl: string | null;
    cropData: CropData | null;
    selectedPromptId: number | null;
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
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleNext = async () => {
    if (currentStep === 'preview' && canGoNext && wizardData) {
      setIsAddingToCart(true);

      try {
        // Extract the original image filename from the uploaded image URL
        const originalImagePath = wizardData.uploadedImageUrl?.split('/').pop() || null;

        // Ensure we're sending the filename, not the full data URL
        const generatedImagePath = wizardData.selectedGeneratedImage?.startsWith('data:') ? null : wizardData.selectedGeneratedImage;

        if (!generatedImagePath) {
          throw new Error('Generated image must be saved before adding to cart');
        }

        const response = await apiFetch('/api/cart/items', {
          method: 'POST',
          body: JSON.stringify({
            mug_id: wizardData.selectedMug?.id,
            generated_image_path: generatedImagePath,
            original_image_path: originalImagePath,
            crop_data: wizardData.cropData,
            prompt_id: wizardData.selectedPromptId,
            quantity: 1,
            customization_data: {
              user_data: wizardData.userData,
            },
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to add item to cart');
        }

        // Navigate to cart page
        router.visit('/cart');
      } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart. Please try again.');
      } finally {
        setIsAddingToCart(false);
      }
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

      <Button onClick={handleNext} disabled={!canGoNext || isProcessing || isAddingToCart} className="gap-2">
        {isProcessing || isAddingToCart ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {isAddingToCart ? 'Adding to Cart...' : 'Processing...'}
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

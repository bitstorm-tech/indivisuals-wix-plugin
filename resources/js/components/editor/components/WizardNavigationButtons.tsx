import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Loader2, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useWizardContext } from '../contexts/WizardContext';

export default function WizardNavigationButtons() {
  const {
    currentStep,
    canGoNext,
    canGoPrevious,
    handleNext: onNext,
    goPrevious,
    isProcessing,
    isRegistering,
    selectedMug,
    selectedGeneratedImage,
    userData,
    uploadedImageUrl,
    cropData,
    selectedPrompt,
  } = useWizardContext();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleNext = async () => {
    if (currentStep === 'preview' && canGoNext) {
      setIsAddingToCart(true);

      try {
        // Extract the original image filename from the uploaded image URL
        const originalImagePath = uploadedImageUrl?.split('/').pop() || null;

        // Ensure we're sending the filename, not the full data URL
        const generatedImagePath = selectedGeneratedImage?.startsWith('data:') ? null : selectedGeneratedImage;

        if (!generatedImagePath) {
          throw new Error('Generated image must be saved before adding to cart');
        }

        const response = await apiFetch('/api/cart/items', {
          method: 'POST',
          body: JSON.stringify({
            mug_id: selectedMug?.id,
            generated_image_path: generatedImagePath,
            original_image_path: originalImagePath,
            crop_data: cropData,
            prompt_id: selectedPrompt?.id || null,
            quantity: 1,
            customization_data: {
              user_data: userData,
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
      <Button variant="outline" onClick={goPrevious} disabled={!canGoPrevious || isProcessing || isRegistering} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Button onClick={handleNext} disabled={!canGoNext || isProcessing || isRegistering || isAddingToCart} className="gap-2">
        {isProcessing || isRegistering || isAddingToCart ? (
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

import { Button } from '@/components/ui/Button';
import { CheckCircle, Crop, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Crop as CropType, PixelCrop } from 'react-image-crop';
import { useWizardContext } from '../../contexts/WizardContext';
import GeneratedImageCropper from '../shared/GeneratedImageCropper';
import MugPreview from '../shared/MugPreview';

export default function PreviewStep() {
  const { selectedMug, selectedGeneratedImage, generatedImageCropData, userData, updateGeneratedImageCropData } = useWizardContext();

  const [isEditingCrop, setIsEditingCrop] = useState(!generatedImageCropData);
  const [localCrop, setLocalCrop] = useState<CropType>(generatedImageCropData || ({} as CropType));

  useEffect(() => {
    // If no crop data exists when component mounts, start in edit mode
    if (!generatedImageCropData && selectedGeneratedImage) {
      setIsEditingCrop(true);
    }
  }, [generatedImageCropData, selectedGeneratedImage]);

  if (!selectedMug || !selectedGeneratedImage) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>Missing required data. Please complete all previous steps.</p>
        <p className="mt-2 text-sm">
          {!selectedMug && 'Mug not selected. '}
          {!selectedGeneratedImage && 'Generated image not selected. '}
        </p>
      </div>
    );
  }

  const handleCropComplete = (crop: PixelCrop) => {
    // Convert PixelCrop to our CropData format
    const cropData = {
      unit: crop.unit,
      x: crop.x,
      y: crop.y,
      width: crop.width,
      height: crop.height,
    };
    updateGeneratedImageCropData(cropData);
  };

  const handleSaveCrop = () => {
    setIsEditingCrop(false);
  };

  const handleEditCrop = () => {
    setIsEditingCrop(true);
  };

  const imageUrl = selectedGeneratedImage.startsWith('data:') ? selectedGeneratedImage : `/api/images/${selectedGeneratedImage}`;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <h3 className="mb-2 text-2xl font-bold">{isEditingCrop ? 'Crop Your Design' : 'Your Custom Mug is Ready!'}</h3>
        <p className="text-gray-600">
          {isEditingCrop
            ? 'Adjust the crop area to select the perfect part of your design for the mug'
            : `Here's how your personalized design will look on the ${selectedMug.name}`}
        </p>
      </div>

      {/* Toggle buttons */}
      <div className="flex justify-center gap-2">
        <Button onClick={handleEditCrop} variant={isEditingCrop ? 'default' : 'outline'} size="sm" className="gap-2">
          <Crop className="h-4 w-4" />
          Edit Crop
        </Button>
        <Button
          onClick={handleSaveCrop}
          variant={!isEditingCrop ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
          disabled={!generatedImageCropData}
        >
          <Eye className="h-4 w-4" />
          Preview Mug
        </Button>
      </div>

      {isEditingCrop ? (
        <GeneratedImageCropper
          imageUrl={imageUrl}
          crop={localCrop}
          onCropChange={setLocalCrop}
          onCropComplete={handleCropComplete}
          mug={selectedMug}
          className="mx-auto"
        />
      ) : (
        <>
          <MugPreview mug={selectedMug} imageUrl={imageUrl} cropData={generatedImageCropData} className="mx-auto" />

          <div className="mx-auto max-w-md space-y-4 rounded-lg bg-gray-50 p-6">
            <h4 className="font-semibold">Order Summary</h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Product:</span>
                <span className="font-medium">{selectedMug.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Capacity:</span>
                <span className="font-medium">{selectedMug.capacity}</span>
              </div>
              {selectedMug.special && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Special Feature:</span>
                  <span className="font-medium">{selectedMug.special}</span>
                </div>
              )}
              {userData && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">
                    {userData.firstName || userData.lastName ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() : userData.email}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="text-primary">${selectedMug.price}</span>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">Your design has been saved and will be available in your account</p>
        </>
      )}
    </div>
  );
}

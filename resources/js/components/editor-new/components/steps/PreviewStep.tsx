import { Button } from '@/components/ui/Button';
import { CheckCircle, Download, ShoppingCart } from 'lucide-react';
import { MugOption, UserData } from '../../types';
import MugPreview from '../shared/MugPreview';

interface PreviewStepProps {
  selectedMug: MugOption | null;
  selectedGeneratedImage: string | null;
  userData: UserData | null;
}

export default function PreviewStep({ selectedMug, selectedGeneratedImage, userData }: PreviewStepProps) {
  if (!selectedMug || !selectedGeneratedImage || !userData) {
    return null;
  }

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = selectedGeneratedImage;
    link.download = 'my-custom-mug-design.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <h3 className="mb-2 text-2xl font-bold">Your Custom Mug is Ready!</h3>
        <p className="text-gray-600">Here's how your personalized design will look on the {selectedMug.name}</p>
      </div>

      <MugPreview mug={selectedMug} imageUrl={selectedGeneratedImage} className="mx-auto" />

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
          <div className="flex justify-between">
            <span className="text-gray-600">Customer:</span>
            <span className="font-medium">
              {userData.firstName || userData.lastName ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() : userData.email}
            </span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span className="text-primary">${selectedMug.price}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          Download Design
        </Button>
        <Button size="lg" className="gap-2">
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
      </div>

      <p className="text-center text-sm text-gray-500">Your design has been saved and will be available in your account</p>
    </div>
  );
}

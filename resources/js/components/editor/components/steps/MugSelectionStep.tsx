import { cn } from '@/lib/utils';
import { Check, Star } from 'lucide-react';
import { MUG_OPTIONS } from '../../constants';
import { useWizard } from '../../contexts/WizardContext';

export default function MugSelectionStep() {
  const { selectedMug, handleMugSelect } = useWizard();
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-lg font-semibold">Choose Your Mug</h3>
        <p className="text-sm text-gray-600">Select the perfect mug to showcase your personalized design</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {MUG_OPTIONS.map((mug) => {
          const isSelected = selectedMug?.id === mug.id;

          return (
            <div
              key={mug.id}
              onClick={() => handleMugSelect(mug)}
              className={cn(
                'relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all',
                isSelected ? 'border-primary shadow-lg' : 'border-gray-200 hover:border-gray-300 hover:shadow-md',
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md">
                    <Check className="h-5 w-5" />
                  </div>
                </div>
              )}

              {mug.special && (
                <div className="absolute top-2 left-2 z-10">
                  <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                    <Star className="h-3 w-3" />
                    {mug.special}
                  </div>
                </div>
              )}

              <div className="aspect-square bg-gray-100 p-4">
                <div className="flex h-full items-center justify-center">
                  <div className="h-32 w-32 rounded-lg bg-gray-300" />
                </div>
              </div>

              <div className="p-4">
                <h4 className="mb-1 font-medium">{mug.name}</h4>
                <p className="mb-2 text-sm text-gray-600">{mug.capacity}</p>
                <p className="text-primary text-lg font-semibold">${mug.price}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

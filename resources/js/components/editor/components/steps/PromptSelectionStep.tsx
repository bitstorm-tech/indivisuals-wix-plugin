import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useWizard } from '../../contexts/WizardContext';
import { usePromptSelection } from '../../hooks/usePromptSelection';
import PromptCategoryFilter from '../shared/PromptCategoryFilter';

export default function PromptSelectionStep() {
  const wizard = useWizard();
  const { selectedCategory, setSelectedCategory, filteredPrompts, categories } = usePromptSelection(wizard.prompts);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-lg font-semibold">Choose Your Style</h3>
        <p className="text-sm text-gray-600">Select a style that will transform your image into something magical</p>
      </div>

      <PromptCategoryFilter categories={categories} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPrompts.map((prompt) => {
          const isSelected = wizard.selectedPrompt?.id === prompt.id;

          return (
            <div
              key={prompt.id}
              onClick={() => wizard.handlePromptSelect(prompt)}
              className={cn(
                'group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-300',
                isSelected ? 'border-primary shadow-md' : 'border-gray-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl',
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-full text-white">
                    <Check className="h-4 w-4" />
                  </div>
                </div>
              )}

              {prompt.example_image_url ? (
                <div className="relative">
                  <img
                    src={prompt.example_image_url}
                    alt={prompt.name}
                    className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 transition-all duration-300 group-hover:from-black/80">
                    <h4 className="font-medium text-white">{prompt.name}</h4>
                  </div>
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center bg-gray-100 p-4 transition-colors duration-300 group-hover:bg-gray-200">
                  <div className="text-center">
                    <h4 className="mb-2 font-medium">{prompt.name}</h4>
                    <p className="text-xs text-gray-500">No preview available</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredPrompts.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500">No styles found in this category</p>
        </div>
      )}
    </div>
  );
}

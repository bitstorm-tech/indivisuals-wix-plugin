import { cn } from '@/lib/utils';
import { Prompt } from '@/types/prompt';
import { Check } from 'lucide-react';
import { usePromptSelection } from '../../hooks/usePromptSelection';
import PromptCategoryFilter from '../shared/PromptCategoryFilter';

interface PromptSelectionStepProps {
  prompts: Prompt[];
  selectedPrompt: Prompt | null;
  onPromptSelect: (prompt: Prompt) => void;
}

export default function PromptSelectionStep({ prompts, selectedPrompt, onPromptSelect }: PromptSelectionStepProps) {
  const { selectedCategory, setSelectedCategory, filteredPrompts, categories } = usePromptSelection(prompts);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-lg font-semibold">Choose Your Style</h3>
        <p className="text-sm text-gray-600">Select a style that will transform your image into something magical</p>
      </div>

      <PromptCategoryFilter categories={categories} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPrompts.map((prompt) => {
          const isSelected = selectedPrompt?.id === prompt.id;

          return (
            <div
              key={prompt.id}
              onClick={() => onPromptSelect(prompt)}
              className={cn(
                'relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all',
                isSelected ? 'border-primary shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm',
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
                  <img src={prompt.example_image_url} alt={prompt.name} className="h-48 w-full object-cover" loading="lazy" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <h4 className="font-medium text-white">{prompt.name}</h4>
                  </div>
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center bg-gray-100 p-4">
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

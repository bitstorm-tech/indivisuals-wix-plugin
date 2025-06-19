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
                'relative cursor-pointer rounded-lg border-2 p-4 transition-all',
                isSelected ? 'border-primary bg-primary/5 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm',
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-full text-white">
                    <Check className="h-4 w-4" />
                  </div>
                </div>
              )}

              <h4 className="mb-2 font-medium">{prompt.name}</h4>

              {prompt.category && (
                <span className="mb-2 inline-block rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 capitalize">
                  {prompt.category}
                </span>
              )}

              <p className="line-clamp-2 text-sm text-gray-600">{prompt.prompt}</p>
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

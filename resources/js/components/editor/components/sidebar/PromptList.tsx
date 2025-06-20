import { Prompt } from '@/types/prompt';
import React from 'react';

interface PromptListProps {
  prompts: Prompt[];
  selectedPromptId: number | null;
  onSelectPrompt: (promptId: number) => void;
}

export default React.memo(function PromptList({ prompts, selectedPromptId, onSelectPrompt }: PromptListProps) {
  if (prompts.length === 0) {
    return <p className="text-center text-xs text-gray-500">No prompts in this category</p>;
  }

  return (
    <div className="space-y-2 overflow-y-auto">
      {prompts.map((prompt) => (
        <button
          key={prompt.id}
          onClick={() => onSelectPrompt(prompt.id)}
          className={`w-full rounded-md border p-2 text-left transition-colors ${
            selectedPromptId === prompt.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center space-x-2">
            {prompt.example_image_url && <img src={prompt.example_image_url} alt={prompt.name} className="h-12 w-12 rounded object-cover" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-gray-900">{prompt.name}</p>
              <p className="truncate text-xs text-gray-500">{prompt.category?.name}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
});

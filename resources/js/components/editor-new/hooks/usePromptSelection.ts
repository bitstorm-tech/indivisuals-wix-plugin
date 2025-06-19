import { Prompt } from '@/types/prompt';
import { useMemo, useState } from 'react';

interface UsePromptSelectionReturn {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  filteredPrompts: Prompt[];
  categories: string[];
}

export function usePromptSelection(prompts: Prompt[]): UsePromptSelectionReturn {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    prompts.forEach((prompt) => {
      if (prompt.category) {
        uniqueCategories.add(prompt.category);
      }
    });
    return ['all', ...Array.from(uniqueCategories).sort()];
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    if (selectedCategory === 'all') {
      return prompts;
    }
    return prompts.filter((prompt) => prompt.category === selectedCategory);
  }, [prompts, selectedCategory]);

  return {
    selectedCategory,
    setSelectedCategory,
    filteredPrompts,
    categories,
  };
}

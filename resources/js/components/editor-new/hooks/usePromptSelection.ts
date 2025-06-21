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
      if (prompt.subcategory) {
        uniqueCategories.add(prompt.subcategory.name);
      } else if (prompt.category) {
        uniqueCategories.add(prompt.category.name);
      }
    });

    return ['all', ...Array.from(uniqueCategories).sort()];
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    if (selectedCategory === 'all') {
      return prompts;
    }
    return prompts.filter((prompt) => {
      // Check both subcategory and category for matches
      const promptCategory = prompt.subcategory?.name || prompt.category?.name;
      return promptCategory === selectedCategory;
    });
  }, [prompts, selectedCategory]);

  return {
    selectedCategory,
    setSelectedCategory,
    filteredPrompts,
    categories,
  };
}

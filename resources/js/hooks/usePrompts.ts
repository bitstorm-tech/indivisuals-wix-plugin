import { apiFetch } from '@/lib/utils';
import { Prompt } from '@/types/prompt';
import { useEffect, useMemo, useState } from 'react';

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    apiFetch('/prompts', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch prompts');
        }
        return response.json();
      })
      .then((data) => {
        setPrompts(data);
        setIsLoading(false);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setError(error.message);
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(prompts.map((p) => p.category?.name).filter((name): name is string => !!name))).sort();
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    return prompts.filter((p) => {
      const hasImage = p.example_image_url;
      const matchesCategory = selectedCategory === 'all' || p.category?.name === selectedCategory;
      return hasImage && matchesCategory;
    });
  }, [prompts, selectedCategory]);

  const selectedPrompt = useMemo(() => {
    return prompts.find((p) => p.id === selectedPromptId);
  }, [prompts, selectedPromptId]);

  return {
    prompts,
    filteredPrompts,
    categories,
    selectedPromptId,
    selectedPrompt,
    selectedCategory,
    isLoading,
    error,
    setSelectedPromptId,
    setSelectedCategory,
  };
}

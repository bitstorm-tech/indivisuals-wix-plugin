import { MugOption } from '@/components/editor/types';
import { apiFetch } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface MugApiResponse {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  filling_quantity?: string;
  description_short?: string;
  description_long?: string;
  height_mm?: number;
  diameter_mm?: number;
  print_template_width_mm?: number;
  print_template_height_mm?: number;
  dishwasher_safe?: boolean;
  category?: {
    id: number;
    name: string;
  };
  subcategory?: {
    id: number;
    name: string;
  };
}

export function useMugs(): {
  mugs: MugOption[];
  isLoading: boolean;
  error: string | null;
} {
  const [mugs, setMugs] = useState<MugOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    apiFetch('/api/mugs', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch mugs');
        }
        return response.json();
      })
      .then((data: MugApiResponse[]) => {
        // Map the API response to match MugOption interface
        const mappedMugs = data.map((mug) => {
          // Determine special tag based on mug name or category
          let special: string | undefined;
          if (mug.name.toLowerCase().includes('color changing')) {
            special = 'Heat Reactive';
          } else if (mug.name.toLowerCase().includes('travel')) {
            special = 'Insulated';
          }

          return {
            id: mug.id,
            name: mug.name,
            price: mug.price,
            image: mug.image_url || '/images/mugs/placeholder.jpg',
            capacity: mug.filling_quantity || (mug.name.toLowerCase().includes('travel') ? '16oz' : '11oz'),
            special,
            description_short: mug.description_short,
            description_long: mug.description_long,
            height_mm: mug.height_mm,
            diameter_mm: mug.diameter_mm,
            print_template_width_mm: mug.print_template_width_mm,
            print_template_height_mm: mug.print_template_height_mm,
            filling_quantity: mug.filling_quantity,
            dishwasher_safe: mug.dishwasher_safe,
          };
        });
        setMugs(mappedMugs);
        setIsLoading(false);
      })
      .catch((error: Error) => {
        if (error.name !== 'AbortError') {
          setError(error.message);
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  return {
    mugs,
    isLoading,
    error,
  };
}

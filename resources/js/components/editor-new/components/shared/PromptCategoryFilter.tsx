import { Label } from '@/components/ui/Label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PromptCategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function PromptCategoryFilter({ categories, selectedCategory, onCategoryChange }: PromptCategoryFilterProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Filter by Category</Label>
      <RadioGroup value={selectedCategory} onValueChange={onCategoryChange} className="flex flex-wrap gap-4">
        {categories.map((category) => (
          <div key={category} className="flex items-center space-x-2">
            <RadioGroupItem value={category} id={`category-${category}`} />
            <Label htmlFor={`category-${category}`} className="cursor-pointer text-sm font-normal capitalize">
              {category === 'all' ? 'All Styles' : category}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

interface PromptTableHeaderProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onNewPrompt: () => void;
}

export default function PromptTableHeader({ categories, selectedCategory, onCategoryChange, onNewPrompt }: PromptTableHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <Button onClick={onNewPrompt}>New Prompt</Button>
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Filter by Category:</label>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

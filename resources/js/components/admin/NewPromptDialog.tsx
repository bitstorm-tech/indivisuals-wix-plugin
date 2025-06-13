import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useEffect, useState } from 'react';

interface NewPromptData {
  name: string;
  category: string;
  prompt: string;
  active: boolean;
}

interface NewPromptDialogProps {
  isOpen: boolean;
  newPrompt: NewPromptData;
  categories: string[];
  onSave: () => void;
  onCancel: () => void;
  onInputChange: (field: keyof NewPromptData, value: string | boolean) => void;
}

export default function NewPromptDialog({ isOpen, newPrompt, categories, onSave, onCancel, onInputChange }: NewPromptDialogProps) {
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setUseCustomCategory(false);
      setCustomCategory('');
    }
  }, [isOpen]);

  const isFormValid = newPrompt.name && newPrompt.category && newPrompt.prompt;

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="min-w-1/3">
        <DialogHeader>
          <DialogTitle>Create New Prompt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input type="text" value={newPrompt.name} onChange={(e) => onInputChange('name', e.target.value)} placeholder="Enter prompt name" />
          </div>
          <div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useCustomCategory"
                  checked={useCustomCategory}
                  onCheckedChange={(checked) => {
                    setUseCustomCategory(checked as boolean);
                    if (checked) {
                      onInputChange('category', customCategory);
                    } else {
                      onInputChange('category', '');
                      setCustomCategory('');
                    }
                  }}
                />
                <label htmlFor="useCustomCategory" className="text-sm">
                  Create new category
                </label>
              </div>

              {useCustomCategory ? (
                <Input
                  type="text"
                  value={customCategory}
                  onChange={(e) => {
                    setCustomCategory(e.target.value);
                    onInputChange('category', e.target.value);
                  }}
                  placeholder="Enter new category name"
                />
              ) : (
                <Select value={newPrompt.category} onValueChange={(value) => onInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Prompt</label>
            <Textarea
              rows={4}
              value={newPrompt.prompt}
              onChange={(e) => onInputChange('prompt', e.target.value)}
              placeholder="Enter the prompt text"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="active" checked={newPrompt.active} onCheckedChange={(checked) => onInputChange('active', checked as boolean)} />
            <label htmlFor="active" className="text-sm font-medium">
              Active
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={!isFormValid}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

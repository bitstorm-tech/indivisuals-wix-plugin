import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useEffect, useRef, useState } from 'react';

interface NewPromptData {
  name: string;
  category: string;
  prompt: string;
  active: boolean;
  example_image?: File | null;
}

interface NewPromptDialogProps {
  isOpen: boolean;
  newPrompt: NewPromptData;
  categories: string[];
  onSave: () => void;
  onCancel: () => void;
  onInputChange: (field: keyof NewPromptData, value: string | boolean | File | null) => void;
}

export default function NewPromptDialog({ isOpen, newPrompt, categories, onSave, onCancel, onInputChange }: NewPromptDialogProps) {
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setUseCustomCategory(false);
      setCustomCategory('');
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onInputChange('example_image' as keyof NewPromptData, file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      onInputChange('example_image' as keyof NewPromptData, null);
      setImagePreview(null);
    }
  };

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
          <div>
            <label className="text-sm font-medium">Example Image</label>
            <div className="mt-1 space-y-2">
              <Input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
              {imagePreview && (
                <div className="relative h-32 w-32">
                  <img src={imagePreview} alt="Preview" className="h-full w-full rounded object-cover" />
                </div>
              )}
            </div>
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

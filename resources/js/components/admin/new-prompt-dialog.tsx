import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface NewPromptData {
  name: string;
  category: string;
  prompt: string;
}

interface NewPromptDialogProps {
  isOpen: boolean;
  newPrompt: NewPromptData;
  categories: string[];
  onSave: () => void;
  onCancel: () => void;
  onInputChange: (field: keyof NewPromptData, value: string) => void;
}

export default function NewPromptDialog({ isOpen, newPrompt, categories, onSave, onCancel, onInputChange }: NewPromptDialogProps) {
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
            <label className="text-sm font-medium">Category</label>
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

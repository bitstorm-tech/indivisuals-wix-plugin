import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface Prompt {
  id: number;
  name: string;
  category: string;
  prompt: string;
  active: boolean;
  has_example_image?: boolean;
}

interface NewOrEditPromptDialogProps {
  isOpen: boolean;
  editingPrompt?: Prompt;
  categories: string[];
  onClose: () => void;
}

export default function NewOrEditPromptDialog({ isOpen, editingPrompt, categories, onClose }: NewOrEditPromptDialogProps) {
  const form = useForm<{
    name: string;
    category: string;
    prompt: string;
    active: boolean;
    example_image: File | null;
  }>({
    name: '',
    category: '',
    prompt: '',
    active: true,
    example_image: null,
  });
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
      form.reset();
    } else {
      // Initialize form data based on whether we're editing or creating
      if (editingPrompt) {
        form.setData({
          name: editingPrompt.name,
          category: editingPrompt.category,
          prompt: editingPrompt.prompt,
          active: editingPrompt.active,
          example_image: null,
        });
        if (editingPrompt.has_example_image) {
          setImagePreview(`/prompts/${editingPrompt.id}/example-image`);
        }
      } else {
        form.reset();
        form.setData({
          name: '',
          category: '',
          prompt: '',
          active: true,
          example_image: null,
        });
      }
    }
  }, [isOpen, editingPrompt]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setData('example_image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setData('example_image', null);
      setImagePreview(null);
    }
  };

  const handleSave = () => {
    if (!form.data.name || !form.data.category || !form.data.prompt) {
      return;
    }

    // Debug: Log form data before submission
    console.log('Form data before save:', {
      data: form.data,
      hasFile: !!form.data.example_image,
      fileName: form.data.example_image?.name,
      fileSize: form.data.example_image?.size,
    });

    if (editingPrompt) {
      // Update existing prompt - use router.post with method spoofing for file uploads
      const formData = {
        ...form.data,
        _method: 'put',
      };

      router.post(`/prompts/${editingPrompt.id}`, formData, {
        forceFormData: true, // Always use FormData for updates to handle file uploads properly
        preserveScroll: true,
        onSuccess: () => {
          onClose();
          form.reset();
        },
        onError: (errors) => {
          console.error('Update validation errors:', errors);
          // The errors are already handled by Inertia and will be available in form.errors
        },
        onProgress: (progress) => {
          // You can track upload progress here if needed
          console.log('Upload progress:', progress);
        },
      });
    } else {
      // Create new prompt
      form.post('/prompts', {
        forceFormData: !!form.data.example_image, // Only use FormData if there's a file
        onSuccess: () => {
          onClose();
          form.reset();
        },
        onError: (errors: Record<string, string>) => {
          console.error('Update validation errors:', errors);
          // Also log the full error response
          console.error('Full error response:', {
            errors: form.errors,
            processing: form.processing,
            progress: form.progress,
          });
        },
      });
    }
  };

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  const isFormValid = form.data.name && form.data.category && form.data.prompt;

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="min-w-1/3">
        <DialogHeader>
          <DialogTitle>{editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input type="text" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="Enter prompt name" />
            {form.errors.name && <p className="mt-1 text-sm text-red-500">{form.errors.name}</p>}
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
                      form.setData('category', customCategory);
                    } else {
                      form.setData('category', '');
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
                    form.setData('category', e.target.value);
                  }}
                  placeholder="Enter new category name"
                />
              ) : (
                <Select value={form.data.category} onValueChange={(value) => form.setData('category', value)}>
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
              value={form.data.prompt}
              onChange={(e) => form.setData('prompt', e.target.value)}
              placeholder="Enter the prompt text"
            />
            {form.errors.prompt && <p className="mt-1 text-sm text-red-500">{form.errors.prompt}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Example Image</label>
            <div className="mt-1 space-y-2">
              <Input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
              {imagePreview && (
                <div className="relative h-32 w-32">
                  <img src={imagePreview} alt="Preview" className="h-full w-full rounded object-cover" />
                  {editingPrompt && editingPrompt.has_example_image && <p className="mt-1 text-xs text-gray-500">Current image</p>}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="active" checked={form.data.active} onCheckedChange={(checked) => form.setData('active', checked as boolean)} />
            <label htmlFor="active" className="text-sm font-medium">
              Active
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isFormValid || form.processing}>
            {form.processing ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

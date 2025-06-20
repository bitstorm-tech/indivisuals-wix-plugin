import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useImageCrop } from '@/hooks/useImageCrop';
import { Prompt, PromptCategory, PromptSubCategory } from '@/types/prompt';
import { router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface NewOrEditPromptDialogProps {
  isOpen: boolean;
  editingPrompt?: Prompt;
  categories: PromptCategory[];
  subcategories: PromptSubCategory[];
  onClose: () => void;
}

export default function NewOrEditPromptDialog({ isOpen, editingPrompt, categories, subcategories, onClose }: NewOrEditPromptDialogProps) {
  const form = useForm<{
    name: string;
    category_id: string;
    subcategory_id: string;
    prompt: string;
    active: boolean;
    example_image: File | null;
  }>({
    name: '',
    category_id: '',
    subcategory_id: '',
    prompt: '',
    active: true,
    example_image: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [filteredSubcategories, setFilteredSubcategories] = useState<PromptSubCategory[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { crop, setCrop, completedCrop, setCompletedCrop, imgRef, getCroppedImage, setInitialCrop, resetCrop } = useImageCrop({
    aspectRatio: 16 / 9,
    initialCropPercent: 80,
  });

  useEffect(() => {
    if (!isOpen) {
      setImagePreview(null);
      resetCrop();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      form.reset();
    } else {
      // Initialize form data based on whether we're editing or creating
      if (editingPrompt) {
        form.setData({
          name: editingPrompt.name,
          category_id: editingPrompt.category_id?.toString() || '',
          subcategory_id: editingPrompt.subcategory_id?.toString() || '',
          prompt: editingPrompt.prompt,
          active: editingPrompt.active ?? true,
          example_image: null,
        });
        if (editingPrompt.example_image_url) {
          setImagePreview(editingPrompt.example_image_url);
        }
      } else {
        form.reset();
        form.setData({
          name: '',
          category_id: '',
          subcategory_id: '',
          prompt: '',
          active: true,
          example_image: null,
        });
      }
    }
  }, [isOpen, editingPrompt]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter subcategories based on selected category
  useEffect(() => {
    if (form.data.category_id) {
      const filtered = subcategories.filter((sub) => sub.category_id === parseInt(form.data.category_id));
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
    }
  }, [form.data.category_id, subcategories]);

  const handleImageChange = (e: React.ChangeEvent) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setData('example_image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        resetCrop();
      };
      reader.readAsDataURL(file);
    } else {
      form.setData('example_image', null);
      setImagePreview(null);
      resetCrop();
    }
  };

  const handleSave = async () => {
    if (!form.data.name || !form.data.category_id || !form.data.prompt) {
      return;
    }

    // Prepare form data with cropped image
    const dataToSubmit = { ...form.data };

    // If there's a completed crop and an image, apply the crop
    if (completedCrop && form.data.example_image) {
      try {
        const croppedImage = await getCroppedImage('cropped-image.png', 'image/png');
        if (croppedImage) {
          dataToSubmit.example_image = croppedImage.file;
        }
      } catch (error) {
        console.error('Error cropping image:', error);
      }
    }

    if (editingPrompt) {
      // Update existing prompt - use router.post with method spoofing for file uploads
      const formData = {
        ...dataToSubmit,
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
      router.post('/prompts', dataToSubmit, {
        forceFormData: !!dataToSubmit.example_image, // Only use FormData if there's a file
        preserveScroll: true,
        onSuccess: () => {
          onClose();
          form.reset();
        },
        onError: (errors: Record) => {
          console.error('Create validation errors:', errors);
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

  const isFormValid = form.data.name && form.data.category_id && form.data.prompt;

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
            <label className="text-sm font-medium">Category</label>
            <Select
              value={form.data.category_id}
              onValueChange={(value) => {
                form.setData('category_id', value);
                form.setData('subcategory_id', ''); // Reset subcategory when category changes
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.errors.category_id && <p className="mt-1 text-sm text-red-500">{form.errors.category_id}</p>}
          </div>
          {form.data.category_id && filteredSubcategories.length > 0 && (
            <div>
              <label className="text-sm font-medium">Subcategory (Optional)</label>
              <Select value={form.data.subcategory_id} onValueChange={(value) => form.setData('subcategory_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {filteredSubcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.errors.subcategory_id && <p className="mt-1 text-sm text-red-500">{form.errors.subcategory_id}</p>}
            </div>
          )}
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
            <div className="mt-1 space-y-2">
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                Choose Example Image
              </Button>
              {imagePreview && (
                <div className="space-y-2">
                  {form.data.example_image ? (
                    <>
                      <p className="text-sm text-gray-600">Select the area to crop for 1080p (1920x1080) display:</p>
                      <div className="flex justify-center rounded border p-2">
                        <div className="max-h-64 overflow-hidden">
                          <ReactCrop crop={crop} onChange={(c) => setCrop(c)} onComplete={(c) => setCompletedCrop(c)} aspect={16 / 9} keepSelection>
                            <img
                              ref={imgRef}
                              src={imagePreview}
                              alt="Crop preview"
                              onLoad={(e) => {
                                const img = e.currentTarget;
                                setInitialCrop(img);
                              }}
                              style={{ maxHeight: '256px', width: 'auto' }}
                            />
                          </ReactCrop>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="h-32 w-auto rounded object-cover" style={{ aspectRatio: '16/9' }} />
                    </div>
                  )}
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

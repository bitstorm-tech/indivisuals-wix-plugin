import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useImageCrop } from '@/hooks/useImageCrop';
import { Prompt } from '@/types/prompt';
import { router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

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
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { crop, setCrop, completedCrop, setCompletedCrop, imgRef, getCroppedImage, setInitialCrop, resetCrop } = useImageCrop({
    aspectRatio: 16 / 9,
    initialCropPercent: 80,
  });

  useEffect(() => {
    if (!isOpen) {
      setUseCustomCategory(false);
      setCustomCategory('');
      setImagePreview(null);
      setCroppedFile(null);
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
          category: editingPrompt.category,
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
        setCroppedFile(null);
        resetCrop();
      };
      reader.readAsDataURL(file);
    } else {
      form.setData('example_image', null);
      setImagePreview(null);
      setCroppedFile(null);
      resetCrop();
    }
  };

  const handleCropImage = async () => {
    try {
      const croppedImage = await getCroppedImage('cropped-image.png', 'image/png');
      if (croppedImage) {
        setCroppedFile(croppedImage.file);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  const handleSave = () => {
    if (!form.data.name || !form.data.category || !form.data.prompt) {
      return;
    }

    // Prepare form data with cropped image
    const dataToSubmit = { ...form.data };

    // If we have a cropped file, use it instead of the original
    if (croppedFile) {
      dataToSubmit.example_image = croppedFile;
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
        onError: (errors: Record<string, string>) => {
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
                      <div className="max-h-96 overflow-auto rounded border">
                        <ReactCrop crop={crop} onChange={(c) => setCrop(c)} onComplete={(c) => setCompletedCrop(c)} aspect={16 / 9} keepSelection>
                          <img
                            ref={imgRef}
                            src={imagePreview}
                            alt="Crop preview"
                            onLoad={(e) => {
                              const img = e.currentTarget;
                              setInitialCrop(img);
                            }}
                            style={{ maxWidth: '100%', height: 'auto' }}
                          />
                        </ReactCrop>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <Button type="button" size="sm" onClick={handleCropImage} disabled={!completedCrop}>
                          Apply Crop
                        </Button>
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

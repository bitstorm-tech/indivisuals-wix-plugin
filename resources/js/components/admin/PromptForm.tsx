import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useImageCrop } from '@/hooks/useImageCrop';
import { Prompt, PromptCategory, PromptSubCategory } from '@/types/prompt';
import { router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface PromptFormProps {
  prompt?: Prompt | null;
  categories: PromptCategory[];
  subcategories: PromptSubCategory[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PromptForm({ prompt, categories, subcategories, onSuccess, onCancel }: PromptFormProps) {
  const form = useForm<{
    name: string;
    category_id: string;
    subcategory_id: string;
    prompt: string;
    active: boolean;
    example_image: File | null;
  }>({
    name: prompt?.name || '',
    category_id: prompt?.category_id?.toString() || '',
    subcategory_id: prompt?.subcategory_id?.toString() || '',
    prompt: prompt?.prompt || '',
    active: prompt?.active ?? true,
    example_image: null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(prompt?.example_image_url || null);
  const [filteredSubcategories, setFilteredSubcategories] = useState<PromptSubCategory[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { crop, setCrop, completedCrop, setCompletedCrop, imgRef, getCroppedImage, setInitialCrop, resetCrop } = useImageCrop({
    aspectRatio: 16 / 9,
    initialCropPercent: 80,
  });

  // Filter subcategories based on selected category
  useEffect(() => {
    if (form.data.category_id) {
      const filtered = subcategories.filter((sub) => sub.category_id === parseInt(form.data.category_id));
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
    }
  }, [form.data.category_id, subcategories]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (2MB limit due to PHP upload_max_filesize)
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        alert('Image file size must be less than 2MB. Please choose a smaller image or compress it.');
        e.target.value = ''; // Clear the input
        return;
      }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.data.name || !form.data.category_id || !form.data.prompt) {
      return;
    }

    // If there's a completed crop and an image, apply the crop
    let finalImageFile = form.data.example_image;
    if (completedCrop && form.data.example_image) {
      try {
        const croppedImage = await getCroppedImage('cropped-image.jpg', 'image/jpeg');
        if (croppedImage) {
          finalImageFile = croppedImage.file;
          console.log('Cropped image size:', finalImageFile.size, 'bytes (', (finalImageFile.size / 1024).toFixed(2), 'KB)');

          // Check if the cropped image is too large
          const maxSize = 2 * 1024 * 1024; // 2MB in bytes
          if (finalImageFile.size > maxSize) {
            alert('The cropped image is too large (over 2MB). Please select a smaller area or use a lower quality image.');
            return;
          }
        }
      } catch (error) {
        console.error('Error cropping image:', error);
      }
    }

    // Prepare submission data
    const submissionData = {
      name: form.data.name,
      category_id: form.data.category_id,
      subcategory_id: form.data.subcategory_id,
      prompt: form.data.prompt,
      active: form.data.active ? '1' : '0', // Send as string for FormData
      example_image: finalImageFile,
    };

    // Log for debugging
    console.log('Submitting form:', {
      data: submissionData,
      hasImage: !!submissionData.example_image,
      imageType: submissionData.example_image ? submissionData.example_image.constructor.name : 'no image',
      imageSize: submissionData.example_image ? (submissionData.example_image as File).size : 0,
    });

    if (prompt) {
      // Update existing prompt
      router.post(
        `/api/prompts/${prompt.id}`,
        {
          ...submissionData,
          _method: 'put',
        },
        {
          forceFormData: true, // Always use FormData for file uploads
          preserveScroll: true,
          onSuccess: () => {
            if (onSuccess) {
              onSuccess();
            } else {
              router.visit('/admin/prompts');
            }
          },
          onError: (errors: Record<string, string>) => {
            console.error('Update validation errors:', errors);
          },
          onProgress: (progress) => {
            console.log('Upload progress:', progress);
          },
        },
      );
    } else {
      // Create new prompt
      router.post('/api/prompts', submissionData, {
        forceFormData: true, // Always use FormData for consistent handling
        preserveScroll: true,
        onSuccess: () => {
          if (onSuccess) {
            onSuccess();
          } else {
            router.visit('/admin/prompts');
          }
        },
        onError: (errors: Record<string, string>) => {
          console.error('Create validation errors:', errors);
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
    if (onCancel) {
      onCancel();
    } else {
      router.visit('/admin/prompts');
    }
  };

  const isFormValid = form.data.name && form.data.category_id && form.data.prompt;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
          <label htmlFor="name" className="text-sm font-medium sm:text-right">
            Name
          </label>
          <div className="sm:col-span-3">
            <Input
              id="name"
              type="text"
              value={form.data.name}
              onChange={(e) => form.setData('name', e.target.value)}
              placeholder="Enter prompt name"
              required
            />
            {form.errors.name && <p className="mt-1 text-sm text-red-500">{form.errors.name}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
          <label htmlFor="category" className="text-sm font-medium sm:text-right">
            Category
          </label>
          <div className="sm:col-span-3">
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
        </div>

        {form.data.category_id && filteredSubcategories.length > 0 && (
          <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <label htmlFor="subcategory" className="text-sm font-medium sm:text-right">
              Subcategory (Optional)
            </label>
            <div className="sm:col-span-3">
              <Select value={form.data.subcategory_id} onValueChange={(value) => form.setData('subcategory_id', value === '0' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None</SelectItem>
                  {filteredSubcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.errors.subcategory_id && <p className="mt-1 text-sm text-red-500">{form.errors.subcategory_id}</p>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:gap-4">
          <label htmlFor="prompt" className="text-sm font-medium sm:mt-2 sm:text-right">
            Prompt
          </label>
          <div className="sm:col-span-3">
            <Textarea
              id="prompt"
              rows={4}
              value={form.data.prompt}
              onChange={(e) => form.setData('prompt', e.target.value)}
              placeholder="Enter the prompt text"
              required
            />
            {form.errors.prompt && <p className="mt-1 text-sm text-red-500">{form.errors.prompt}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:gap-4">
          <label htmlFor="example_image" className="text-sm font-medium sm:text-right">
            Example Image
          </label>
          <div className="sm:col-span-3">
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              Choose Example Image
            </Button>
            {imagePreview && (
              <div className="mt-4 space-y-2">
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

        <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
          <label htmlFor="active" className="text-sm font-medium sm:text-right">
            Active
          </label>
          <div className="flex items-center">
            <Checkbox id="active" checked={form.data.active} onCheckedChange={(checked) => form.setData('active', checked as boolean)} />
            <label htmlFor="active" className="ml-2 text-sm">
              Make this prompt available for use
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isFormValid || form.processing}>
          {form.processing ? 'Saving...' : prompt ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}

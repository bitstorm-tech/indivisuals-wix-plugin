import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { useImageCrop } from '@/hooks/useImageCrop';
import { Mug, MugCategory, MugSubCategory } from '@/types/mug';
import { router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface MugFormProps {
  mug?: Mug | null;
  categories: MugCategory[];
  subcategories: MugSubCategory[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function MugForm({ mug, categories, subcategories, onSuccess, onCancel }: MugFormProps) {
  const form = useForm<{
    name: string;
    description_long: string;
    description_short: string;
    height_mm: string;
    diameter_mm: string;
    print_template_width_mm: string;
    print_template_height_mm: string;
    filling_quantity: string;
    dishwasher_safe: boolean;
    price: string;
    category_id: string;
    subcategory_id: string;
    active: boolean;
    image: File | null;
  }>({
    name: mug?.name || '',
    description_long: mug?.description_long || '',
    description_short: mug?.description_short || '',
    height_mm: mug?.height_mm?.toString() || '',
    diameter_mm: mug?.diameter_mm?.toString() || '',
    print_template_width_mm: mug?.print_template_width_mm?.toString() || '',
    print_template_height_mm: mug?.print_template_height_mm?.toString() || '',
    filling_quantity: mug?.filling_quantity || '',
    dishwasher_safe: mug?.dishwasher_safe ?? true,
    price: mug?.price?.toString() || '',
    category_id: mug?.category_id?.toString() || '',
    subcategory_id: mug?.subcategory_id?.toString() || '',
    active: mug?.active ?? true,
    image: null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(mug?.image_url || null);
  const [filteredSubcategories, setFilteredSubcategories] = useState<MugSubCategory[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { crop, setCrop, completedCrop, setCompletedCrop, imgRef, getCroppedImage, setInitialCrop, resetCrop } = useImageCrop({
    aspectRatio: 1, // Square aspect ratio for mugs
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

      form.setData('image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        resetCrop();
      };
      reader.readAsDataURL(file);
    } else {
      form.setData('image', null);
      setImagePreview(null);
      resetCrop();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.data.name || !form.data.price) {
      return;
    }

    // If there's a completed crop and an image, apply the crop
    let finalImageFile = form.data.image;
    if (completedCrop && form.data.image) {
      try {
        const croppedImage = await getCroppedImage('cropped-mug-image.jpg', 'image/jpeg');
        if (croppedImage) {
          finalImageFile = croppedImage.file;
          // Cropped image size: finalImageFile.size bytes

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
      description_long: form.data.description_long,
      description_short: form.data.description_short,
      price: form.data.price,
      active: form.data.active ? '1' : '0',
      dishwasher_safe: form.data.dishwasher_safe ? '1' : '0',
      height_mm: form.data.height_mm,
      diameter_mm: form.data.diameter_mm,
      print_template_width_mm: form.data.print_template_width_mm,
      print_template_height_mm: form.data.print_template_height_mm,
      filling_quantity: form.data.filling_quantity,
      category_id: form.data.category_id,
      subcategory_id: form.data.subcategory_id,
      image: finalImageFile,
    };

    // Form submission data prepared

    if (mug) {
      // Update existing mug
      router.post(
        `/api/mugs/${mug.id}`,
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
              router.visit('/admin/mugs');
            }
          },
          onError: () => {
            // Update validation errors occurred
          },
          onProgress: () => {
            // Upload progress tracking
          },
        },
      );
    } else {
      // Create new mug
      router.post('/api/mugs', submissionData, {
        forceFormData: true, // Always use FormData for consistent handling
        preserveScroll: true,
        onSuccess: () => {
          if (onSuccess) {
            onSuccess();
          } else {
            router.visit('/admin/mugs');
          }
        },
        onError: () => {
          // Create validation errors occurred
        },
      });
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.visit('/admin/mugs');
    }
  };

  const isFormValid = form.data.name && form.data.price;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
          <label htmlFor="name" className="text-sm font-medium sm:text-right">
            Name
          </label>
          <div className="sm:col-span-3">
            <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required />
            {form.errors.name && <p className="mt-1 text-sm text-red-500">{form.errors.name}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:gap-4">
          <label htmlFor="description_short" className="text-sm font-medium sm:mt-2 sm:text-right">
            Short Description
          </label>
          <div className="sm:col-span-3">
            <Textarea
              id="description_short"
              value={form.data.description_short}
              onChange={(e) => form.setData('description_short', e.target.value)}
              rows={2}
              placeholder="Brief description for listings"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:gap-4">
          <label htmlFor="description_long" className="text-sm font-medium sm:mt-2 sm:text-right">
            Long Description
          </label>
          <div className="sm:col-span-3">
            <Textarea
              id="description_long"
              value={form.data.description_long}
              onChange={(e) => form.setData('description_long', e.target.value)}
              rows={4}
              placeholder="Detailed product description"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
          <label htmlFor="price" className="text-sm font-medium sm:text-right">
            Price
          </label>
          <div className="sm:col-span-3">
            <Input id="price" type="number" step="0.01" value={form.data.price} onChange={(e) => form.setData('price', e.target.value)} required />
            {form.errors.price && <p className="mt-1 text-sm text-red-500">{form.errors.price}</p>}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:mt-6 sm:grid-cols-4 sm:gap-4">
          <div className="sm:col-span-3 sm:col-start-2">
            <h3 className="text-base font-semibold">Dimensions</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
          <label htmlFor="height_mm" className="text-sm font-medium sm:text-right">
            Height (mm)
          </label>
          <div className="sm:col-span-3">
            <Input
              id="height_mm"
              type="number"
              value={form.data.height_mm}
              onChange={(e) => form.setData('height_mm', e.target.value)}
              placeholder="e.g., 95"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
          <label htmlFor="diameter_mm" className="text-sm font-medium sm:text-right">
            Diameter (mm)
          </label>
          <div className="sm:col-span-3">
            <Input
              id="diameter_mm"
              type="number"
              value={form.data.diameter_mm}
              onChange={(e) => form.setData('diameter_mm', e.target.value)}
              placeholder="e.g., 82"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
          <label htmlFor="print_template_width_mm" className="text-sm font-medium sm:text-right">
            Print Width (mm)
          </label>
          <div className="sm:col-span-3">
            <Input
              id="print_template_width_mm"
              type="number"
              value={form.data.print_template_width_mm}
              onChange={(e) => form.setData('print_template_width_mm', e.target.value)}
              placeholder="Template width"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
          <label htmlFor="print_template_height_mm" className="text-sm font-medium sm:text-right">
            Print Height (mm)
          </label>
          <div className="sm:col-span-3">
            <Input
              id="print_template_height_mm"
              type="number"
              value={form.data.print_template_height_mm}
              onChange={(e) => form.setData('print_template_height_mm', e.target.value)}
              placeholder="Template height"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:mt-6 sm:grid-cols-4 sm:gap-4">
          <div className="sm:col-span-3 sm:col-start-2">
            <h3 className="text-base font-semibold">Specifications</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
          <label htmlFor="filling_quantity" className="text-sm font-medium sm:text-right">
            Filling Quantity
          </label>
          <div className="sm:col-span-3">
            <Input
              id="filling_quantity"
              value={form.data.filling_quantity}
              onChange={(e) => form.setData('filling_quantity', e.target.value)}
              placeholder="e.g., 325ml"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
          <label htmlFor="dishwasher_safe" className="text-sm font-medium sm:text-right">
            Dishwasher Safe
          </label>
          <div className="flex items-center">
            <Switch
              id="dishwasher_safe"
              checked={form.data.dishwasher_safe}
              onCheckedChange={(checked) => form.setData('dishwasher_safe', checked)}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:mt-6 sm:grid-cols-4 sm:gap-4">
          <div className="sm:col-span-3 sm:col-start-2">
            <h3 className="text-base font-semibold">Categories</h3>
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
          </div>
        </div>
        {form.data.category_id && filteredSubcategories.length > 0 && (
          <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <label htmlFor="subcategory" className="text-sm font-medium sm:text-right">
              Subcategory
            </label>
            <div className="sm:col-span-3">
              <Select value={form.data.subcategory_id} onValueChange={(value) => form.setData('subcategory_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
          <label htmlFor="image" className="text-sm font-medium sm:text-right">
            Image
          </label>
          <div className="sm:col-span-3">
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              Choose Mug Image
            </Button>
            {imagePreview && (
              <div className="mt-4 space-y-2">
                {form.data.image ? (
                  <>
                    <p className="text-sm text-gray-600">Select the area to crop for a square image:</p>
                    <div className="flex justify-center rounded border p-2">
                      <div className="max-h-64 overflow-hidden">
                        <ReactCrop crop={crop} onChange={(c) => setCrop(c)} onComplete={(c) => setCompletedCrop(c)} aspect={1} keepSelection>
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
                    <img src={imagePreview} alt="Preview" className="h-32 w-32 rounded object-cover" />
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
            <Switch id="active" checked={form.data.active} onCheckedChange={(checked) => form.setData('active', checked)} />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isFormValid || form.processing}>
          {form.processing ? 'Saving...' : mug ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}

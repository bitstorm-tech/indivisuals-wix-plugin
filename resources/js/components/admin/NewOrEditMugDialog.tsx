import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { useImageCrop } from '@/hooks/useImageCrop';
import { Mug, MugCategory, MugSubCategory } from '@/types/mug';
import { router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface NewOrEditMugDialogProps {
  isOpen: boolean;
  editingMug?: Mug;
  categories: MugCategory[];
  subcategories: MugSubCategory[];
  onClose: () => void;
}

export default function NewOrEditMugDialog({ isOpen, editingMug, categories, subcategories, onClose }: NewOrEditMugDialogProps) {
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
    name: '',
    description_long: '',
    description_short: '',
    height_mm: '',
    diameter_mm: '',
    print_template_width_mm: '',
    print_template_height_mm: '',
    filling_quantity: '',
    dishwasher_safe: true,
    price: '',
    category_id: '',
    subcategory_id: '',
    active: true,
    image: null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [filteredSubcategories, setFilteredSubcategories] = useState<MugSubCategory[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { crop, setCrop, completedCrop, setCompletedCrop, imgRef, getCroppedImage, setInitialCrop, resetCrop } = useImageCrop({
    aspectRatio: 1, // Square aspect ratio for mugs
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
      if (editingMug) {
        form.setData({
          name: editingMug.name,
          description_long: editingMug.description_long || '',
          description_short: editingMug.description_short || '',
          height_mm: editingMug.height_mm?.toString() || '',
          diameter_mm: editingMug.diameter_mm?.toString() || '',
          print_template_width_mm: editingMug.print_template_width_mm?.toString() || '',
          print_template_height_mm: editingMug.print_template_height_mm?.toString() || '',
          filling_quantity: editingMug.filling_quantity || '',
          dishwasher_safe: editingMug.dishwasher_safe,
          price: editingMug.price.toString(),
          category_id: editingMug.category_id?.toString() || '',
          subcategory_id: editingMug.subcategory_id?.toString() || '',
          active: editingMug.active,
          image: null,
        });
        if (editingMug.image_url) {
          setImagePreview(editingMug.image_url);
        }
      } else {
        form.reset();
        form.setData({
          name: '',
          description_long: '',
          description_short: '',
          height_mm: '',
          diameter_mm: '',
          print_template_width_mm: '',
          print_template_height_mm: '',
          filling_quantity: '',
          dishwasher_safe: true,
          price: '',
          category_id: '',
          subcategory_id: '',
          active: true,
          image: null,
        });
      }
    }
  }, [isOpen, editingMug]); // eslint-disable-line react-hooks/exhaustive-deps

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

    // Log for debugging
    console.log('Submitting form:', {
      data: submissionData,
      hasImage: !!submissionData.image,
      imageType: submissionData.image ? submissionData.image.constructor.name : 'no image',
      imageSize: submissionData.image ? (submissionData.image as File).size : 0,
    });

    if (editingMug) {
      // Update existing mug
      router.post(
        `/api/mugs/${editingMug.id}`,
        {
          ...submissionData,
          _method: 'put',
        },
        {
          forceFormData: true, // Always use FormData for file uploads
          preserveScroll: true,
          onSuccess: () => {
            onClose();
            form.reset();
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
      // Create new mug
      router.post('/api/mugs', submissionData, {
        forceFormData: true, // Always use FormData for consistent handling
        preserveScroll: true,
        onSuccess: () => {
          onClose();
          form.reset();
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
    form.reset();
    onClose();
  };

  const isFormValid = form.data.name && form.data.price;

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-y-auto sm:max-w-lg md:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editingMug ? 'Edit Mug' : 'New Mug'}</DialogTitle>
            <DialogDescription>{editingMug ? 'Update the mug details below.' : 'Create a new mug for your catalog.'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
              <Label htmlFor="name" className="sm:text-right">
                Name
              </Label>
              <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className="sm:col-span-3" required />
              {form.errors.name && <p className="mt-1 text-sm text-red-500 sm:col-span-3 sm:col-start-2">{form.errors.name}</p>}
            </div>
            <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:gap-4">
              <Label htmlFor="description_short" className="sm:mt-2 sm:text-right">
                Short Description
              </Label>
              <Textarea
                id="description_short"
                value={form.data.description_short}
                onChange={(e) => form.setData('description_short', e.target.value)}
                className="sm:col-span-3"
                rows={2}
                placeholder="Brief description for listings"
              />
            </div>
            <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:gap-4">
              <Label htmlFor="description_long" className="sm:mt-2 sm:text-right">
                Long Description
              </Label>
              <Textarea
                id="description_long"
                value={form.data.description_long}
                onChange={(e) => form.setData('description_long', e.target.value)}
                className="sm:col-span-3"
                rows={4}
                placeholder="Detailed product description"
              />
            </div>
            <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
              <Label htmlFor="price" className="sm:text-right">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={form.data.price}
                onChange={(e) => form.setData('price', e.target.value)}
                className="sm:col-span-3"
                required
              />
              {form.errors.price && <p className="mt-1 text-sm text-red-500 sm:col-span-3 sm:col-start-2">{form.errors.price}</p>}
            </div>

            <div className="col-span-full mt-2 sm:mt-4">
              <h3 className="mb-2 text-base font-semibold sm:mb-3 sm:text-lg">Dimensions</h3>
            </div>
            <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
              <Label htmlFor="height_mm" className="sm:text-right">
                Height (mm)
              </Label>
              <Input
                id="height_mm"
                type="number"
                value={form.data.height_mm}
                onChange={(e) => form.setData('height_mm', e.target.value)}
                className="sm:col-span-3"
                placeholder="e.g., 95"
              />
            </div>
            <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
              <Label htmlFor="diameter_mm" className="sm:text-right">
                Diameter (mm)
              </Label>
              <Input
                id="diameter_mm"
                type="number"
                value={form.data.diameter_mm}
                onChange={(e) => form.setData('diameter_mm', e.target.value)}
                className="sm:col-span-3"
                placeholder="e.g., 82"
              />
            </div>
            <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
              <Label htmlFor="print_template_width_mm" className="sm:text-right">
                Print Width (mm)
              </Label>
              <Input
                id="print_template_width_mm"
                type="number"
                value={form.data.print_template_width_mm}
                onChange={(e) => form.setData('print_template_width_mm', e.target.value)}
                className="sm:col-span-3"
                placeholder="Template width"
              />
            </div>
            <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
              <Label htmlFor="print_template_height_mm" className="sm:text-right">
                Print Height (mm)
              </Label>
              <Input
                id="print_template_height_mm"
                type="number"
                value={form.data.print_template_height_mm}
                onChange={(e) => form.setData('print_template_height_mm', e.target.value)}
                className="sm:col-span-3"
                placeholder="Template height"
              />
            </div>

            <div className="col-span-full mt-2 sm:mt-4">
              <h3 className="mb-2 text-base font-semibold sm:mb-3 sm:text-lg">Specifications</h3>
            </div>
            <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
              <Label htmlFor="filling_quantity" className="sm:text-right">
                Filling Quantity
              </Label>
              <Input
                id="filling_quantity"
                value={form.data.filling_quantity}
                onChange={(e) => form.setData('filling_quantity', e.target.value)}
                className="sm:col-span-3"
                placeholder="e.g., 325ml"
              />
            </div>
            <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
              <Label htmlFor="dishwasher_safe" className="sm:text-right">
                Dishwasher Safe
              </Label>
              <div className="flex items-center">
                <Switch
                  id="dishwasher_safe"
                  checked={form.data.dishwasher_safe}
                  onCheckedChange={(checked) => form.setData('dishwasher_safe', checked)}
                />
              </div>
            </div>

            <div className="col-span-full mt-2 sm:mt-4">
              <h3 className="mb-2 text-base font-semibold sm:mb-3 sm:text-lg">Categories</h3>
            </div>
            <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
              <Label htmlFor="category" className="sm:text-right">
                Category
              </Label>
              <Select
                value={form.data.category_id}
                onValueChange={(value) => {
                  form.setData('category_id', value);
                  form.setData('subcategory_id', ''); // Reset subcategory when category changes
                }}
              >
                <SelectTrigger className="sm:col-span-3">
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
            {form.data.category_id && filteredSubcategories.length > 0 && (
              <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
                <Label htmlFor="subcategory" className="sm:text-right">
                  Subcategory
                </Label>
                <Select value={form.data.subcategory_id} onValueChange={(value) => form.setData('subcategory_id', value)}>
                  <SelectTrigger className="sm:col-span-3">
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
            )}
            <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
              <Label htmlFor="image" className="sm:text-right">
                Image
              </Label>
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
              <Label htmlFor="active" className="sm:text-right">
                Active
              </Label>
              <div className="flex items-center">
                <Switch id="active" checked={form.data.active} onCheckedChange={(checked) => form.setData('active', checked)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid || form.processing}>
              {form.processing ? 'Saving...' : editingMug ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Textarea } from '@/components/ui/Textarea';
import { Head, router } from '@inertiajs/react';
import { Edit, Image, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface MugCategory {
  id: number;
  name: string;
}

interface MugSubCategory {
  id: number;
  name: string;
  category_id: number;
}

interface Mug {
  id: number;
  name: string;
  description_long?: string;
  description_short?: string;
  height_mm?: number;
  diameter_mm?: number;
  print_template_width_mm?: number;
  print_template_height_mm?: number;
  filling_quantity?: string;
  dishwasher_safe: boolean;
  price: number;
  category_id?: number;
  subcategory_id?: number;
  image_path?: string;
  image_url?: string;
  active: boolean;
  category?: MugCategory;
  subcategory?: MugSubCategory;
  created_at: string;
  updated_at: string;
}

interface MugsProps {
  mugs: Mug[];
  categories: MugCategory[];
  subcategories: MugSubCategory[];
  auth: {
    user: User;
  };
}

export default function Mugs({ mugs, categories, subcategories, auth }: MugsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMug, setEditingMug] = useState<Mug | null>(null);
  const [formData, setFormData] = useState({
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
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filteredSubcategories = formData.category_id ? subcategories.filter((sub) => sub.category_id === parseInt(formData.category_id)) : [];

  const handleOpenDialog = (mug?: Mug) => {
    if (mug) {
      setEditingMug(mug);
      setFormData({
        name: mug.name,
        description_long: mug.description_long || '',
        description_short: mug.description_short || '',
        height_mm: mug.height_mm?.toString() || '',
        diameter_mm: mug.diameter_mm?.toString() || '',
        print_template_width_mm: mug.print_template_width_mm?.toString() || '',
        print_template_height_mm: mug.print_template_height_mm?.toString() || '',
        filling_quantity: mug.filling_quantity || '',
        dishwasher_safe: mug.dishwasher_safe,
        price: mug.price.toString(),
        category_id: mug.category_id?.toString() || '',
        subcategory_id: mug.subcategory_id?.toString() || '',
        active: mug.active,
      });
    } else {
      setEditingMug(null);
      setFormData({
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
      });
    }
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMug(null);
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description_long', formData.description_long);
    data.append('description_short', formData.description_short);
    data.append('price', formData.price);
    data.append('active', formData.active ? '1' : '0');
    data.append('dishwasher_safe', formData.dishwasher_safe ? '1' : '0');

    if (formData.height_mm) {
      data.append('height_mm', formData.height_mm);
    }
    if (formData.diameter_mm) {
      data.append('diameter_mm', formData.diameter_mm);
    }
    if (formData.print_template_width_mm) {
      data.append('print_template_width_mm', formData.print_template_width_mm);
    }
    if (formData.print_template_height_mm) {
      data.append('print_template_height_mm', formData.print_template_height_mm);
    }
    if (formData.filling_quantity) {
      data.append('filling_quantity', formData.filling_quantity);
    }
    if (formData.category_id) {
      data.append('category_id', formData.category_id);
    }
    if (formData.subcategory_id) {
      data.append('subcategory_id', formData.subcategory_id);
    }
    if (selectedFile) {
      data.append('image', selectedFile);
    }

    if (editingMug) {
      data.append('_method', 'PUT');
      router.post(`/mugs/${editingMug.id}`, data, {
        forceFormData: true,
        onSuccess: handleCloseDialog,
      });
    } else {
      router.post('/mugs', data, {
        forceFormData: true,
        onSuccess: handleCloseDialog,
      });
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteId(id);
    setIsDeleting(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      router.delete(`/api/mugs/${deleteId}`, {
        onSuccess: () => {
          setIsDeleting(false);
          setDeleteId(null);
        },
      });
    }
  };

  const cancelDelete = () => {
    setIsDeleting(false);
    setDeleteId(null);
  };

  const handleToggleStatus = (mug: Mug) => {
    router.put(`/mugs/${mug.id}`, {
      name: mug.name,
      description_long: mug.description_long || '',
      description_short: mug.description_short || '',
      height_mm: mug.height_mm,
      diameter_mm: mug.diameter_mm,
      print_template_width_mm: mug.print_template_width_mm,
      print_template_height_mm: mug.print_template_height_mm,
      filling_quantity: mug.filling_quantity || '',
      dishwasher_safe: mug.dishwasher_safe,
      price: mug.price,
      category_id: mug.category_id,
      subcategory_id: mug.subcategory_id,
      active: !mug.active,
    });
  };

  return (
    <>
      <Head title="Admin - Mugs" />
      <div className="flex h-screen">
        <AdminSidebar user={auth.user} />

        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold">Mugs</h1>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                New Mug
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Dimensions</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mugs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-500">
                        No mugs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    mugs.map((mug) => (
                      <TableRow key={mug.id}>
                        <TableCell>
                          {mug.image_url ? (
                            <img src={mug.image_url} alt={mug.name} className="h-12 w-12 rounded object-cover" />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100">
                              <Image className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{mug.name}</TableCell>
                        <TableCell>
                          {mug.category?.name || '-'}
                          {mug.subcategory && <span className="text-sm text-gray-500"> / {mug.subcategory.name}</span>}
                        </TableCell>
                        <TableCell>{mug.height_mm && mug.diameter_mm ? `${mug.height_mm}×${mug.diameter_mm}mm` : '-'}</TableCell>
                        <TableCell>${mug.price}</TableCell>
                        <TableCell>
                          <Switch checked={mug.active} onCheckedChange={() => handleToggleStatus(mug)} />
                        </TableCell>
                        <TableCell>{new Date(mug.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(mug)} className="mr-2">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(mug.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-2xl">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingMug ? 'Edit Mug' : 'New Mug'}</DialogTitle>
                    <DialogDescription>{editingMug ? 'Update the mug details below.' : 'Create a new mug for your catalog.'}</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="description_short" className="mt-2 text-right">
                        Short Description
                      </Label>
                      <Textarea
                        id="description_short"
                        value={formData.description_short}
                        onChange={(e) => setFormData({ ...formData, description_short: e.target.value })}
                        className="col-span-3"
                        rows={2}
                        placeholder="Brief description for listings"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="description_long" className="mt-2 text-right">
                        Long Description
                      </Label>
                      <Textarea
                        id="description_long"
                        value={formData.description_long}
                        onChange={(e) => setFormData({ ...formData, description_long: e.target.value })}
                        className="col-span-3"
                        rows={4}
                        placeholder="Detailed product description"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">
                        Price
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="col-span-3"
                        required
                      />
                    </div>

                    <div className="col-span-full mt-4">
                      <h3 className="mb-3 text-lg font-semibold">Dimensions</h3>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="height_mm" className="text-right">
                        Height (mm)
                      </Label>
                      <Input
                        id="height_mm"
                        type="number"
                        value={formData.height_mm}
                        onChange={(e) => setFormData({ ...formData, height_mm: e.target.value })}
                        className="col-span-3"
                        placeholder="e.g., 95"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="diameter_mm" className="text-right">
                        Diameter (mm)
                      </Label>
                      <Input
                        id="diameter_mm"
                        type="number"
                        value={formData.diameter_mm}
                        onChange={(e) => setFormData({ ...formData, diameter_mm: e.target.value })}
                        className="col-span-3"
                        placeholder="e.g., 82"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="print_template_width_mm" className="text-right">
                        Print Width (mm)
                      </Label>
                      <Input
                        id="print_template_width_mm"
                        type="number"
                        value={formData.print_template_width_mm}
                        onChange={(e) => setFormData({ ...formData, print_template_width_mm: e.target.value })}
                        className="col-span-3"
                        placeholder="Template width"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="print_template_height_mm" className="text-right">
                        Print Height (mm)
                      </Label>
                      <Input
                        id="print_template_height_mm"
                        type="number"
                        value={formData.print_template_height_mm}
                        onChange={(e) => setFormData({ ...formData, print_template_height_mm: e.target.value })}
                        className="col-span-3"
                        placeholder="Template height"
                      />
                    </div>

                    <div className="col-span-full mt-4">
                      <h3 className="mb-3 text-lg font-semibold">Specifications</h3>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="filling_quantity" className="text-right">
                        Filling Quantity
                      </Label>
                      <Input
                        id="filling_quantity"
                        value={formData.filling_quantity}
                        onChange={(e) => setFormData({ ...formData, filling_quantity: e.target.value })}
                        className="col-span-3"
                        placeholder="e.g., 325ml"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="dishwasher_safe" className="text-right">
                        Dishwasher Safe
                      </Label>
                      <Switch
                        id="dishwasher_safe"
                        checked={formData.dishwasher_safe}
                        onCheckedChange={(checked) => setFormData({ ...formData, dishwasher_safe: checked })}
                      />
                    </div>

                    <div className="col-span-full mt-4">
                      <h3 className="mb-3 text-lg font-semibold">Categories</h3>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        Category
                      </Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(value) => setFormData({ ...formData, category_id: value, subcategory_id: '' })}
                      >
                        <SelectTrigger className="col-span-3">
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
                    {formData.category_id && filteredSubcategories.length > 0 && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="subcategory" className="text-right">
                          Subcategory
                        </Label>
                        <Select value={formData.subcategory_id} onValueChange={(value) => setFormData({ ...formData, subcategory_id: value })}>
                          <SelectTrigger className="col-span-3">
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
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="image" className="text-right">
                        Image
                      </Label>
                      <Input id="image" type="file" accept="image/*" onChange={handleFileChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="active" className="text-right">
                        Active
                      </Label>
                      <Switch id="active" checked={formData.active} onCheckedChange={(checked) => setFormData({ ...formData, active: checked })} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingMug ? 'Update' : 'Create'}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogDescription>Are you sure you want to delete this mug? This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={cancelDelete}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={confirmDelete}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
}

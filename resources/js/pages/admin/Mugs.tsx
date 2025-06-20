import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Textarea } from '@/components/ui/Textarea';
import { Head, router } from '@inertiajs/react';
import { Edit, Image, Plus, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';

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
  description?: string;
  price: number;
  category_id?: number;
  subcategory_id?: number;
  image_path?: string;
  image_url?: string;
  status: boolean;
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
    description: '',
    price: '',
    category_id: '',
    subcategory_id: '',
    status: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filteredSubcategories = formData.category_id ? subcategories.filter((sub) => sub.category_id === parseInt(formData.category_id)) : [];

  const handleOpenDialog = useCallback((mug?: Mug) => {
    if (mug) {
      setEditingMug(mug);
      setFormData({
        name: mug.name,
        description: mug.description || '',
        price: mug.price.toString(),
        category_id: mug.category_id?.toString() || '',
        subcategory_id: mug.subcategory_id?.toString() || '',
        status: mug.status,
      });
    } else {
      setEditingMug(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category_id: '',
        subcategory_id: '',
        status: true,
      });
    }
    setSelectedFile(null);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingMug(null);
    setSelectedFile(null);
  }, []);

  const handleFileChange = (e: React.ChangeEvent) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('status', formData.status ? '1' : '0');

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
    },
    [formData, editingMug, selectedFile, handleCloseDialog],
  );

  const handleDelete = useCallback(async (id: number) => {
    setDeleteId(id);
    setIsDeleting(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteId) {
      router.delete(`/mugs/${deleteId}`, {
        onSuccess: () => {
          setIsDeleting(false);
          setDeleteId(null);
        },
      });
    }
  }, [deleteId]);

  const cancelDelete = useCallback(() => {
    setIsDeleting(false);
    setDeleteId(null);
  }, []);

  const handleToggleStatus = useCallback((mug: Mug) => {
    router.put(`/mugs/${mug.id}`, {
      ...mug,
      status: !mug.status,
    });
  }, []);

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
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mugs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500">
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
                        <TableCell>${mug.price}</TableCell>
                        <TableCell>
                          <Switch checked={mug.status} onCheckedChange={() => handleToggleStatus(mug)} />
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
                      <Label htmlFor="description" className="mt-2 text-right">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="col-span-3"
                        rows={3}
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
                      <Label htmlFor="status" className="text-right">
                        Active
                      </Label>
                      <Switch id="status" checked={formData.status} onCheckedChange={(checked) => setFormData({ ...formData, status: checked })} />
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

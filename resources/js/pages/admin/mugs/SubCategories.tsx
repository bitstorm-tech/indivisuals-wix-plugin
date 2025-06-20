import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Textarea } from '@/components/ui/Textarea';
import { Head, router } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
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
  description?: string;
  category_id: number;
  category?: MugCategory;
  mugs_count?: number;
  created_at: string;
  updated_at: string;
}

interface SubCategoriesProps {
  subcategories: MugSubCategory[];
  categories: MugCategory[];
  auth: {
    user: User;
  };
}

export default function SubCategories({ subcategories, categories, auth }: SubCategoriesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<MugSubCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleOpenDialog = useCallback((subcategory?: MugSubCategory) => {
    if (subcategory) {
      setEditingSubCategory(subcategory);
      setFormData({
        name: subcategory.name,
        description: subcategory.description || '',
        category_id: subcategory.category_id.toString(),
      });
    } else {
      setEditingSubCategory(null);
      setFormData({
        name: '',
        description: '',
        category_id: '',
      });
    }
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingSubCategory(null);
    setFormData({
      name: '',
      description: '',
      category_id: '',
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (editingSubCategory) {
        router.put(`/mug-sub-categories/${editingSubCategory.id}`, formData, {
          onSuccess: handleCloseDialog,
        });
      } else {
        router.post('/mug-sub-categories', formData, {
          onSuccess: handleCloseDialog,
        });
      }
    },
    [formData, editingSubCategory, handleCloseDialog],
  );

  const handleDelete = useCallback(async (id: number) => {
    setDeleteId(id);
    setIsDeleting(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteId) {
      router.delete(`/mug-sub-categories/${deleteId}`, {
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

  return (
    <>
      <Head title="Admin - Mug Subcategories" />
      <div className="flex h-screen">
        <AdminSidebar user={auth.user} />

        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold">Mug Subcategories</h1>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                New Subcategory
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Mugs Count</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subcategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500">
                        No subcategories found
                      </TableCell>
                    </TableRow>
                  ) : (
                    subcategories.map((subcategory) => (
                      <TableRow key={subcategory.id}>
                        <TableCell className="font-medium">{subcategory.name}</TableCell>
                        <TableCell>{subcategory.category?.name || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate">{subcategory.description || '-'}</TableCell>
                        <TableCell>{subcategory.mugs_count || 0}</TableCell>
                        <TableCell>{new Date(subcategory.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(subcategory)} className="mr-2">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(subcategory.id)}
                            disabled={subcategory.mugs_count && subcategory.mugs_count > 0}
                          >
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
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingSubCategory ? 'Edit Subcategory' : 'New Subcategory'}</DialogTitle>
                    <DialogDescription>
                      {editingSubCategory ? 'Update the subcategory details below.' : 'Create a new mug subcategory.'}
                    </DialogDescription>
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
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        Category
                      </Label>
                      <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })} required>
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
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingSubCategory ? 'Update' : 'Create'}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogDescription>Are you sure you want to delete this subcategory? This action cannot be undone.</DialogDescription>
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

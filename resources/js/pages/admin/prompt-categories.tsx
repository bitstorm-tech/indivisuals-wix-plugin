import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Head, router } from '@inertiajs/react';
import { ChevronRight, Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface PromptCategory {
  id: number;
  name: string;
  prompts_count?: number;
  subcategories_count?: number;
  created_at: string;
  updated_at: string;
}

interface PromptSubCategory {
  id: number;
  name: string;
  category_id?: number;
  category?: PromptCategory;
  prompts_count?: number;
  created_at: string;
  updated_at: string;
}

interface CategoriesProps {
  categories: PromptCategory[];
  subcategories: PromptSubCategory[];
  auth: {
    user: User;
  };
}

export default function Categories({ categories, subcategories, auth }: CategoriesProps) {
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PromptCategory | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<PromptSubCategory | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [subcategoryFormData, setSubcategoryFormData] = useState({
    name: '',
    category_id: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteType, setDeleteType] = useState<'category' | 'subcategory' | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const handleOpenCategoryDialog = (category?: PromptCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setCategoryName('');
    }
    setIsCategoryDialogOpen(true);
  };

  const handleCloseCategoryDialog = () => {
    setIsCategoryDialogOpen(false);
    setEditingCategory(null);
    setCategoryName('');
  };

  const handleOpenSubcategoryDialog = (subcategory?: PromptSubCategory, categoryId?: number) => {
    if (subcategory) {
      setEditingSubCategory(subcategory);
      setSubcategoryFormData({
        name: subcategory.name,
        category_id: subcategory.category_id?.toString() || '',
      });
    } else {
      setEditingSubCategory(null);
      setSubcategoryFormData({
        name: '',
        category_id: categoryId ? categoryId.toString() : '',
      });
    }
    setIsSubcategoryDialogOpen(true);
  };

  const handleCloseSubcategoryDialog = () => {
    setIsSubcategoryDialogOpen(false);
    setEditingSubCategory(null);
    setSubcategoryFormData({
      name: '',
      category_id: '',
    });
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = { name: categoryName };

    if (editingCategory) {
      router.put(`/prompt-categories/${editingCategory.id}`, data, {
        onSuccess: handleCloseCategoryDialog,
      });
    } else {
      router.post('/prompt-categories', data, {
        onSuccess: handleCloseCategoryDialog,
      });
    }
  };

  const handleSubmitSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingSubCategory) {
      router.put(`/prompt-sub-categories/${editingSubCategory.id}`, subcategoryFormData, {
        onSuccess: handleCloseSubcategoryDialog,
      });
    } else {
      router.post('/prompt-sub-categories', subcategoryFormData, {
        onSuccess: handleCloseSubcategoryDialog,
      });
    }
  };

  const handleDelete = async (id: number, type: 'category' | 'subcategory') => {
    setDeleteId(id);
    setDeleteType(type);
    setIsDeleting(true);
  };

  const confirmDelete = () => {
    if (deleteId && deleteType) {
      const url = deleteType === 'category' ? `/prompt-categories/${deleteId}` : `/prompt-sub-categories/${deleteId}`;
      router.delete(url, {
        onSuccess: () => {
          setIsDeleting(false);
          setDeleteId(null);
          setDeleteType(null);
        },
      });
    }
  };

  const cancelDelete = () => {
    setIsDeleting(false);
    setDeleteId(null);
    setDeleteType(null);
  };

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getCategorySubcategories = (categoryId: number) => {
    return subcategories.filter((sub) => sub.category_id === categoryId);
  };

  return (
    <>
      <Head title="Admin - Prompt Categories" />
      <div className="flex h-screen">
        <AdminSidebar user={auth.user} />

        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold">Prompt Categories & Subcategories</h1>
              <Button onClick={() => handleOpenCategoryDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                New Category
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Prompts Count</TableHead>
                    <TableHead>Subcategories</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500">
                        No categories found
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => {
                      const categorySubcategories = getCategorySubcategories(category.id);
                      const isExpanded = expandedCategories.has(category.id);
                      const hasSubcategories = categorySubcategories.length > 0;

                      return (
                        <>
                          <TableRow key={`category-${category.id}`}>
                            <TableCell>
                              {hasSubcategories && (
                                <Button variant="ghost" size="sm" onClick={() => toggleCategory(category.id)} className="h-6 w-6 p-0">
                                  <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                </Button>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell>{category.prompts_count || 0}</TableCell>
                            <TableCell>{category.subcategories_count || 0}</TableCell>
                            <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenSubcategoryDialog(undefined, category.id)}
                                className="mr-1"
                                title="Add subcategory"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleOpenCategoryDialog(category)} className="mr-1">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(category.id, 'category')}
                                disabled={
                                  Boolean(category.prompts_count && category.prompts_count > 0) ||
                                  Boolean(category.subcategories_count && category.subcategories_count > 0)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                          {isExpanded &&
                            categorySubcategories.map((subcategory) => (
                              <TableRow key={`subcategory-${subcategory.id}`} className="bg-gray-50">
                                <TableCell></TableCell>
                                <TableCell className="pl-12 font-medium">{subcategory.name}</TableCell>
                                <TableCell>{subcategory.prompts_count || 0}</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>{new Date(subcategory.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" onClick={() => handleOpenSubcategoryDialog(subcategory)} className="mr-1">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(subcategory.id, 'subcategory')}
                                    disabled={!!subcategory.prompts_count && subcategory.prompts_count > 0}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                        </>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogContent>
                <form onSubmit={handleSubmitCategory}>
                  <DialogHeader>
                    <DialogTitle>{editingCategory ? 'Edit Category' : 'New Category'}</DialogTitle>
                    <DialogDescription>{editingCategory ? 'Update the category details below.' : 'Create a new prompt category.'}</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input id="name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="col-span-3" required />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCloseCategoryDialog}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingCategory ? 'Update' : 'Create'}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isSubcategoryDialogOpen} onOpenChange={setIsSubcategoryDialogOpen}>
              <DialogContent>
                <form onSubmit={handleSubmitSubcategory}>
                  <DialogHeader>
                    <DialogTitle>{editingSubCategory ? 'Edit Subcategory' : 'New Subcategory'}</DialogTitle>
                    <DialogDescription>
                      {editingSubCategory ? 'Update the subcategory details below.' : 'Create a new prompt subcategory.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="sub-name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="sub-name"
                        value={subcategoryFormData.name}
                        onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, name: e.target.value })}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        Category
                      </Label>
                      <Select
                        value={subcategoryFormData.category_id}
                        onValueChange={(value) => setSubcategoryFormData({ ...subcategoryFormData, category_id: value })}
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
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCloseSubcategoryDialog}>
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
                  <DialogDescription>
                    Are you sure you want to delete this {deleteType === 'category' ? 'category' : 'subcategory'}? This action cannot be undone.
                  </DialogDescription>
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

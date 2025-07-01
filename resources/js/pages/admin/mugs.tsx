import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Mug } from '@/types/mug';
import { Head, router } from '@inertiajs/react';
import { Edit, Image, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface MugsProps {
  mugs: Mug[];
  auth: {
    user: User;
  };
}

export default function Mugs({ mugs, auth }: MugsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

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

  return (
    <>
      <Head title="Admin - Mugs" />
      <AdminLayout user={auth.user}>
        <div className="container mx-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Mugs</h1>
            <Button onClick={() => router.visit('/admin/mugs/new')}>
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
                      <TableCell>{mug.height_mm && mug.diameter_mm ? `${mug.height_mm}×${mug.diameter_mm}mm` : '-'}</TableCell>
                      <TableCell>${mug.price}</TableCell>
                      <TableCell>{new Date(mug.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => router.visit(`/admin/mugs/${mug.id}/edit`)} className="mr-2">
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
      </AdminLayout>
    </>
  );
}

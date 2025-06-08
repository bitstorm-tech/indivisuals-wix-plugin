import ImagePicker from '@/components/image-picker';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Prompt {
  id: number;
  name: string;
  category: string;
  prompt: string;
  active: boolean;
}

interface AdminProps {
  prompts: Prompt[];
}

export default function Admin({ prompts }: AdminProps) {
  const [editingPrompts, setEditingPrompts] = useState<Record<number, Prompt>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [testingPromptId, setTestingPromptId] = useState<number | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [promptToDelete, setPromptToDelete] = useState<number | undefined>(undefined);

  useEffect(() => {
    fetch('/prompt-categories')
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch((error) => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  // Filter prompts based on selected category
  const filteredPrompts = selectedCategory === 'all' ? prompts : prompts.filter((prompt) => prompt.category === selectedCategory);

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompts((prev) => ({
      ...prev,
      [prompt.id]: { ...prompt },
    }));
  };

  const handleCancel = (promptId: number) => {
    setEditingPrompts((prev) => {
      const newState = { ...prev };
      delete newState[promptId];
      return newState;
    });
  };

  const handleSave = async (promptId: number) => {
    const editedPrompt = editingPrompts[promptId];
    if (!editedPrompt) return;

    try {
      await fetch(`/admin/prompts/${promptId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          name: editedPrompt.name,
          category: editedPrompt.category,
          prompt: editedPrompt.prompt,
        }),
      });

      router.reload({ only: ['prompts'] });
      handleCancel(promptId);
    } catch (error) {
      console.error('Error saving prompt:', error);
    }
  };

  const handleDelete = async (promptId: number) => {
    setPromptToDelete(promptId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!promptToDelete) return;

    try {
      await fetch(`/admin/prompts/${promptToDelete}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      router.reload({ only: ['prompts'] });
      handleCancel(promptToDelete);
    } catch (error) {
      console.error('Error deleting prompt:', error);
    } finally {
      setIsDeleteDialogOpen(false);
      setPromptToDelete(undefined);
    }
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setPromptToDelete(undefined);
  };

  const handleTest = (promptId: number) => {
    setTestingPromptId(promptId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTestingPromptId(undefined);
  };

  const handleInputChange = (promptId: number, field: keyof Prompt, value: string) => {
    setEditingPrompts((prev) => ({
      ...prev,
      [promptId]: {
        ...prev[promptId],
        [field]: value,
      },
    }));
  };

  const isEditing = (promptId: number) => promptId in editingPrompts;
  const hasChanges = (prompt: Prompt) => {
    const edited = editingPrompts[prompt.id];
    return edited && (edited.name !== prompt.name || edited.category !== prompt.category || edited.prompt !== prompt.prompt);
  };

  return (
    <>
      <Head title="Admin Dashboard" />
      <div className="container mx-auto p-6">
        <h1 className="mb-6 text-3xl font-bold">Admin Dashboard - Prompts</h1>

        {/* Category Filter Dropdown */}
        <div className="mb-4 flex items-center gap-4">
          <label className="text-sm font-medium">Filter by Category:</label>
          <select
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-[200px] items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Prompt</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrompts.map((prompt) => {
                const editing = isEditing(prompt.id);
                const changed = hasChanges(prompt);
                const currentPrompt = editing ? editingPrompts[prompt.id] : prompt;

                return (
                  <TableRow key={prompt.id}>
                    <TableCell>
                      {editing ? (
                        <input
                          type="text"
                          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                          value={currentPrompt.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(prompt.id, 'name', e.target.value)}
                        />
                      ) : (
                        <span>{prompt.name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editing ? (
                        <div className="space-y-2">
                          <select
                            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            value={currentPrompt.category}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange(prompt.id, 'category', e.target.value)}
                          >
                            {categories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                          <textarea
                            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            rows={3}
                            value={currentPrompt.prompt}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange(prompt.id, 'prompt', e.target.value)}
                          />
                        </div>
                      ) : (
                        <span className="block max-w-md truncate" title={prompt.prompt}>
                          {prompt.prompt}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {editing ? (
                          <>
                            <Button variant={!changed ? 'outline' : 'default'} size="sm" onClick={() => handleSave(prompt.id)} disabled={!changed}>
                              Save
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleCancel(prompt.id)}>
                              Cancel
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(prompt.id)}>
                              Delete
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="default" size="sm" onClick={() => handleEdit(prompt)}>
                              Edit
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => handleTest(prompt.id)}>
                              Test
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Dialog for testing prompts */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Test Prompt</DialogTitle>
            </DialogHeader>
            <ImagePicker defaultPromptId={testingPromptId} />
            <DialogFooter>
              <Button variant="outline" onClick={closeModal}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Alert Dialog for delete confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone. This will permanently delete the prompt.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}

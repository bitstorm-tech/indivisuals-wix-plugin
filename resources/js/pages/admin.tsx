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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Prompt {
  id: number;
  name: string;
  category: string;
  prompt: string;
  active: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface AdminProps {
  prompts: Prompt[];
  auth: {
    user: User;
  };
}

export default function Admin({ prompts, auth }: AdminProps) {
  const [editingPrompts, setEditingPrompts] = useState<Record<number, Prompt>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [testingPromptId, setTestingPromptId] = useState<number | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [promptToDelete, setPromptToDelete] = useState<number | undefined>(undefined);
  const [isNewPromptDialogOpen, setIsNewPromptDialogOpen] = useState<boolean>(false);
  const [newPrompt, setNewPrompt] = useState<{ name: string; category: string; prompt: string }>({
    name: '',
    category: '',
    prompt: ''
  });

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

  const handleLogout = () => {
    router.post('/logout');
  };

  const handleNewPrompt = () => {
    setIsNewPromptDialogOpen(true);
  };

  const handleNewPromptInputChange = (field: keyof typeof newPrompt, value: string) => {
    setNewPrompt((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveNewPrompt = async () => {
    if (!newPrompt.name || !newPrompt.category || !newPrompt.prompt) {
      return;
    }

    try {
      await fetch('/admin/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          name: newPrompt.name,
          category: newPrompt.category,
          prompt: newPrompt.prompt,
          active: true,
        }),
      });

      router.reload({ only: ['prompts'] });
      setIsNewPromptDialogOpen(false);
      setNewPrompt({ name: '', category: '', prompt: '' });
    } catch (error) {
      console.error('Error creating prompt:', error);
    }
  };

  const handleCancelNewPrompt = () => {
    setIsNewPromptDialogOpen(false);
    setNewPrompt({ name: '', category: '', prompt: '' });
  };

  return (
    <>
      <Head title="Admin Dashboard" />
      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard - Prompts</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {auth.user.name}</span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* New Prompt Button and Category Filter */}
        <div className="mb-4 flex items-center justify-between">
          <Button onClick={handleNewPrompt}>New Prompt</Button>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Filter by Category:</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
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
                        <Input
                          type="text"
                          value={currentPrompt.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(prompt.id, 'name', e.target.value)}
                        />
                      ) : (
                        <span>{prompt.name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editing ? (
                        <Select value={currentPrompt.category} onValueChange={(value) => handleInputChange(prompt.id, 'category', value)}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span>{prompt.category}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editing ? (
                        <Textarea
                          rows={3}
                          value={currentPrompt.prompt}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange(prompt.id, 'prompt', e.target.value)}
                        />
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
          <DialogContent>
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

        {/* Dialog for creating new prompt */}
        <Dialog open={isNewPromptDialogOpen} onOpenChange={setIsNewPromptDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Prompt</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  type="text"
                  value={newPrompt.name}
                  onChange={(e) => handleNewPromptInputChange('name', e.target.value)}
                  placeholder="Enter prompt name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={newPrompt.category} onValueChange={(value) => handleNewPromptInputChange('category', value)}>
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
              </div>
              <div>
                <label className="text-sm font-medium">Prompt</label>
                <Textarea
                  rows={4}
                  value={newPrompt.prompt}
                  onChange={(e) => handleNewPromptInputChange('prompt', e.target.value)}
                  placeholder="Enter the prompt text"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelNewPrompt}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveNewPrompt}
                disabled={!newPrompt.name || !newPrompt.category || !newPrompt.prompt}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

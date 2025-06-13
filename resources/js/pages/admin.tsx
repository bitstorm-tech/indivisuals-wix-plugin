import AdminHeader from '@/components/admin/AdminHeader';
import DeleteConfirmationDialog from '@/components/admin/DeleteConfirmationDialog';
import NewPromptDialog from '@/components/admin/NewPromptDialog';
import PromptTable from '@/components/admin/PromptTable';
import PromptTableHeader from '@/components/admin/PromptTableHeader';
import TestPromptDialog from '@/components/admin/TestPromptDialog';
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
  const [newPrompt, setNewPrompt] = useState<{ name: string; category: string; prompt: string; active: boolean }>({
    name: '',
    category: '',
    prompt: '',
    active: true,
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
          active: editedPrompt.active,
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

  const handleInputChange = (promptId: number, field: keyof Prompt, value: string | boolean) => {
    setEditingPrompts((prev) => ({
      ...prev,
      [promptId]: {
        ...prev[promptId],
        [field]: field === 'active' ? value === 'true' || value === true : value,
      },
    }));
  };

  const isEditing = (promptId: number) => promptId in editingPrompts;
  const hasChanges = (prompt: Prompt) => {
    const edited = editingPrompts[prompt.id];
    return (
      edited &&
      (edited.name !== prompt.name || edited.category !== prompt.category || edited.prompt !== prompt.prompt || edited.active !== prompt.active)
    );
  };

  const handleNewPrompt = () => {
    setIsNewPromptDialogOpen(true);
  };

  const handleNewPromptInputChange = (field: keyof typeof newPrompt, value: string | boolean) => {
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
          active: newPrompt.active,
        }),
      });

      router.reload({ only: ['prompts'] });
      setIsNewPromptDialogOpen(false);
      setNewPrompt({ name: '', category: '', prompt: '', active: true });
    } catch (error) {
      console.error('Error creating prompt:', error);
    }
  };

  const handleCancelNewPrompt = () => {
    setIsNewPromptDialogOpen(false);
    setNewPrompt({ name: '', category: '', prompt: '', active: true });
  };

  return (
    <>
      <Head title="Admin Dashboard" />
      <div className="container mx-auto p-6">
        <AdminHeader user={auth.user} />

        <PromptTableHeader
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onNewPrompt={handleNewPrompt}
        />

        <PromptTable
          prompts={filteredPrompts}
          editingPrompts={editingPrompts}
          categories={categories}
          isEditing={isEditing}
          hasChanges={hasChanges}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSave={handleSave}
          onDelete={handleDelete}
          onTest={handleTest}
          onInputChange={handleInputChange}
        />

        <TestPromptDialog isOpen={isModalOpen} testingPromptId={testingPromptId} onClose={closeModal} />

        <DeleteConfirmationDialog isOpen={isDeleteDialogOpen} onConfirm={confirmDelete} onCancel={cancelDelete} />

        <NewPromptDialog
          isOpen={isNewPromptDialogOpen}
          newPrompt={newPrompt}
          categories={categories}
          onSave={handleSaveNewPrompt}
          onCancel={handleCancelNewPrompt}
          onInputChange={handleNewPromptInputChange}
        />
      </div>
    </>
  );
}

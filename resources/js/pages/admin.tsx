import AdminSidebar from '@/components/admin/AdminSidebar';
import DeleteConfirmationDialog from '@/components/admin/DeleteConfirmationDialog';
import NewOrEditPromptDialog from '@/components/admin/NewOrEditPromptDialog';
import PromptTable from '@/components/admin/PromptTable';
import PromptTableHeader from '@/components/admin/PromptTableHeader';
import TestPromptDialog from '@/components/admin/TestPromptDialog';
import { Prompt } from '@/types/prompt';
import { Head, router } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AdminProps {
  prompts: Prompt[];
  categories: string[];
  auth: {
    user: User;
  };
}

export default function Admin({ prompts, categories, auth }: AdminProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [testingPromptId, setTestingPromptId] = useState<number | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [promptToDelete, setPromptToDelete] = useState<number | undefined>(undefined);
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState<boolean>(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | undefined>(undefined);

  // Filter prompts based on selected category
  const filteredPrompts = useMemo(
    () => (selectedCategory === 'all' ? prompts : prompts.filter((prompt) => prompt.category === selectedCategory)),
    [prompts, selectedCategory],
  );

  const handleEdit = useCallback((prompt: Prompt) => {
    setEditingPrompt(prompt);
    setIsPromptDialogOpen(true);
  }, []);

  const handleDelete = useCallback((promptId: number) => {
    setPromptToDelete(promptId);
    setIsDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!promptToDelete) return;

    try {
      await fetch(`/prompts/${promptToDelete}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      router.reload({ only: ['prompts'] });
    } catch (error) {
      console.error('Error deleting prompt:', error);
    } finally {
      setIsDeleteDialogOpen(false);
      setPromptToDelete(undefined);
    }
  }, [promptToDelete]);

  const cancelDelete = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setPromptToDelete(undefined);
  }, []);

  const handleTest = useCallback((promptId: number) => {
    setTestingPromptId(promptId);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTestingPromptId(undefined);
  }, []);

  const handleNewPrompt = useCallback(() => {
    setEditingPrompt(undefined);
    setIsPromptDialogOpen(true);
  }, []);

  const handleClosePromptDialog = useCallback(() => {
    setIsPromptDialogOpen(false);
    setEditingPrompt(undefined);
  }, []);

  return (
    <>
      <Head title="Admin Dashboard" />
      <div className="flex h-screen">
        <AdminSidebar user={auth.user} />

        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <PromptTableHeader
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              onNewPrompt={handleNewPrompt}
            />

            <PromptTable prompts={filteredPrompts} onEdit={handleEdit} onDelete={handleDelete} onTest={handleTest} />

            <TestPromptDialog isOpen={isModalOpen} testingPromptId={testingPromptId} onClose={closeModal} />

            <DeleteConfirmationDialog isOpen={isDeleteDialogOpen} onConfirm={confirmDelete} onCancel={cancelDelete} />

            <NewOrEditPromptDialog
              isOpen={isPromptDialogOpen}
              editingPrompt={editingPrompt}
              categories={categories}
              onClose={handleClosePromptDialog}
            />
          </div>
        </div>
      </div>
    </>
  );
}

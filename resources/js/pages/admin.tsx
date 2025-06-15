import AdminHeader from '@/components/admin/AdminHeader';
import DeleteConfirmationDialog from '@/components/admin/DeleteConfirmationDialog';
import NewOrEditPromptDialog from '@/components/admin/NewOrEditPromptDialog';
import PromptTable from '@/components/admin/PromptTable';
import PromptTableHeader from '@/components/admin/PromptTableHeader';
import TestPromptDialog from '@/components/admin/TestPromptDialog';
import { Prompt } from '@/types/prompt';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

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
  const filteredPrompts = selectedCategory === 'all' ? prompts : prompts.filter((prompt) => prompt.category === selectedCategory);

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setIsPromptDialogOpen(true);
  };

  const handleDelete = async (promptId: number) => {
    setPromptToDelete(promptId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
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

  const handleNewPrompt = () => {
    setEditingPrompt(undefined);
    setIsPromptDialogOpen(true);
  };

  const handleClosePromptDialog = () => {
    setIsPromptDialogOpen(false);
    setEditingPrompt(undefined);
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

        <PromptTable prompts={filteredPrompts} onEdit={handleEdit} onDelete={handleDelete} onTest={handleTest} />

        <TestPromptDialog isOpen={isModalOpen} testingPromptId={testingPromptId} onClose={closeModal} />

        <DeleteConfirmationDialog isOpen={isDeleteDialogOpen} onConfirm={confirmDelete} onCancel={cancelDelete} />

        <NewOrEditPromptDialog isOpen={isPromptDialogOpen} editingPrompt={editingPrompt} categories={categories} onClose={handleClosePromptDialog} />
      </div>
    </>
  );
}

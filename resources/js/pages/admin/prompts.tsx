import AdminSidebar from '@/components/admin/AdminSidebar';
import DeleteConfirmationDialog from '@/components/admin/DeleteConfirmationDialog';
import PromptTable from '@/components/admin/PromptTable';
import PromptTableHeader from '@/components/admin/PromptTableHeader';
import TestPromptDialog from '@/components/admin/TestPromptDialog';
import { Prompt, PromptCategory, PromptSubCategory } from '@/types/prompt';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface PromptsProps {
  prompts: Prompt[];
  categories: PromptCategory[];
  subcategories: PromptSubCategory[];
  auth: {
    user: User;
  };
}

export default function Prompts({ prompts, categories, auth }: PromptsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [testingPromptId, setTestingPromptId] = useState<number | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [promptToDelete, setPromptToDelete] = useState<number | undefined>(undefined);

  // Filter prompts based on selected category
  const filteredPrompts = selectedCategory === 'all' ? prompts : prompts.filter((prompt) => prompt.category_id === parseInt(selectedCategory));

  const handleEdit = (prompt: Prompt) => {
    router.visit(`/admin/prompts/${prompt.id}/edit`);
  };

  const handleDelete = (promptId: number) => {
    setPromptToDelete(promptId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!promptToDelete) return;

    router.delete(`/api/prompts/${promptToDelete}`, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setPromptToDelete(undefined);
      },
      onError: (errors) => {
        console.error('Error deleting prompt:', errors);
        setIsDeleteDialogOpen(false);
        setPromptToDelete(undefined);
      },
    });
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
    router.visit('/admin/prompts/new');
  };

  return (
    <>
      <Head title="Admin - Prompts" />
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
          </div>
        </div>
      </div>
    </>
  );
}

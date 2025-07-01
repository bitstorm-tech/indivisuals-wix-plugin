import AdminSidebar from '@/components/admin/AdminSidebar';
import PromptForm from '@/components/admin/PromptForm';
import { Prompt, PromptCategory, PromptSubCategory } from '@/types/prompt';
import { Head } from '@inertiajs/react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface PromptFormPageProps {
  prompt?: Prompt | null;
  categories: PromptCategory[];
  subcategories: PromptSubCategory[];
  auth: {
    user: User;
  };
}

export default function PromptFormPage({ prompt, categories, subcategories, auth }: PromptFormPageProps) {
  const isEditing = !!prompt;
  const title = isEditing ? `Edit ${prompt.name}` : 'New Prompt';

  return (
    <>
      <Head title={`Admin - ${title}`} />
      <div className="flex h-screen">
        <AdminSidebar user={auth.user} />

        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">{title}</h1>
              <p className="text-gray-600">{isEditing ? 'Update the prompt details below.' : 'Create a new prompt for your collection.'}</p>
            </div>

            <div className="max-w-4xl">
              <PromptForm prompt={prompt} categories={categories} subcategories={subcategories} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import AdminSidebar from '@/components/admin/AdminSidebar';
import MugForm from '@/components/admin/MugForm';
import { Mug, MugCategory, MugSubCategory } from '@/types/mug';
import { Head } from '@inertiajs/react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface MugFormPageProps {
  mug?: Mug | null;
  categories: MugCategory[];
  subcategories: MugSubCategory[];
  auth: {
    user: User;
  };
}

export default function MugFormPage({ mug, categories, subcategories, auth }: MugFormPageProps) {
  const isEditing = !!mug;
  const title = isEditing ? `Edit ${mug.name}` : 'New Mug';

  return (
    <>
      <Head title={`Admin - ${title}`} />
      <div className="flex h-screen">
        <AdminSidebar user={auth.user} />

        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">{title}</h1>
              <p className="text-gray-600">{isEditing ? 'Update the mug details below.' : 'Create a new mug for your catalog.'}</p>
            </div>

            <div className="max-w-4xl">
              <MugForm mug={mug} categories={categories} subcategories={subcategories} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

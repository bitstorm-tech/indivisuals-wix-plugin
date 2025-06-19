import EditorNewWizard from '@/components/editor-new/EditorNewWizard';
import { usePrompts } from '@/components/editor/hooks/usePrompts';

export default function EditorNewPage() {
  const { prompts, isLoading, error } = usePrompts();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading editor: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EditorNewWizard prompts={prompts} />
    </div>
  );
}

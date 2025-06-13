import Editor from '@/components/editor/Editor';
import { EditorImage, EditorText } from '@/types/editor';
import { Head } from '@inertiajs/react';

export default function EditorPage() {
  const handleExport = (data: { images: EditorImage[]; texts: EditorText[] }) => {
    console.log('Exporting editor data:', data);
  };

  return (
    <>
      <Head title="Editor - TheIndivisuals" />
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-7xl">
          <Editor onExport={handleExport} />
        </div>
      </div>
    </>
  );
}

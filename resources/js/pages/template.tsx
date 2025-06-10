import TemplateEditor from '@/components/template/template-editor';
import { TemplateImage, TemplateText } from '@/types/template';
import { Head } from '@inertiajs/react';

export default function Template() {
  const handleExport = (data: { images: TemplateImage[]; texts: TemplateText[] }) => {
    console.log('Exporting template:', data);
  };

  return (
    <>
      <Head title="Template Editor - TheIndivisuals" />
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-7xl">
          <TemplateEditor onExport={handleExport} />
        </div>
      </div>
    </>
  );
}

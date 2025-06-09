import TemplateEditor from '@/components/template/template-editor';
import { TemplateImage } from '@/types/template';
import { Head } from '@inertiajs/react';

export default function Template() {
  const handleExport = (images: TemplateImage[]) => {
    console.log('Exporting template with images:', images);
    alert(`Template exportiert mit ${images.length} Bildern!`);
  };

  return (
    <>
      <Head title="Template Editor - TheIndivisuals" />
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <TemplateEditor onExport={handleExport} />
        </div>
      </div>
    </>
  );
}
import TemplateEditor from '@/components/template/template-editor';
import { TemplateImage, TemplateText } from '@/types/template';
import { Head } from '@inertiajs/react';

export default function Template() {
  const handleExport = (data: { images: TemplateImage[]; texts: TemplateText[] }) => {
    console.log('Exporting template:', data);
    alert(`Template exportiert mit ${data.images.length} Bildern und ${data.texts.length} Texten!`);
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
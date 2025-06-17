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
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-200 bg-white p-6">
          <h2 className="mb-6 text-lg font-semibold text-gray-900">Editor Tools</h2>

          <nav className="space-y-2">
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-2 text-sm font-medium text-gray-700">Templates</h3>
              <p className="text-xs text-gray-500">Coming soon</p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-2 text-sm font-medium text-gray-700">Recent Projects</h3>
              <p className="text-xs text-gray-500">No recent projects</p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-2 text-sm font-medium text-gray-700">Resources</h3>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• Image Guidelines</li>
                <li>• Export Tips</li>
                <li>• Keyboard Shortcuts</li>
              </ul>
            </div>
          </nav>

          <div className="mt-auto pt-6">
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-1 text-sm font-medium text-gray-700">Need Help?</h3>
              <p className="text-xs text-gray-600">Check our documentation or contact support.</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4">
          <div className="mx-auto max-w-7xl">
            <Editor onExport={handleExport} />
          </div>
        </main>
      </div>
    </>
  );
}

import MugPreview3D from '@/components/editor/components/shared/MugPreview3D';
import { MugOption } from '@/components/editor/types';

export default function Mug3DTest() {
  const mockMug: MugOption = {
    id: 1,
    name: 'Classic Mug',
    price: 19.99,
    image: '/images/mug1.jpg',
    capacity: '350ml',
    special: 'Dishwasher Safe',
  };

  // Test image with text and colors to verify UV mapping
  const testImageUrl =
    'data:image/svg+xml;base64,' +
    btoa(`
    <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="400" fill="#f0f0f0"/>
      <rect x="0" y="0" width="200" height="400" fill="#ff6b6b"/>
      <rect x="200" y="0" width="200" height="400" fill="#4ecdc4"/>
      <rect x="400" y="0" width="200" height="400" fill="#45b7d1"/>
      <rect x="600" y="0" width="200" height="400" fill="#96ceb4"/>
      <text x="400" y="200" font-family="Arial" font-size="60" fill="black" text-anchor="middle" dy=".3em">TEST MUG</text>
      <text x="400" y="100" font-family="Arial" font-size="30" fill="black" text-anchor="middle" dy=".3em">TOP</text>
      <text x="400" y="300" font-family="Arial" font-size="30" fill="black" text-anchor="middle" dy=".3em">BOTTOM</text>
    </svg>
  `);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-center text-3xl font-bold">3D Mug Test Page</h1>

        <div className="rounded-lg bg-white p-6 shadow-lg">
          <MugPreview3D mug={mockMug} imageUrl={testImageUrl} cropData={null} />
        </div>

        <div className="mt-8 space-y-6">
          {/* Original test image */}
          <div className="rounded-lg bg-gray-100 p-4">
            <h2 className="mb-4 text-center font-semibold">Original Test Image</h2>
            <div className="mx-auto max-w-md overflow-hidden rounded-lg border-2 border-gray-300">
              <img src={testImageUrl} alt="Test pattern" className="w-full" />
            </div>
            <p className="mt-2 text-center text-sm text-gray-600">This test pattern shows color bands and text to verify UV mapping</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-green-50 p-4">
              <h2 className="mb-2 font-semibold text-green-800">✅ Features Implemented</h2>
              <ul className="list-inside list-disc space-y-1 text-sm text-green-700">
                <li>Open top with visible interior</li>
                <li>Proper C-shaped handle on the side</li>
                <li>Correct UV mapping (no image on top)</li>
                <li>Realistic wall thickness</li>
                <li>Image wraps 70% around (space near handle)</li>
                <li>Interactive rotation and zoom</li>
              </ul>
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
              <h2 className="mb-2 font-semibold text-blue-800">🎮 Controls</h2>
              <ul className="list-inside list-disc space-y-1 text-sm text-blue-700">
                <li>Drag to rotate the mug</li>
                <li>Scroll to zoom in/out</li>
                <li>Auto-rotation enabled</li>
                <li>Double-click to reset view</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-gray-100 p-4 text-center text-sm text-gray-600">
          This test page demonstrates the 3D mug preview component with proper proportions and realistic rendering.
        </div>
      </div>
    </div>
  );
}

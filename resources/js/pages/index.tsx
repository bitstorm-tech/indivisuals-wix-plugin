import ImagePicker from '@/components/image-picker/ImagePicker';
import { Head } from '@inertiajs/react';

export default function Welcome() {
  window.addEventListener('message', () => {});

  return (
    <>
      <Head title="TheIndivisuals" />
      <div className="flex flex-col gap-4 p-12">
        <ImagePicker />
      </div>
    </>
  );
}

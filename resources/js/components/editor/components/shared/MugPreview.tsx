import { cn } from '@/lib/utils';
import { MugOption } from '../../types';

interface MugPreviewProps {
  mug: MugOption;
  imageUrl: string;
  className?: string;
}

export default function MugPreview({ mug, imageUrl, className }: MugPreviewProps) {
  return (
    <div className={cn('relative', className)}>
      <div className="relative mx-auto h-96 w-96">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-80 w-64 transform transition-transform hover:rotate-y-12">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gray-200 to-gray-300 shadow-2xl">
              <div className="absolute top-1/2 right-0 h-24 w-12 translate-x-8 -translate-y-1/2 rounded-full bg-gradient-to-r from-gray-300 to-gray-200 shadow-lg" />
            </div>

            <div className="absolute inset-4 overflow-hidden rounded-2xl">
              <img src={imageUrl} alt="Your design" className="h-full w-full object-cover" />
            </div>

            <div className="absolute inset-x-0 bottom-0 h-1/3 rounded-b-3xl bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <h4 className="text-lg font-semibold">{mug.name}</h4>
        <p className="mt-1 text-sm text-gray-600">{mug.capacity}</p>
        {mug.special && (
          <span className="mt-2 inline-block rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">{mug.special}</span>
        )}
      </div>
    </div>
  );
}

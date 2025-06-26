import { X } from 'lucide-react';

interface ImagePreviewListProps {
  images: { url: string; file: File }[];
  onRemoveImage: (index: number) => void;
}

export default function ImagePreviewList({ images, onRemoveImage }: ImagePreviewListProps) {
  if (images.length === 0) return null;

  return (
    <div className="space-y-2">
      {images.map((image, index) => (
        <div key={`${image.file.name}-${index}`} className="relative rounded-lg border border-gray-200 p-2">
          <img src={image.url} alt={`Selected ${index + 1}`} className="h-20 w-full rounded object-cover" />
          <button
            onClick={() => onRemoveImage(index)}
            className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
            aria-label={`Remove image ${index + 1}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

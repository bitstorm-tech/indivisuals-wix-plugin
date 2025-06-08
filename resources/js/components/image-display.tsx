interface ImageDisplayProps {
    previewImage?: string;
    generatedImage?: string;
}

export default function ImageDisplay({ previewImage, generatedImage }: ImageDisplayProps) {
    return (
        <section className="flex gap-8">
            {previewImage && (
                <div className="mt-4">
                    <p className="text-sm text-gray-600">Original:</p>
                    <img src={previewImage} className="mt-2 max-h-80 max-w-80" alt="Preview" />
                </div>
            )}

            {generatedImage && (
                <div className="mt-4">
                    <p className="text-sm text-gray-600">Bearbeitet:</p>
                    <img src={generatedImage} className="mt-2 max-h-80 max-w-80" alt="Generated" />
                </div>
            )}
        </section>
    );
}

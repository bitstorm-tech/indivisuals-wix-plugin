interface ImageDisplayProps {
    previewImage?: string;
    generatedImage?: string;
    isProcessing: boolean;
}

export default function ImageDisplay({ previewImage, generatedImage, isProcessing }: ImageDisplayProps) {
    return (
        <>
            {previewImage && !isProcessing && (
                <div className="mt-4">
                    <p className="text-sm text-gray-600">Vorschau:</p>
                    <img src={previewImage} className="mt-2 max-h-80 max-w-80" alt="Preview" />
                </div>
            )}

            {generatedImage && (
                <div className="mt-4">
                    <p className="text-sm text-gray-600">Bearbeitetes Bild:</p>
                    <img src={generatedImage} className="mt-2 max-h-80 max-w-80" alt="Generated" />
                </div>
            )}
        </>
    );
}

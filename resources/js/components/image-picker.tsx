import React, { useEffect, useRef, useState } from 'react';

interface UploadResponse {
    success: boolean;
    message: string;
    data?: {
        filename: string;
        path: string;
        url: string;
    };
    errors?: Record<string, string[]>;
}

export default function ImagePicker() {
    const [prevImage, setPrevImage] = useState<string | undefined>(undefined);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    async function uploadImage(file: File): Promise<void> {
        setIsUploading(true);
        setUploadStatus(null);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/upload-image', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const result: UploadResponse = await response.json();

            if (result.success && result.data) {
                setUploadStatus('Bild erfolgreich hochgeladen!');
                // Construct the URL for the private image
                setUploadedImageUrl(`/images/${result.data.filename}`);
            } else {
                setUploadStatus('Fehler beim Hochladen: ' + result.message);
            }
        } catch (error) {
            setUploadStatus('Fehler beim Hochladen: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
        } finally {
            setIsUploading(false);
        }
    }

    function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (prevImage) {
            URL.revokeObjectURL(prevImage);
        }

        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setPrevImage(imageUrl);

            // Upload the image
            uploadImage(file);
        } else {
            setPrevImage(undefined);
            setUploadedImageUrl(null);
            setUploadStatus(null);
        }
    }

    useEffect(() => {
        return () => {
            if (prevImage) {
                URL.revokeObjectURL(prevImage);
            }
        };
    }, [prevImage]);

    return (
        <>
            <button className="btn btn-primary" onClick={() => inputRef?.current?.click()} disabled={isUploading}>
                {isUploading ? 'Hochladen...' : 'Bild wählen'}
            </button>
            <input type="file" className="input" onChange={handleImageChange} ref={inputRef} accept="image/*" hidden />

            {uploadStatus && (
                <div
                    className={`mt-2 rounded p-2 ${uploadStatus.includes('erfolgreich') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                    {uploadStatus}
                </div>
            )}

            {prevImage && !uploadedImageUrl && <img src={prevImage} className="mt-4 max-h-80 max-w-80" alt="Preview" />}
            {uploadedImageUrl && <img src={uploadedImageUrl} className="mt-4 max-h-80 max-w-80" alt="Uploaded Image" />}

            {uploadedImageUrl && (
                <div className="mt-2">
                    <p className="text-sm text-gray-600">Hochgeladenes Bild URL:</p>
                    <code className="rounded bg-gray-100 p-1 text-xs">{uploadedImageUrl}</code>
                </div>
            )}
        </>
    );
}

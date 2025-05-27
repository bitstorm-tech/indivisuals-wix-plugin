import React, { useRef, useState } from 'react';

interface UploadResponse {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
}

export default function ImagePicker() {
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
    const [previewImage, setPreviewImage] = useState<string | undefined>(undefined);
    const inputRef = useRef<HTMLInputElement>(null);

    async function uploadImage(): Promise<void> {
        if (!selectedFile) {
            return;
        }

        const formData = new FormData();
        formData.append('image', selectedFile);

        const response = await fetch('/upload-image', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        });

        const result: UploadResponse = await response.json();

        if (result.success) {
            setSelectedFile(undefined);
            setPreviewImage(undefined);
        }
    }

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (previewImage) {
            URL.revokeObjectURL(previewImage);
        }

        if (file) {
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
        } else {
            setSelectedFile(undefined);
            setPreviewImage(undefined);
        }
    }

    return (
        <>
            <div className="flex items-center space-x-2">
                <button className="btn btn-primary" onClick={() => inputRef?.current?.click()}>
                    Bild wählen
                </button>
                {selectedFile && (
                    <button className="btn btn-success" onClick={uploadImage} disabled={!selectedFile}>
                        Bild hochladen
                    </button>
                )}
            </div>
            <input type="file" className="input" onChange={handleFileChange} ref={inputRef} accept="image/*" hidden />

            {previewImage && (
                <div className="mt-4">
                    <p className="text-sm text-gray-600">Vorschau:</p>
                    <img src={previewImage} className="mt-2 max-h-80 max-w-80" alt="Preview" />
                </div>
            )}
        </>
    );
}

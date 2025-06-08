import React, { useEffect, useRef, useState } from 'react';

interface UploadResponse {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
    generated_image_url?: string;
}

interface Prompt {
    id: number;
    name: string;
    category: string;
    prompt: string;
    active: boolean;
}

interface ImagePickerProps {
    defaultPromptId?: number;
}

export default function ImagePicker({ defaultPromptId }: ImagePickerProps) {
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
    const [previewImage, setPreviewImage] = useState<string | undefined>(undefined);
    const [generatedImage, setGeneratedImage] = useState<string | undefined>(undefined);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [selectedPromptId, setSelectedPromptId] = useState<number | undefined>(defaultPromptId);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchPrompts();
    }, []);

    async function fetchPrompts(): Promise<void> {
        try {
            const response = await fetch('/prompts?active_only=true', {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (response.ok) {
                const promptsData: Prompt[] = await response.json();
                setPrompts(promptsData);
            }
        } catch (error) {
            console.error('Error fetching prompts:', error);
        }
    }

    async function uploadImage(): Promise<void> {
        if (!selectedFile) {
            return;
        }

        setIsProcessing(true);
        setGeneratedImage(undefined);

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            if (selectedPromptId) {
                formData.append('prompt_id', selectedPromptId.toString());
            }

            const response = await fetch('/upload-image', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const result: UploadResponse = await response.json();

            if (result.success && result.generated_image_url) {
                setGeneratedImage(result.generated_image_url);
                setSelectedFile(undefined);
                setPreviewImage(undefined);
            }
        } finally {
            setIsProcessing(false);
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
            setGeneratedImage(undefined);
        } else {
            setSelectedFile(undefined);
            setPreviewImage(undefined);
        }
    }

    return (
        <>
            <div className="space-y-4">
                <select
                    className="select select-bordered w-full max-w-xs"
                    value={selectedPromptId || ''}
                    onChange={(e) => setSelectedPromptId(e.target.value ? Number(e.target.value) : undefined)}
                    disabled={isProcessing}
                >
                    <option value="" disabled>
                        Bitte Stil auswählen...
                    </option>
                    {prompts.map((prompt) => (
                        <option key={prompt.id} value={prompt.id}>
                            {prompt.name}
                        </option>
                    ))}
                </select>

                <div className="flex items-center space-x-2">
                    <button className="btn btn-primary" onClick={() => inputRef?.current?.click()} disabled={isProcessing}>
                        Bild wählen
                    </button>
                    {selectedFile && (
                        <button className="btn btn-success" onClick={uploadImage} disabled={!selectedFile || !selectedPromptId || isProcessing}>
                            {isProcessing && <span className="loading loading-spinner loading-sm mr-2"></span>}
                            {isProcessing ? 'Wird bearbeitet...' : 'Bild hochladen'}
                        </button>
                    )}
                </div>
            </div>
            <input type="file" className="input" onChange={handleFileChange} ref={inputRef} accept="image/*" hidden />

            {isProcessing && (
                <div className="alert alert-info mt-4">
                    <span className="loading loading-spinner loading-md"></span>
                    <div>
                        <h3 className="font-bold">Bild wird bearbeitet</h3>
                        <div className="text-xs">Ihr Bild wird von der KI bearbeitet. Dies kann einen Moment dauern...</div>
                    </div>
                </div>
            )}

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

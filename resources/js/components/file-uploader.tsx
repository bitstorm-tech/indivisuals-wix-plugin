import React, { useRef } from 'react';

interface FileUploaderProps {
    selectedFile: File | undefined;
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onUpload: () => void;
    canUpload: boolean;
    isProcessing: boolean;
}

export default function FileUploader({ selectedFile, onFileChange, onUpload, canUpload, isProcessing }: FileUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex items-center space-x-2">
            <button className="btn btn-primary" onClick={() => inputRef?.current?.click()} disabled={isProcessing}>
                Bild wählen
            </button>
            {selectedFile && (
                <button className="btn btn-success" onClick={onUpload} disabled={!canUpload || isProcessing}>
                    {isProcessing && <span className="loading loading-spinner loading-sm mr-2"></span>}
                    {isProcessing ? 'Wird bearbeitet...' : 'Bild hochladen'}
                </button>
            )}
            <input type="file" className="input" onChange={onFileChange} ref={inputRef} accept="image/*" hidden />
        </div>
    );
}

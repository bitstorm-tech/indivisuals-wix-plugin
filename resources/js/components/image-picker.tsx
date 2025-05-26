import { useEffect, useRef, useState } from 'react';

export default function ImagePicker() {
    const [prevImage, setPrevImage] = useState<string | undefined>(undefined);
    const inputRef = useRef<HTMLInputElement>(null);

    function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (prevImage) {
            URL.revokeObjectURL(prevImage);
        }

        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setPrevImage(imageUrl);
        } else {
            setPrevImage(undefined);
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
            <button className="btn btn-primary" onClick={() => inputRef?.current?.click()}>
                Bild wählen
            </button>
            <input type="file" className="input" onChange={handleImageChange} ref={inputRef} accept="image/*" hidden />
            {prevImage && <img src={prevImage} className="mt-4 max-h-80 max-w-80" />}
        </>
    );
}

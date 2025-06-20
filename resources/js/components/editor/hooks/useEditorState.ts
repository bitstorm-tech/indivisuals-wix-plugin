import { EditorImage, EditorText } from '@/types/editor';
import { useCallback, useState } from 'react';

export function useEditorState() {
  const [images, setImages] = useState<EditorImage[]>([]);
  const [texts, setTexts] = useState<EditorText[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedElementType, setSelectedElementType] = useState<'image' | 'text' | null>(null);

  const addImage = useCallback((image: EditorImage) => {
    setImages((prev) => [...prev, image]);
  }, []);

  const updateImage = useCallback((id: string, updates: Partial<EditorImage>) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, ...updates } : img)));
  }, []);

  const deleteImage = useCallback(
    (id: string) => {
      setImages((prev) => prev.filter((img) => img.id !== id));
      if (selectedElementId === id) {
        setSelectedElementId(null);
        setSelectedElementType(null);
      }
    },
    [selectedElementId],
  );

  const addText = useCallback((text: EditorText) => {
    setTexts((prev) => [...prev, text]);
  }, []);

  const updateText = useCallback((id: string, updates: Partial<EditorText>) => {
    setTexts((prev) => prev.map((txt) => (txt.id === id ? { ...txt, ...updates } : txt)));
  }, []);

  const deleteText = useCallback(
    (id: string) => {
      setTexts((prev) => prev.filter((txt) => txt.id !== id));
      if (selectedElementId === id) {
        setSelectedElementId(null);
        setSelectedElementType(null);
      }
    },
    [selectedElementId],
  );

  const selectElement = useCallback((id: string, type: 'image' | 'text') => {
    setSelectedElementId(id);
    setSelectedElementType(type);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedElementId(null);
    setSelectedElementType(null);
  }, []);

  return {
    images,
    texts,
    selectedElementId,
    selectedElementType,
    addImage,
    updateImage,
    deleteImage,
    addText,
    updateText,
    deleteText,
    selectElement,
    clearSelection,
  };
}

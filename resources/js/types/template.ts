export interface TemplatePosition {
  x: number;
  y: number;
}

export interface TemplateSize {
  width: number;
  height: number;
}

export interface TemplateImage {
  id: string;
  file: File;
  url: string;
  position: TemplatePosition;
  size: TemplateSize;
  zIndex: number;
}

export interface DragState {
  isDragging: boolean;
  dragType: 'move' | 'resize';
  startPosition: TemplatePosition;
  startSize?: TemplateSize;
  offset: TemplatePosition;
  resizeHandle?: ResizeHandle;
}

export interface ResizeHandle {
  type: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';
  cursor: string;
}

export interface TemplateCanvasProps {
  images: TemplateImage[];
  onImageUpdate: (id: string, updates: Partial<TemplateImage>) => void;
  onImageDelete: (id: string) => void;
  canvasSize: TemplateSize;
}

export interface TemplateEditorState {
  images: TemplateImage[];
  selectedImageId: string | null;
  maxImages: number;
}
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

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
}

export interface TemplateText {
  id: string;
  content: string;
  position: TemplatePosition;
  size: TemplateSize;
  style: TextStyle;
  zIndex: number;
}

export type TemplateElement = TemplateImage | TemplateText;

export const POPULAR_FONTS = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
  'Impact',
  'Comic Sans MS',
  'Trebuchet MS',
  'Palatino'
] as const;

export type PopularFont = typeof POPULAR_FONTS[number];

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
  texts: TemplateText[];
  onImageUpdate: (id: string, updates: Partial<TemplateImage>) => void;
  onImageDelete: (id: string) => void;
  onTextUpdate: (id: string, updates: Partial<TemplateText>) => void;
  onTextDelete: (id: string) => void;
  canvasSize: TemplateSize;
}

export interface TemplateEditorState {
  images: TemplateImage[];
  texts: TemplateText[];
  selectedElementId: string | null;
  selectedElementType: 'image' | 'text' | null;
  maxImages: number;
}
export interface EditorPosition {
  x: number;
  y: number;
}

export interface EditorSize {
  width: number;
  height: number;
}

export interface EditorImage {
  id: string;
  file: File;
  url: string;
  position: EditorPosition;
  size: EditorSize;
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

export interface EditorText {
  id: string;
  content: string;
  position: EditorPosition;
  size: EditorSize;
  style: TextStyle;
  zIndex: number;
}

export type EditorElement = EditorImage | EditorText;

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
  'Palatino',
] as const;

export type PopularFont = (typeof POPULAR_FONTS)[number];

export interface DragState {
  isDragging: boolean;
  dragType: 'move' | 'resize';
  startPosition: EditorPosition;
  startSize?: EditorSize;
  offset: EditorPosition;
  resizeHandle?: ResizeHandle;
  aspectRatio?: number;
}

export interface ResizeHandle {
  type: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';
  cursor: string;
}

export interface EditorCanvasProps {
  images: EditorImage[];
  texts: EditorText[];
  onImageUpdate: (id: string, updates: Partial<EditorImage>) => void;
  onImageDelete: (id: string) => void;
  onTextUpdate: (id: string, updates: Partial<EditorText>) => void;
  onTextDelete: (id: string) => void;
  canvasSize: EditorSize;
}

export interface ExportResolution {
  id: string;
  name: string;
  width: number;
  height: number;
  description?: string;
}

export const EXPORT_RESOLUTIONS: readonly ExportResolution[] = [
  {
    id: 'original',
    name: 'Original (800×600)',
    width: 800,
    height: 600,
    description: 'Gleiche Größe wie Editor',
  },
  {
    id: 'hd',
    name: 'HD (1280×720)',
    width: 1280,
    height: 720,
    description: 'High Definition',
  },
  {
    id: 'fullhd',
    name: 'Full HD (1920×1080)',
    width: 1920,
    height: 1080,
    description: 'Full High Definition',
  },
  {
    id: '2k',
    name: '2K (2560×1440)',
    width: 2560,
    height: 1440,
    description: 'Quad HD',
  },
  {
    id: '4k',
    name: '4K (3840×2160)',
    width: 3840,
    height: 2160,
    description: 'Ultra High Definition',
  },
] as const;

export type ExportResolutionId = (typeof EXPORT_RESOLUTIONS)[number]['id'];

export interface ExportSettings {
  resolution: ExportResolutionId;
  quality: number; // 0-1 for JPEG quality
  format: 'png' | 'jpeg' | 'webp';
  pixelRatio?: number; // For retina displays
}

export interface EditorState {
  images: EditorImage[];
  texts: EditorText[];
  selectedElementId: string | null;
  selectedElementType: 'image' | 'text' | null;
  maxImages: number;
  backgroundColor: string;
  exportSettings: ExportSettings;
}

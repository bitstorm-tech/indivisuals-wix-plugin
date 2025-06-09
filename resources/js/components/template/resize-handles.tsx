import { ResizeHandle } from '../../types/template';

interface ResizeHandlesProps {
  onResizeStart: (handle: ResizeHandle, event: React.MouseEvent) => void;
}

const RESIZE_HANDLES: ResizeHandle[] = [
  { type: 'nw', cursor: 'nw-resize' },
  { type: 'ne', cursor: 'ne-resize' },
  { type: 'sw', cursor: 'sw-resize' },
  { type: 'se', cursor: 'se-resize' },
  { type: 'n', cursor: 'n-resize' },
  { type: 's', cursor: 's-resize' },
  { type: 'e', cursor: 'e-resize' },
  { type: 'w', cursor: 'w-resize' },
];

const getHandleStyle = (type: string) => {
  const baseStyle = 'absolute w-2 h-2 bg-blue-500 border border-white rounded-sm hover:bg-blue-600';
  
  switch (type) {
    case 'nw': return `${baseStyle} -top-1 -left-1 cursor-nw-resize`;
    case 'ne': return `${baseStyle} -top-1 -right-1 cursor-ne-resize`;
    case 'sw': return `${baseStyle} -bottom-1 -left-1 cursor-sw-resize`;
    case 'se': return `${baseStyle} -bottom-1 -right-1 cursor-se-resize`;
    case 'n': return `${baseStyle} -top-1 left-1/2 -translate-x-1/2 cursor-n-resize`;
    case 's': return `${baseStyle} -bottom-1 left-1/2 -translate-x-1/2 cursor-s-resize`;
    case 'e': return `${baseStyle} -right-1 top-1/2 -translate-y-1/2 cursor-e-resize`;
    case 'w': return `${baseStyle} -left-1 top-1/2 -translate-y-1/2 cursor-w-resize`;
    default: return baseStyle;
  }
};

export default function ResizeHandles({ onResizeStart }: ResizeHandlesProps) {
  return (
    <>
      {RESIZE_HANDLES.map((handle) => (
        <div
          key={handle.type}
          className={getHandleStyle(handle.type)}
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(handle, e);
          }}
        />
      ))}
    </>
  );
}
import React, { useCallback, useRef, useState } from 'react';
import { DragState, ResizeHandle, TemplateImage, TemplatePosition, TemplateSize } from '../../types/template';
import { Button } from '../ui/button';
import ResizeHandles from './resize-handles';

interface DraggableImageProps {
  image: TemplateImage;
  isSelected: boolean;
  onUpdate: (updates: Partial<TemplateImage>) => void;
  onSelect: () => void;
  onDelete: () => void;
  canvasSize: TemplateSize;
}

export default function DraggableImage({ image, isSelected, onUpdate, onSelect, onDelete, canvasSize }: DraggableImageProps) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [visualTransform, setVisualTransform] = useState<{ x: number; y: number; scale: number }>({ x: 0, y: 0, scale: 1 });
  const imageRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const canvasRectRef = useRef<DOMRect | null>(null);

  const constrainPosition = useCallback(
    (pos: TemplatePosition): TemplatePosition => {
      const maxX = canvasSize.width - image.size.width;
      const maxY = canvasSize.height - image.size.height;

      return {
        x: Math.max(0, Math.min(maxX, pos.x)),
        y: Math.max(0, Math.min(maxY, pos.y)),
      };
    },
    [canvasSize, image.size],
  );

  const constrainSize = useCallback(
    (size: TemplateSize): TemplateSize => {
      const minSize = 50;
      const maxWidth = canvasSize.width - image.position.x;
      const maxHeight = canvasSize.height - image.position.y;

      return {
        width: Math.max(minSize, Math.min(maxWidth, size.width)),
        height: Math.max(minSize, Math.min(maxHeight, size.height)),
      };
    },
    [canvasSize, image.position],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target !== e.currentTarget && !(e.target as Element).closest('.image-content')) return;

      e.preventDefault();
      onSelect();

      // Cache canvas rect for performance
      const canvas = imageRef.current?.parentElement;
      if (canvas) {
        canvasRectRef.current = canvas.getBoundingClientRect();
      }

      const rect = imageRef.current?.getBoundingClientRect();
      if (!rect) return;

      const offset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      // Start with visual positioning only (no scale feedback)
      setVisualTransform({ x: 0, y: 0, scale: 1 });

      setDragState({
        isDragging: true,
        dragType: 'move',
        startPosition: image.position,
        offset,
        resizeHandle: undefined,
      });
    },
    [image.position, onSelect],
  );

  const handleResizeStart = useCallback(
    (handle: ResizeHandle, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onSelect();

      // Cache canvas rect for performance
      const canvas = imageRef.current?.parentElement;
      if (canvas) {
        canvasRectRef.current = canvas.getBoundingClientRect();
      }

      // Visual positioning for resize (no scale feedback)
      setVisualTransform({ x: 0, y: 0, scale: 1 });

      setDragState({
        isDragging: true,
        dragType: 'resize',
        startPosition: image.position,
        startSize: image.size,
        offset: { x: e.clientX, y: e.clientY },
        resizeHandle: handle,
      });
    },
    [image.position, image.size, onSelect],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState || !canvasRectRef.current) return;

      // Cancel any pending RAF to prevent stacking
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Use RAF for smooth updates
      rafRef.current = requestAnimationFrame(() => {
        if (!dragState || !canvasRectRef.current) return;

        if (dragState.dragType === 'move') {
          const targetX = e.clientX - canvasRectRef.current.left - dragState.offset.x;
          const targetY = e.clientY - canvasRectRef.current.top - dragState.offset.y;

          // Update visual transform immediately for smoothness
          const deltaX = targetX - image.position.x;
          const deltaY = targetY - image.position.y;
          setVisualTransform((prev) => ({ ...prev, x: deltaX, y: deltaY }));

          // Constrain and update actual position
          const newPosition = constrainPosition({ x: targetX, y: targetY });
          onUpdate({ position: newPosition });
        } else if (dragState.dragType === 'resize' && dragState.resizeHandle && dragState.startSize) {
          const deltaX = e.clientX - dragState.offset.x;
          const deltaY = e.clientY - dragState.offset.y;

          let newSize = { ...dragState.startSize };
          let newPosition = { ...dragState.startPosition };

          const handle = dragState.resizeHandle.type;

          if (handle.includes('e')) newSize.width += deltaX;
          if (handle.includes('w')) {
            newSize.width -= deltaX;
            newPosition.x += deltaX;
          }
          if (handle.includes('s')) newSize.height += deltaY;
          if (handle.includes('n')) {
            newSize.height -= deltaY;
            newPosition.y += deltaY;
          }

          newSize = constrainSize(newSize);
          newPosition = constrainPosition(newPosition);

          onUpdate({ size: newSize, position: newPosition });
        }
      });
    },
    [dragState, image.position, constrainPosition, constrainSize, onUpdate],
  );

  const handleMouseUp = useCallback(() => {
    // Cancel any pending RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // Reset visual transform with smooth transition
    setVisualTransform({ x: 0, y: 0, scale: 1 });
    setDragState(null);
  }, []);

  React.useEffect(() => {
    if (dragState?.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = dragState.dragType === 'move' ? 'grabbing' : 'resizing';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';

        // Cancel any pending RAF on cleanup
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      };
    }
  }, [dragState, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={imageRef}
      className={`absolute border-2 ${isSelected ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-gray-300'} ${
        dragState?.isDragging ? 'transition-none' : 'transition-all duration-150 ease-out'
      } group cursor-move`}
      style={{
        left: image.position.x,
        top: image.position.y,
        width: image.size.width,
        height: image.size.height,
        zIndex: image.zIndex + (isSelected ? 1000 : 0),
        transform: `translate3d(${visualTransform.x}px, ${visualTransform.y}px, 0) scale(${visualTransform.scale})`,
        willChange: dragState?.isDragging ? 'transform' : 'auto',
        transformOrigin: 'center center',
      }}
      onMouseDown={handleMouseDown}
      onClick={onSelect}
    >
      <img src={image.url} alt="Template Bild" className="image-content pointer-events-none h-full w-full object-contain" draggable={false} />

      {isSelected && (
        <>
          <ResizeHandles onResizeStart={handleResizeStart} />
          <Button
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 p-0 text-xs opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            ×
          </Button>
        </>
      )}
    </div>
  );
}

import React, { useCallback, useRef, useState } from 'react';
import { DragState, ResizeHandle, TemplatePosition, TemplateSize, TemplateText } from '../../types/template';
import { Button } from '../ui/button';
import ResizeHandles from './resize-handles';

interface DraggableTextProps {
  text: TemplateText;
  isSelected: boolean;
  onUpdate: (updates: Partial<TemplateText>) => void;
  onSelect: () => void;
  onDelete: () => void;
  canvasSize: TemplateSize;
}

export default function DraggableText({ text, isSelected, onUpdate, onSelect, onDelete, canvasSize }: DraggableTextProps) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [visualTransform, setVisualTransform] = useState<{ x: number; y: number; scale: number }>({ x: 0, y: 0, scale: 1 });
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const canvasRectRef = useRef<DOMRect | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const constrainPosition = useCallback(
    (pos: TemplatePosition): TemplatePosition => {
      const maxX = canvasSize.width - text.size.width;
      const maxY = canvasSize.height - text.size.height;

      return {
        x: Math.max(0, Math.min(maxX, pos.x)),
        y: Math.max(0, Math.min(maxY, pos.y)),
      };
    },
    [canvasSize, text.size],
  );

  const constrainSize = useCallback(
    (size: TemplateSize): TemplateSize => {
      const minSize = 50;
      const maxWidth = canvasSize.width - text.position.x;
      const maxHeight = canvasSize.height - text.position.y;

      return {
        width: Math.max(minSize, Math.min(maxWidth, size.width)),
        height: Math.max(minSize, Math.min(maxHeight, size.height)),
      };
    },
    [canvasSize, text.position],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isEditing) return;
      if (e.target !== e.currentTarget && !(e.target as Element).closest('.text-content')) return;

      e.preventDefault();
      onSelect();

      // Cache canvas rect for performance
      const canvas = textRef.current?.parentElement;
      if (canvas) {
        canvasRectRef.current = canvas.getBoundingClientRect();
      }

      const rect = textRef.current?.getBoundingClientRect();
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
        startPosition: text.position,
        offset,
        resizeHandle: undefined,
      });
    },
    [text.position, onSelect, isEditing],
  );

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
    setTimeout(() => {
      if (editRef.current) {
        // Set initial content directly on the DOM element
        editRef.current.textContent = text.content;
        editRef.current.focus();
        const range = document.createRange();
        range.selectNodeContents(editRef.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 0);
  }, [text.content]);

  const handleTextEdit = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      const newContent = e.currentTarget.textContent || '';
      
      // Clear existing timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      // Debounce the update to prevent rapid re-renders
      updateTimeoutRef.current = setTimeout(() => {
        onUpdate({ content: newContent });
      }, 300); // Only update after 300ms of no changes
    },
    [onUpdate],
  );

  const handleEditBlur = useCallback(() => {
    // Clear timeout and immediately update on blur
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    if (editRef.current) {
      onUpdate({ content: editRef.current.textContent || '' });
    }
    setIsEditing(false);
  }, [onUpdate]);

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Clear timeout and immediately update on Enter
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (editRef.current) {
        onUpdate({ content: editRef.current.textContent || '' });
      }
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      // Clear timeout and revert on Escape
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      setIsEditing(false);
    }
  }, [onUpdate]);

  const handleResizeStart = useCallback(
    (handle: ResizeHandle, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onSelect();

      // Cache canvas rect for performance
      const canvas = textRef.current?.parentElement;
      if (canvas) {
        canvasRectRef.current = canvas.getBoundingClientRect();
      }

      // Visual positioning for resize (no scale feedback)
      setVisualTransform({ x: 0, y: 0, scale: 1 });

      setDragState({
        isDragging: true,
        dragType: 'resize',
        startPosition: text.position,
        startSize: text.size,
        offset: { x: e.clientX, y: e.clientY },
        resizeHandle: handle,
      });
    },
    [text.position, text.size, onSelect],
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
          const deltaX = targetX - text.position.x;
          const deltaY = targetY - text.position.y;
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
    [dragState, text.position, constrainPosition, constrainSize, onUpdate],
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

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={textRef}
      className={`absolute border-2 ${isSelected ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-gray-300'} ${
        dragState?.isDragging ? 'transition-none' : 'transition-all duration-150 ease-out'
      } group cursor-move ${isEditing ? 'cursor-text' : ''}`}
      style={{
        left: text.position.x,
        top: text.position.y,
        width: text.size.width,
        height: text.size.height,
        zIndex: text.zIndex + (isSelected ? 1000 : 0),
        transform: `translate3d(${visualTransform.x}px, ${visualTransform.y}px, 0) scale(${visualTransform.scale})`,
        willChange: dragState?.isDragging ? 'transform' : 'auto',
        transformOrigin: 'center center',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onClick={onSelect}
    >
      {isEditing ? (
        <div
          ref={editRef}
          contentEditable
          suppressContentEditableWarning
          className="text-content h-full w-full resize-none overflow-hidden p-2 outline-none"
          style={{
            fontFamily: text.style.fontFamily,
            fontSize: `${text.style.fontSize}px`,
            color: text.style.color,
            fontWeight: text.style.fontWeight,
            fontStyle: text.style.fontStyle,
            textAlign: text.style.textAlign,
            lineHeight: '1.2',
            unicodeBidi: 'embed',
            writingMode: 'horizontal-tb',
          }}
          onInput={handleTextEdit}
          onBlur={handleEditBlur}
          onKeyDown={handleEditKeyDown}
        />
      ) : (
        <div
          className="text-content pointer-events-none h-full w-full overflow-hidden p-2"
          style={{
            fontFamily: text.style.fontFamily,
            fontSize: `${text.style.fontSize}px`,
            color: text.style.color,
            fontWeight: text.style.fontWeight,
            fontStyle: text.style.fontStyle,
            textAlign: text.style.textAlign,
            lineHeight: '1.2',
            unicodeBidi: 'embed',
            writingMode: 'horizontal-tb',
          }}
        >
          {text.content || 'Doppelklick zum Bearbeiten'}
        </div>
      )}

      {isSelected && !isEditing && (
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

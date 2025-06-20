# Editor Component

A React-based image editor component for AI-powered image generation and editing, built with TypeScript and Tailwind CSS.

## Overview

The Editor component provides a complete image editing interface with AI-driven features, prompt management, and canvas-based editing capabilities. It's designed to work with the Laravel backend for image processing and storage.

## Architecture

### Core Components

#### Canvas

- **EditorCanvas** (`components/canvas/EditorCanvas.tsx`): Main canvas component for image and text editing
  - Currently displays placeholder content
  - Manages image and text elements
  - Handles element selection and manipulation

#### Sidebar Components

- **CategoryFilter** (`components/sidebar/CategoryFilter.tsx`): Filter prompts by category
- **ImagePreviewList** (`components/sidebar/ImagePreviewList.tsx`): Preview selected images
- **InstructionsPanel** (`components/sidebar/InstructionsPanel.tsx`): User instructions and help
- **PromptList** (`components/sidebar/PromptList.tsx`): List of available AI prompts

#### Utility Components

- **EditorImageUploader** (`components/EditorImageUploader.tsx`): File upload component
- **ImageGenerationSection** (`components/ImageGenerationSection.tsx`): AI image generation interface
- **TextAdder** (`components/TextAdder.tsx`): Add text elements to canvas
- **UserImageSelectorDialog** (`components/UserImageSelectorDialog.tsx`): Image selection dialog

## Hooks

### useEditorState

Main state management hook for the editor.

**State:**

- `images: EditorImage[]` - Array of images on canvas
- `texts: EditorText[]` - Array of text elements on canvas
- `selectedElementId: string | null` - Currently selected element ID
- `selectedElementType: 'image' | 'text' | null` - Type of selected element

**Methods:**

- `addImage(image)` - Add image to canvas
- `updateImage(id, updates)` - Update image properties
- `deleteImage(id)` - Remove image from canvas
- `addText(text)` - Add text element to canvas
- `updateText(id, updates)` - Update text properties
- `deleteText(id)` - Remove text element
- `selectElement(id, type)` - Select canvas element
- `clearSelection()` - Clear element selection

### usePrompts

Manages AI prompts and categories.

**State:**

- `prompts: Prompt[]` - All available prompts
- `filteredPrompts: Prompt[]` - Prompts filtered by category
- `categories: string[]` - Available prompt categories
- `selectedPromptId: number | null` - Currently selected prompt
- `selectedPrompt: Prompt | undefined` - Selected prompt object
- `selectedCategory: string` - Active category filter
- `isLoading: boolean` - Loading state
- `error: string | null` - Error state

**Methods:**

- `setSelectedPromptId(id)` - Select a prompt
- `setSelectedCategory(category)` - Filter by category

### useSelectedImages

Manages image selection for processing.

**Configuration:**

- `maxImages: number` - Maximum selectable images (default: 3)

**State:**

- `selectedImages: SelectedImage[]` - Selected images with URL and File
- `isImageSelectorOpen: boolean` - Image selector dialog state
- `currentCount: number` - Number of selected images
- `remainingSlots: number` - Available image slots
- `canAddMore: boolean` - Whether more images can be added

**Methods:**

- `addImage(url, file)` - Add image to selection
- `removeImage(index)` - Remove image by index
- `clearImages()` - Clear all selected images
- `openImageSelector()` - Open image selection dialog
- `closeImageSelector()` - Close image selection dialog

## Constants

**MAX_IMAGES**: Maximum number of images that can be selected (3)

**EDITOR_MESSAGES**: Localized messages for the editor interface

## Usage Example

```tsx
import { useEditorState, usePrompts, useSelectedImages } from './hooks';
import EditorCanvas from './components/canvas/EditorCanvas';
import PromptList from './components/sidebar/PromptList';

function EditorPage() {
  const editorState = useEditorState();
  const promptsState = usePrompts();
  const imagesState = useSelectedImages();

  return (
    <div className="flex h-screen">
      <div className="w-1/4 p-4">
        <PromptList
          prompts={promptsState.filteredPrompts}
          selectedPromptId={promptsState.selectedPromptId}
          onSelectPrompt={promptsState.setSelectedPromptId}
        />
      </div>
      <div className="flex-1">
        <EditorCanvas
          images={editorState.images}
          texts={editorState.texts}
          selectedElementId={editorState.selectedElementId}
          selectedElementType={editorState.selectedElementType}
          onImageUpdate={editorState.updateImage}
          onImageDelete={editorState.deleteImage}
          onTextUpdate={editorState.updateText}
          onTextDelete={editorState.deleteText}
          onSelectElement={editorState.selectElement}
          onClearSelection={editorState.clearSelection}
        />
      </div>
    </div>
  );
}
```

## Development Notes

- All components use TypeScript with strict typing
- Hooks follow React best practices with useCallback for performance
- Image processing integrates with Laravel backend via API routes
- File uploads are handled securely with validation
- Canvas implementation is currently a placeholder for future development

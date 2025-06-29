# Editor Page Simplification Proposal

The current implementation of the editor page (`resources/js/pages/editor.tsx`) uses a common pattern where a single parent component, `EditorNewPage`, acts as a "god component," managing all the state and logic for the entire multi-step wizard. While functional, this leads to significant complexity within that single file.

## Current Issues

*   **Extensive State Management:** Numerous `useState` calls and a large state object are managed by the `useWizardNavigation` hook, making the state difficult to track.
*   **Prop Drilling:** State values and handler functions are passed down through multiple layers of components (e.g., from `EditorNewPage` to `WizardNavigationButtons` and various step components). This makes component reuse and refactoring cumbersome.
*   **Mixed Concerns:** The main page component handles UI layout, step rendering, data fetching, and business logic (like user registration) simultaneously, violating the Single Responsibility Principle.

## Proposed Simplification: Using a Wizard Context

The core of the simplification is to introduce a **React Context** to manage the wizard's state and logic. This will centralize state management and make it available to any component within the wizard without prop drilling.

### 1. Create a `WizardProvider` and a `useWizard` Hook

-   A new `WizardContext` will be created to hold the entire state of the wizard: `currentStep`, `uploadedImage`, `selectedPrompt`, `userData`, `isProcessing`, etc.
-   A `WizardProvider` component will wrap the entire editor page. It will contain all the state management logic and the handler functions (`handleImageUpload`, `handleNext`, `handleUserRegistration`, etc.) that are currently in `EditorNewPage`.
-   A custom hook, `useWizard()`, will be created to allow any child component to easily access the wizard's state and actions from the context.

### 2. Refactor the Main Page (`editor.tsx`)

-   `EditorNewPage` will become much leaner. Its primary responsibility will be to render the layout and wrap the wizard UI in the `WizardProvider`.
-   It will no longer need to manage the wizard's state directly or pass down dozens of props.

### 3. Simplify Step and Navigation Components

-   Components like `ImageUploadStep`, `PromptSelectionStep`, and `WizardNavigationButtons` will no longer receive a long list of props.
-   Instead, they will call the `useWizard()` hook to get the data they need and the functions they need to call.

### Example of a Simplified Component

**Before (Current):**

```tsx
// WizardNavigationButtons.tsx
export default function WizardNavigationButtons({
  currentStep,
  canGoNext,
  onNext,
  isProcessing
  // ... and many other props
}) {
  // ...
}
```

**After (Simplified):**

```tsx
// WizardNavigationButtons.tsx
import { useWizard } from '@/components/editor/hooks/useWizard';

export default function WizardNavigationButtons() {
  const { currentStep, canGoNext, goNext, isProcessing } = useWizard();
  // ...
}
```

## Benefits of this Approach

*   **Eliminates Prop Drilling:** Makes the component tree cleaner and easier to refactor.
*   **Decouples Components:** Components become more self-contained and less dependent on their parent's implementation.
*   **Improves Readability:** `EditorNewPage` becomes a simple layout component, and the logic is co-located with the state in the `WizardProvider`.
*   **Centralized Logic:** All wizard-related logic is in one place, making it easier to manage, test, and debug the flow.

This refactoring will result in a more scalable, maintainable, and idiomatic React application structure.

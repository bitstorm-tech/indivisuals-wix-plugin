import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import PromptTableRow from './PromptTableRow';

interface Prompt {
  id: number;
  name: string;
  category: string;
  prompt: string;
  active: boolean;
  has_example_image?: boolean;
}

interface PromptTableProps {
  prompts: Prompt[];
  editingPrompts: Record<number, Prompt>;
  categories: string[];
  isEditing: (promptId: number) => boolean;
  hasChanges: (prompt: Prompt) => boolean;
  onEdit: (prompt: Prompt) => void;
  onCancel: (promptId: number) => void;
  onSave: (promptId: number) => void;
  onDelete: (promptId: number) => void;
  onTest: (promptId: number) => void;
  onInputChange: (promptId: number, field: keyof Prompt, value: string | boolean) => void;
}

export default function PromptTable({
  prompts,
  editingPrompts,
  categories,
  isEditing,
  hasChanges,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onTest,
  onInputChange,
}: PromptTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Active</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Example</TableHead>
            <TableHead>Prompt</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prompts.map((prompt) => (
            <PromptTableRow
              key={prompt.id}
              prompt={prompt}
              isEditing={isEditing(prompt.id)}
              hasChanges={hasChanges(prompt)}
              editedPrompt={editingPrompts[prompt.id]}
              categories={categories}
              onEdit={onEdit}
              onCancel={onCancel}
              onSave={onSave}
              onDelete={onDelete}
              onTest={onTest}
              onInputChange={onInputChange}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

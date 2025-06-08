import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableCell, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

interface Prompt {
  id: number;
  name: string;
  category: string;
  prompt: string;
  active: boolean;
}

interface PromptTableRowProps {
  prompt: Prompt;
  isEditing: boolean;
  hasChanges: boolean;
  editedPrompt: Prompt | undefined;
  categories: string[];
  onEdit: (prompt: Prompt) => void;
  onCancel: (promptId: number) => void;
  onSave: (promptId: number) => void;
  onDelete: (promptId: number) => void;
  onTest: (promptId: number) => void;
  onInputChange: (promptId: number, field: keyof Prompt, value: string) => void;
}

export default function PromptTableRow({
  prompt,
  isEditing,
  hasChanges,
  editedPrompt,
  categories,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onTest,
  onInputChange,
}: PromptTableRowProps) {
  const currentPrompt = isEditing && editedPrompt ? editedPrompt : prompt;

  return (
    <TableRow>
      <TableCell>
        {isEditing ? (
          <Input
            type="text"
            value={currentPrompt.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange(prompt.id, 'name', e.target.value)}
          />
        ) : (
          <span>{prompt.name}</span>
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Select value={currentPrompt.category} onValueChange={(value) => onInputChange(prompt.id, 'category', value)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span>{prompt.category}</span>
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Textarea
            rows={3}
            value={currentPrompt.prompt}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onInputChange(prompt.id, 'prompt', e.target.value)}
          />
        ) : (
          <span className="block max-w-md truncate" title={prompt.prompt}>
            {prompt.prompt}
          </span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant={!hasChanges ? 'outline' : 'default'} size="sm" onClick={() => onSave(prompt.id)} disabled={!hasChanges}>
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onCancel(prompt.id)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(prompt.id)}>
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button variant="default" size="sm" onClick={() => onEdit(prompt)}>
                Edit
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onTest(prompt.id)}>
                Test
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
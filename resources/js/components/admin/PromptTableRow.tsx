import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { TableCell, TableRow } from '@/components/ui/Table';
import { Textarea } from '@/components/ui/Textarea';

interface Prompt {
  id: number;
  name: string;
  category: string;
  prompt: string;
  active: boolean;
  has_example_image?: boolean;
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
  onInputChange: (promptId: number, field: keyof Prompt, value: string | boolean) => void;
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
          <Checkbox checked={currentPrompt.active} onCheckedChange={(checked) => onInputChange(prompt.id, 'active', checked ? 'true' : 'false')} />
        ) : (
          <span className={prompt.active ? 'text-green-600' : 'text-red-600'}>{prompt.active ? 'Yes' : 'No'}</span>
        )}
      </TableCell>
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
        {prompt.has_example_image ? (
          <img src={`/prompts/${prompt.id}/example-image`} alt="Example" className="h-16 w-16 rounded object-cover" loading="lazy" />
        ) : (
          <span className="text-sm text-gray-500">None</span>
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

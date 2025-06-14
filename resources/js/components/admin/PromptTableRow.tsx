import { Button } from '@/components/ui/Button';
import { TableCell, TableRow } from '@/components/ui/Table';
import { Prompt } from '@/types/prompt';

interface PromptTableRowProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onDelete: (promptId: number) => void;
  onTest: (promptId: number) => void;
}

export default function PromptTableRow({ prompt, onEdit, onDelete, onTest }: PromptTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <span className={prompt.active ? 'text-green-600' : 'text-red-600'}>{prompt.active ? 'Yes' : 'No'}</span>
      </TableCell>
      <TableCell>
        <span>{prompt.name}</span>
      </TableCell>
      <TableCell>
        <span>{prompt.category}</span>
      </TableCell>
      <TableCell>
        {prompt.example_image_url ? (
          <img
            src={`${prompt.example_image_url}?t=${Date.now()}`}
            alt="Example"
            className="h-16 w-auto rounded object-cover"
            style={{ aspectRatio: '16/9' }}
            loading="lazy"
          />
        ) : (
          <span className="text-sm text-gray-500">None</span>
        )}
      </TableCell>
      <TableCell>
        <span className="block max-w-md truncate" title={prompt.prompt}>
          {prompt.prompt}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button variant="default" size="sm" onClick={() => onEdit(prompt)}>
            Edit
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onTest(prompt.id)}>
            Test
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(prompt.id)}>
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

import { Button } from '@/components/ui/Button';
import { TableCell, TableRow } from '@/components/ui/Table';
import { Prompt } from '@/types/prompt';
import { Edit, Play, Trash2 } from 'lucide-react';

interface PromptTableRowProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onDelete: (promptId: number) => void;
  onTest: (promptId: number) => void;
}

function PromptTableRow({ prompt, onEdit, onDelete, onTest }: PromptTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <span className={prompt.active ? 'text-green-600' : 'text-red-600'}>{prompt.active ? 'Yes' : 'No'}</span>
      </TableCell>
      <TableCell>
        <span>{prompt.name}</span>
      </TableCell>
      <TableCell>
        <span>
          {prompt.category?.name || '-'}
          {prompt.subcategory && <span className="text-sm text-gray-500"> / {prompt.subcategory.name}</span>}
        </span>
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
          <Button variant="ghost" size="sm" onClick={() => onEdit(prompt)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onTest(prompt.id)}>
            <Play className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(prompt.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default PromptTableRow;

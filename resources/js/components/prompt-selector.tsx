import { Prompt } from '../types/image-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface PromptSelectorProps {
  prompts: Prompt[];
  selectedPromptId: number | undefined;
  onPromptChange: (promptId: number | undefined) => void;
  disabled?: boolean;
}

export default function PromptSelector({ prompts, selectedPromptId, onPromptChange, disabled = false }: PromptSelectorProps) {
  return (
    <Select
      value={selectedPromptId?.toString() || ''}
      onValueChange={(value) => onPromptChange(value ? Number(value) : undefined)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full max-w-xs">
        <SelectValue placeholder="Bitte Stil auswählen..." />
      </SelectTrigger>
      <SelectContent>
        {prompts.map((prompt) => (
          <SelectItem key={prompt.id} value={prompt.id.toString()}>
            {prompt.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

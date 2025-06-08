import { Prompt } from '../types/image-picker';

interface PromptSelectorProps {
  prompts: Prompt[];
  selectedPromptId: number | undefined;
  onPromptChange: (promptId: number | undefined) => void;
  disabled?: boolean;
}

export default function PromptSelector({ prompts, selectedPromptId, onPromptChange, disabled = false }: PromptSelectorProps) {
  return (
    <select
      className="select select-bordered w-full max-w-xs"
      value={selectedPromptId || ''}
      onChange={(e) => onPromptChange(e.target.value ? Number(e.target.value) : undefined)}
      disabled={disabled}
    >
      <option value="" disabled>
        Bitte Stil auswählen...
      </option>
      {prompts.map((prompt) => (
        <option key={prompt.id} value={prompt.id}>
          {prompt.name}
        </option>
      ))}
    </select>
  );
}

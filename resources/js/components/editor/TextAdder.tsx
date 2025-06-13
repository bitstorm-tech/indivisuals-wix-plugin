import { Type } from 'lucide-react';
import { Button } from '../ui/Button';

interface TextAdderProps {
  onAddText: () => void;
}

export default function TextAdder({ onAddText }: TextAdderProps) {
  return (
    <Button variant="outline" size="sm" onClick={onAddText}>
      <Type className="mr-2 h-4 w-4" />
      Text hinzufügen
    </Button>
  );
}

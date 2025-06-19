import { Button } from '@/components/ui/Button';
import { Type } from 'lucide-react';

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

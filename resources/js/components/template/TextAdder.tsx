import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface TextAdderProps {
  onAddText: () => void;
  disabled?: boolean;
}

export default function TextAdder({ onAddText, disabled = false }: TextAdderProps) {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Text hinzufügen</h4>
        </div>

        <div
          className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            disabled ? 'cursor-not-allowed border-gray-200 bg-gray-50' : 'cursor-pointer border-gray-300 hover:border-gray-400'
          } `}
          onClick={() => !disabled && onAddText()}
        >
          {disabled ? (
            <div className="text-gray-400">
              <div className="mb-2 text-2xl">📝</div>
              <div>Text deaktiviert</div>
            </div>
          ) : (
            <div className="text-gray-600">
              <div className="mb-2 text-2xl">📝</div>
              <div className="font-medium">Text hinzufügen</div>
              <div className="text-sm">Klicken zum Erstellen</div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onAddText} disabled={disabled} className="flex-1">
            📝 Text erstellen
          </Button>
        </div>

        <div className="text-xs text-gray-500">Doppelklick auf Text zum Bearbeiten</div>
      </div>
    </Card>
  );
}

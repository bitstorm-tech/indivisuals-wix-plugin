import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import React from 'react';

export default React.memo(function InstructionsPanel() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="instructions" className="border-0">
        <AccordionTrigger className="py-3 text-sm font-medium text-gray-700 hover:no-underline">Anleitung & Tipps</AccordionTrigger>
        <AccordionContent className="pb-4">
          <div className="space-y-3">
            <div className="space-y-1 text-xs text-gray-600">
              <div className="font-medium text-gray-700">Anleitung:</div>
              <div>1. Bilder per Drag & Drop oder Upload hinzufügen</div>
              <div>2. Text mit dem "Text erstellen" Button hinzufügen</div>
              <div>3. Elemente durch Anklicken auswählen</div>
              <div>4. Ausgewählte Elemente verschieben und skalieren</div>
              <div>5. Text per Doppelklick bearbeiten</div>
              <div>6. Export über "Export Einstellungen" → "Exportieren"</div>
            </div>

            <div className="space-y-1 text-xs text-gray-600">
              <div className="font-medium text-gray-700">💡 Tipps:</div>
              <div>• Klicken Sie auf Elemente zum Auswählen</div>
              <div>• Ziehen Sie Elemente zum Verschieben</div>
              <div>• Ziehen Sie an den Ecken zum Größe ändern</div>
              <div>• Doppelklick auf Text zum Bearbeiten</div>
              <div>• Klicken Sie auf × zum Löschen</div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
});

import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface ProcessingIndicatorProps {
  isVisible: boolean;
}

export default function ProcessingIndicator({ isVisible }: ProcessingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <Alert variant="info" className="mt-4">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
      <AlertTitle>Bild wird bearbeitet</AlertTitle>
      <AlertDescription>
        Ihr Bild wird von der KI bearbeitet. Dies kann einen Moment dauern...
      </AlertDescription>
    </Alert>
  );
}

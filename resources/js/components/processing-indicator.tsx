interface ProcessingIndicatorProps {
  isVisible: boolean;
}

export default function ProcessingIndicator({ isVisible }: ProcessingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div className="alert alert-info mt-4">
      <span className="loading loading-spinner loading-md"></span>
      <div>
        <h3 className="font-bold">Bild wird bearbeitet</h3>
        <div className="text-xs">Ihr Bild wird von der KI bearbeitet. Dies kann einen Moment dauern...</div>
      </div>
    </div>
  );
}

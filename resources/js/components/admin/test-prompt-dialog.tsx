import ImagePicker from '@/components/image-picker/image-picker';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TestPromptDialogProps {
  isOpen: boolean;
  testingPromptId: number | undefined;
  onClose: () => void;
}

export default function TestPromptDialog({ isOpen, testingPromptId, onClose }: TestPromptDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Test Prompt</DialogTitle>
        </DialogHeader>
        <ImagePicker defaultPromptId={testingPromptId} storeImages={false} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
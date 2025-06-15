import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Download, Share2 } from 'lucide-react';
import React from 'react';

interface ResultDisplayProps {
  uploadedImageUrl: string | null;
  generatedImageUrl: string | null;
  onDownload: () => void;
  onUseInEditor?: () => void;
  onTryAgain: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ uploadedImageUrl, generatedImageUrl, onDownload, onUseInEditor, onTryAgain }) => {
  return (
    <div className="flex h-full flex-col">
      <p className="text-center text-lg font-medium">🎉 Abracadabra! Your transformation is complete!</p>
      <div className="mt-4 flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-center text-sm font-medium">Before</p>
            <img src={uploadedImageUrl || ''} alt="Original" className="w-full rounded-lg shadow-lg" />
          </div>
          <div className="space-y-2">
            <p className="text-center text-sm font-medium">After ✨</p>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}>
              {generatedImageUrl ? (
                <img src={generatedImageUrl} alt="Generated" className="w-full rounded-lg shadow-lg" />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100">
                  <p className="text-gray-500">Processing...</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        <Button variant="outline" size="sm" onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Share Magic
        </Button>
        {onUseInEditor && (
          <Button size="sm" onClick={onUseInEditor}>
            Use in Editor
          </Button>
        )}
        <Button onClick={onTryAgain} size="sm" variant="outline">
          Try Again!
        </Button>
      </div>
    </div>
  );
};

export default ResultDisplay;

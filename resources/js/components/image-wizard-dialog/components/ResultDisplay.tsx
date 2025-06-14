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
    <div className="space-y-4">
      <p className="text-center text-lg font-medium">🎉 Abracadabra! Your transformation is complete!</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-center text-sm font-medium">Before</p>
          <img src={uploadedImageUrl || ''} alt="Original" className="w-full rounded-lg shadow-lg" />
        </div>
        <div className="space-y-2">
          <p className="text-center text-sm font-medium">After ✨</p>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}>
            <img src={generatedImageUrl || '/api/placeholder/400/400'} alt="Generated" className="w-full rounded-lg shadow-lg" />
          </motion.div>
        </div>
      </div>
      <div className="flex justify-center gap-2">
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

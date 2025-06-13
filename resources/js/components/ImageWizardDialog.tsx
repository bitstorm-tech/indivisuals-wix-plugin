import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useWizardSounds } from '@/hooks/useWizardSounds';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Image as ImageIcon, Share2, Sparkles, Upload, Wand2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ImageWizardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: Array<{ id: number; name: string; prompt: string }>;
  onImageGenerated?: (imageUrl: string, originalFile: File) => void;
}

type WizardStep = 'template' | 'upload' | 'result';

const PREDEFINED_IMAGES = [
  { id: 1, src: '/api/placeholder/300/300', alt: 'Mystical Forest' },
  { id: 2, src: '/api/placeholder/300/300', alt: 'Ocean Waves' },
  { id: 3, src: '/api/placeholder/300/300', alt: 'Mountain Peak' },
  { id: 4, src: '/api/placeholder/300/300', alt: 'City Lights' },
  { id: 5, src: '/api/placeholder/300/300', alt: 'Desert Sunset' },
  { id: 6, src: '/api/placeholder/300/300', alt: 'Aurora Borealis' },
];

const WizardMascot: React.FC<{ emotion?: 'neutral' | 'happy' | 'excited'; onClick?: () => void }> = ({ emotion = 'neutral', onClick }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const eyes = {
    neutral: '◕ ◕',
    happy: '◉ ◉',
    excited: '★ ★',
  };

  const handleClick = () => {
    setIsSpinning(true);
    onClick?.();
    setTimeout(() => setIsSpinning(false), 1000);
  };

  return (
    <motion.div
      className="absolute top-4 right-4 cursor-pointer text-4xl"
      animate={{
        y: [0, -10, 0],
        rotate: emotion === 'excited' ? [0, 5, -5, 0] : 0,
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
    >
      <motion.div className="relative" animate={isSpinning ? { rotate: 720 } : {}} transition={{ duration: 1 }}>
        <Wand2 className="h-12 w-12 text-purple-500" />
        <div className="absolute -top-2 -right-2 text-xs">{eyes[emotion]}</div>
        {isSpinning && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 0] }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-2xl">✨</span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default function ImageWizardDialog({ isOpen, onClose, prompts, onImageGenerated }: ImageWizardDialogProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('template');
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const sounds = useWizardSounds();

  useEffect(() => {
    return () => {
      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl);
      }
    };
  }, [uploadedImageUrl]);

  const stepIndex = {
    template: 0,
    upload: 1,
    result: 2,
  };

  const progress = ((stepIndex[currentStep] + 1) / 3) * 100;

  const handleTemplateSelect = (templateId: number) => {
    sounds.playSelect();
    setSelectedTemplateId(templateId);
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setSelectedPromptId(randomPrompt.id);

    setTimeout(() => {
      setCurrentStep('upload');
    }, 300);
  };

  const handleFileUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      sounds.playUpload();
      setUploadedImage(file);
      const url = URL.createObjectURL(file);
      setUploadedImageUrl(url);

      setTimeout(() => {
        processImage(file);
      }, 500);
    }
  };

  const processImage = async (file: File) => {
    setCurrentStep('result');
    setIsProcessing(true);
    sounds.playMagic();

    const formData = new FormData();
    formData.append('image', file);
    formData.append('prompt_id', selectedPromptId!.toString());

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await fetch('/upload-image', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': csrfToken || '',
          Accept: 'application/json',
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedImageUrl(data.generatedImageUrl);
        sounds.playComplete();

        // Notify parent component about the generated image
        if (onImageGenerated && uploadedImage) {
          onImageGenerated(data.generatedImageUrl, uploadedImage);
        }
      }
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const reset = () => {
    setCurrentStep('template');
    setSelectedTemplateId(null);
    setSelectedPromptId(null);
    setUploadedImage(null);
    setUploadedImageUrl(null);
    setGeneratedImageUrl(null);
    setIsProcessing(false);
  };

  const handleDownload = async () => {
    if (!generatedImageUrl) return;

    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `magic-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="h-[600px] max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent">
            ✨ Magic Image Wizard ✨
          </DialogTitle>
        </DialogHeader>

        <WizardMascot
          emotion={currentStep === 'result' && !isProcessing ? 'excited' : currentStep === 'upload' ? 'happy' : 'neutral'}
          onClick={() => sounds.playMagic()}
        />

        <div className="space-y-6">
          <div className="relative">
            <Progress value={progress} className="h-2" />
            <div className="absolute -top-1 flex w-full justify-between">
              {['Choose Style', 'Upload Photo', 'See Magic!'].map((label, index) => (
                <motion.div
                  key={index}
                  className={cn('text-xs font-medium', stepIndex[currentStep] >= index ? 'text-purple-600' : 'text-gray-400')}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: stepIndex[currentStep] >= index ? 1.1 : 0.9 }}
                >
                  {label}
                </motion.div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {currentStep === 'template' && (
              <motion.div
                key="template"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <p className="text-center text-lg font-medium">
                  <Sparkles className="mr-2 inline h-5 w-5 text-yellow-500" />
                  Pick a magical style for your transformation!
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {PREDEFINED_IMAGES.map((image) => (
                    <motion.button
                      key={image.id}
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTemplateSelect(image.id)}
                      className="group relative overflow-hidden rounded-lg shadow-lg transition-shadow hover:shadow-xl"
                    >
                      <img src={image.src} alt={image.alt} className="h-40 w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                        <p className="absolute right-2 bottom-2 left-2 text-sm font-medium text-white">{image.alt}</p>
                      </div>
                      <motion.div
                        className="absolute top-2 right-2 text-2xl opacity-0 group-hover:opacity-100"
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        ✨
                      </motion.div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <p className="text-center text-lg font-medium">
                  <Upload className="mr-2 inline h-5 w-5 text-blue-500" />
                  Now add your photo to the cauldron!
                </p>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    'rounded-lg border-2 border-dashed p-12 text-center transition-all',
                    isDragging ? 'scale-105 border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400',
                  )}
                >
                  <motion.div
                    animate={{
                      y: isDragging ? -10 : 0,
                      scale: isDragging ? 1.1 : 1,
                    }}
                  >
                    <ImageIcon className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                    <p className="mb-2 text-lg font-medium">{isDragging ? "Drop it like it's hot! 🔥" : 'Drag & drop your photo here'}</p>
                    <p className="mb-4 text-sm text-gray-500">or</p>
                    <label htmlFor="file-upload">
                      <Button variant="outline" className="cursor-pointer">
                        Choose from device
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />
                    </label>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {currentStep === 'result' && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-4"
              >
                {isProcessing ? (
                  <div className="py-12 text-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="inline-block">
                      <Wand2 className="h-16 w-16 text-purple-500" />
                    </motion.div>
                    <p className="mt-4 text-lg font-medium">Mixing magical potions... 🧪✨</p>
                    <motion.p
                      className="mt-2 text-sm text-gray-500"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      This might take a few moments of wonder...
                    </motion.p>
                  </div>
                ) : (
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
                      <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Magic
                      </Button>
                      {onImageGenerated && (
                        <Button
                          size="sm"
                          onClick={() => {
                            if (generatedImageUrl && uploadedImage) {
                              onImageGenerated(generatedImageUrl, uploadedImage);
                              onClose();
                              reset();
                            }
                          }}
                        >
                          Use in Editor
                        </Button>
                      )}
                      <Button onClick={reset} size="sm" variant="outline">
                        Try Again!
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

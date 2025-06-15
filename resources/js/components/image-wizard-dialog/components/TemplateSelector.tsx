import { Prompt } from '@/types/prompt';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import React from 'react';

interface TemplateSelectorProps {
  onSelectTemplate: (templateId: number) => void;
  prompts: Prompt[];
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelectTemplate, prompts }) => {
  // Filter prompts that have example images
  const promptsWithImages = prompts.filter((prompt) => prompt.example_image_url);
  return (
    <motion.div key="template" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <p className="text-center text-lg font-medium">
        <Sparkles className="mr-2 inline h-5 w-5 text-yellow-500" />
        Pick a magical style for your transformation!
      </p>
      <div className="grid max-h-96 grid-cols-3 gap-4 overflow-x-hidden overflow-y-auto pr-2">
        {promptsWithImages.map((prompt) => (
          <motion.button
            key={prompt.id}
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectTemplate(prompt.id)}
            className="group relative overflow-hidden rounded-lg shadow-lg transition-shadow hover:shadow-xl"
          >
            <img src={prompt.example_image_url} alt={`${prompt.category} - ${prompt.name}`} className="h-40 w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
              <p className="absolute right-2 bottom-2 left-2 text-sm font-medium text-white">
                {prompt.category} - {prompt.name}
              </p>
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
  );
};

export default TemplateSelector;

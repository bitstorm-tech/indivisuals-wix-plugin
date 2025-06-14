import { motion } from 'framer-motion';
import { Wand2 } from 'lucide-react';
import React from 'react';

const ProcessingIndicator: React.FC = () => {
  return (
    <div className="py-12 text-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="inline-block">
        <Wand2 className="h-16 w-16 text-purple-500" />
      </motion.div>
      <p className="mt-4 text-lg font-medium">Mixing magical potions... 🧪✨</p>
      <motion.p className="mt-2 text-sm text-gray-500" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
        This might take a few moments of wonder...
      </motion.p>
    </div>
  );
};

export default ProcessingIndicator;

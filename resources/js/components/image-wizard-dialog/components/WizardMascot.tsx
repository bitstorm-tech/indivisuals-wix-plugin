import { motion } from 'framer-motion';
import { Wand2 } from 'lucide-react';
import React, { useState } from 'react';

interface WizardMascotProps {
  emotion?: 'neutral' | 'happy' | 'excited';
  onClick?: () => void;
}

const WizardMascot: React.FC<WizardMascotProps> = ({ emotion = 'neutral', onClick }) => {
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

export default WizardMascot;

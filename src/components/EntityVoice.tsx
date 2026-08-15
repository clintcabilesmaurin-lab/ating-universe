import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface EntityVoiceProps {
  currentLine: string | null;
  isAche?: boolean;
  onDismiss?: () => void;
  subText?: string;
}

export const EntityVoice: React.FC<EntityVoiceProps> = ({
  currentLine,
  isAche = false,
  subText,
}) => {
  return (
    <div
      id="entity-container"
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-full max-w-lg px-6 flex flex-col items-center justify-center text-center"
    >
      <AnimatePresence mode="wait">
        {currentLine && (
          <motion.div
            key={currentLine}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-3"
          >
            {/* Luminous Light Form / Companion Wisp */}
            <div className="relative flex items-center justify-center mb-1">
              <motion.div
                animate={{
                  scale: [1, 1.25, 0.95, 1.15, 1],
                  opacity: [0.35, 0.65, 0.4, 0.6, 0.35],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-12 h-12 rounded-full bg-radial from-amber-200/40 via-purple-300/20 to-transparent blur-md pointer-events-none"
              />
              <motion.div
                animate={{
                  scale: [0.9, 1.1, 0.95, 1.05, 0.9],
                  opacity: [0.6, 0.9, 0.7, 0.85, 0.6],
                }}
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute w-4 h-4 rounded-full bg-white shadow-[0_0_16px_rgba(244,213,141,0.8)]"
              />
            </div>

            {/* Entity Spoken Taglish Dialogue Card */}
            <div
              className={`backdrop-blur-md rounded-2xl px-6 py-4 border shadow-2xl max-w-md ${
                isAche
                  ? 'bg-purple-950/60 border-purple-400/30 text-purple-100 shadow-purple-950/50'
                  : 'bg-black/50 border-amber-300/25 text-amber-50 shadow-black/60'
              }`}
            >
              <p className="text-base sm:text-lg font-light leading-relaxed tracking-wide italic font-serif">
                "{currentLine}"
              </p>
              {subText && (
                <p className="text-xs text-amber-200/70 font-sans tracking-widest mt-2 uppercase">
                  {subText}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

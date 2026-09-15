import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BlendedThemeState } from '../utils/themeEngine';
import { Sparkles, Shuffle } from 'lucide-react';

interface ThemeShiftToastProps {
  toast: {
    visible: boolean;
    moodName: string;
    moodEmoji: string;
    seasonName: string;
    accentColor: string;
  } | null;
  onDismiss: () => void;
}

export const ThemeShiftToast: React.FC<ThemeShiftToastProps> = ({ toast, onDismiss }) => {
  return (
    <AnimatePresence>
      {toast && toast.visible && (
        <motion.div
          initial={{ opacity: 0, y: -25, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.92 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          onClick={onDismiss}
          className="fixed top-16 sm:top-20 inset-x-0 mx-auto w-fit max-w-[90vw] z-40 cursor-pointer pointer-events-auto select-none"
        >
          <div
            className="flex items-center gap-2.5 px-4 py-2 rounded-full backdrop-blur-xl bg-slate-950/85 border text-xs sm:text-sm font-serif shadow-2xl transition-all hover:scale-105"
            style={{
              borderColor: `${toast.accentColor}80`,
              boxShadow: `0 0 25px ${toast.accentColor}40`,
            }}
          >
            <span className="text-base">{toast.moodEmoji}</span>
            <div className="flex items-center gap-1.5 text-slate-100 font-medium">
              <span className="text-amber-200">Nagbago ang simoy:</span>
              <strong className="text-white font-bold">{toast.moodName}</strong>
              <span className="text-slate-400 font-sans text-xs">
                (Nakahalo sa {toast.seasonName})
              </span>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

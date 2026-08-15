import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Star, Heart, Send } from 'lucide-react';
import { WISH_QUOTES } from '../data/universeData';
import { saveUnlockedWish } from '../utils/storage';
import { audioEngine } from '../utils/audioEngine';

interface MeteorWishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWishGranted: (wish: string) => void;
}

export const MeteorWishModal: React.FC<MeteorWishModalProps> = ({
  isOpen,
  onClose,
  onWishGranted,
}) => {
  const [randomQuote] = useState(() => {
    return WISH_QUOTES[Math.floor(Math.random() * WISH_QUOTES.length)];
  });
  const [customWish, setCustomWish] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleMakeWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customWish.trim()) return;

    audioEngine.playStarGazeChime();
    saveUnlockedWish(customWish.trim());
    setIsSubmitted(true);
    onWishGranted(`Naihulog mo ang hiling sa bituin: "${customWish.trim()}"`);

    setTimeout(() => {
      onClose();
    }, 2800);
  };

  return (
    <AnimatePresence>
      <div
        data-lenis-prevent
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-xl select-none"
      >
        <motion.div
          data-lenis-prevent
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.4 }}
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-gradient-to-b from-amber-950/70 via-slate-950/90 to-black rounded-3xl border border-amber-300/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(244,213,141,0.25)] text-center my-auto"
        >
          {/* Close button */}
          <button
            id="close-wish-modal"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Shooting Star Icon */}
          <div className="w-16 h-16 rounded-full bg-amber-400/20 border border-amber-300/40 flex items-center justify-center mx-auto mb-4 text-amber-200 shadow-[0_0_25px_rgba(244,213,141,0.5)] animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>

          <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70 font-sans mb-1">
            Bulalakaw sa Langit
          </p>
          <h3 className="text-2xl font-serif text-amber-100 font-medium">
            Humiling sa Ating Bituin
          </h3>

          {/* Clint's Promise Card */}
          <div className="my-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-400/20">
            <p className="text-sm sm:text-base font-serif italic text-amber-50 leading-relaxed">
              "{randomQuote}"
            </p>
            <p className="text-[10px] text-amber-300/60 font-sans mt-2 tracking-wider">
              — Pangako mula kay Clint
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleMakeWish} className="space-y-4">
              <p className="text-xs text-slate-300 font-serif">
                Isulat ang lihim mong hiling para sa ating dalawa:
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={customWish}
                  onChange={(e) => setCustomWish(e.target.value)}
                  placeholder="Hal: Makita ka na nang walang flight ticket..."
                  className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-amber-300/30 text-amber-50 placeholder-amber-200/30 text-xs font-serif focus:outline-none focus:border-amber-300 transition-colors"
                  maxLength={100}
                />
              </div>

              <button
                type="submit"
                disabled={!customWish.trim()}
                className="w-full py-3 rounded-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-sans text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Star className="w-4 h-4 fill-slate-950" />
                Ipadala ang Hiling sa Kalawakan
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-4 space-y-2 text-center"
            >
              <Heart className="w-8 h-8 text-rose-400 mx-auto fill-rose-400/40 animate-bounce" />
              <p className="text-sm font-serif text-amber-100 italic">
                "Nakatala na ang iyong hiling sa ating kalawakan, Lovey."
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

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
          className="glass-panel relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-amber-300/35 p-6 sm:p-8 shadow-[0_0_50px_rgba(244,213,141,0.25)] text-center my-auto"
        >
          {/* Top specular highlight rim */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-200/40 to-transparent pointer-events-none" />

          {/* Close button */}
          <button
            id="close-wish-modal"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full glass-pill text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Shooting Star Icon */}
          <div className="glass-orb w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-200 shadow-[0_0_25px_rgba(244,213,141,0.4)] animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>

          <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70 font-sans mb-1">
            Bulalakaw sa Langit
          </p>
          <h3 className="text-2xl font-serif text-amber-100 font-medium">
            Humiling sa Ating Bituin
          </h3>

          {/* Clint's Promise Card */}
          <div className="my-5 p-4 rounded-2xl glass-card border border-amber-400/20">
            <p className="text-sm sm:text-base font-serif italic text-amber-50 leading-relaxed">
              "{randomQuote}"
            </p>
            <p className="text-[10px] text-amber-300/70 font-sans mt-2 tracking-wider">
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
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/15 focus:border-amber-400/80 text-amber-50 placeholder-amber-200/30 text-xs font-serif focus:outline-none transition-colors backdrop-blur-md"
                  maxLength={100}
                />
              </div>

              <button
                type="submit"
                disabled={!customWish.trim()}
                className="w-full py-3 rounded-full glass-pill disabled:opacity-50 disabled:cursor-not-allowed text-amber-100 font-sans text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg border border-amber-300/40 hover:scale-[1.02] active:scale-98"
              >
                <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
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

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Crown, ExternalLink, Calendar, X, Clock } from 'lucide-react';
import {
  OUR_FIRST_YEAR_URL,
  RELATIONSHIP_START_DATE_ISO,
  FIRST_YEAR_ANNIVERSARY_DATE_ISO,
} from '../data/universeData';
import { audioEngine } from '../utils/audioEngine';

interface AnniversaryCounterProps {
  onSpeak?: (line: string) => void;
}

interface TimeBreakdown {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownBreakdown {
  isReached: boolean;
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeTogether(startDate: Date, now: Date): TimeBreakdown {
  const diffMs = Math.max(0, now.getTime() - startDate.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    totalMs: diffMs,
    days,
    hours,
    minutes,
    seconds,
  };
}

function calculateCountdownToTarget(targetDate: Date, now: Date): CountdownBreakdown {
  const diffMs = targetDate.getTime() - now.getTime();
  if (diffMs <= 0) {
    return {
      isReached: true,
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    isReached: false,
    totalMs: diffMs,
    days,
    hours,
    minutes,
    seconds,
  };
}

export const AnniversaryCounter: React.FC<AnniversaryCounterProps> = ({ onSpeak }) => {
  const startDate = new Date(RELATIONSHIP_START_DATE_ISO);
  const targetDate = new Date(FIRST_YEAR_ANNIVERSARY_DATE_ISO);

  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDetailsOpen) {
        setIsDetailsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDetailsOpen]);

  const timeTogether = calculateTimeTogether(startDate, currentTime);
  const countdown = calculateCountdownToTarget(targetDate, currentTime);
  const isAnniversaryUnlocked = countdown.isReached;

  const pad = (n: number) => String(n).padStart(2, '0');

  const handleOpenDetails = () => {
    audioEngine.playStarGazeChime();
    setIsDetailsOpen(true);
    if (onSpeak) {
      if (isAnniversaryUnlocked) {
        onSpeak("Happy 1st Year Anniversary, Lovey! Available na ang ating Our First Year! 💖✨");
      } else {
        onSpeak(`${timeTogether.days} days na tayong magkasama, Lovey... bawat segundo mahal kita.`);
      }
    }
  };

  return (
    <>
      <div className="relative pointer-events-auto">
        {isAnniversaryUnlocked ? (
          /* UNLOCKED 1ST YEAR STATE: Glowing celebratory link to our-first-year */
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1.5"
          >
            <a
              href={OUR_FIRST_YEAR_URL}
              target="_top"
              id="header-our-first-year-unlocked-btn"
              onClick={() => audioEngine.playInLoveSound()}
              className="group relative flex items-center gap-2 bg-gradient-to-r from-amber-400 via-rose-500 to-pink-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 px-3 sm:px-4 py-1.5 rounded-full font-serif font-bold text-xs shadow-[0_0_25px_rgba(251,191,36,0.6)] hover:shadow-[0_0_35px_rgba(244,63,94,0.8)] transition-all hover:scale-105"
            >
              <Crown className="w-3.5 h-3.5 fill-slate-950 text-slate-950 animate-bounce" />
              <span>Our First Year</span>
              <span className="hidden md:inline text-[11px] font-sans font-semibold opacity-90">
                &bull; 1st Year Reached!
              </span>
              <ExternalLink className="w-3 h-3 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
            </a>

            <button
              onClick={handleOpenDetails}
              id="header-anniversary-counter-details-btn"
              title="Tingnan ang detalye ng panahon"
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-amber-300/40 text-amber-200 hover:text-white transition-all text-xs"
            >
              <Clock className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ) : (
          /* COUNTING STATE: Subtle, elegant header counter displaying duration together */
          <motion.button
            id="header-anniversary-counter-btn"
            onClick={handleOpenDetails}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center gap-2 bg-black/45 hover:bg-black/60 backdrop-blur-md border border-amber-300/30 hover:border-amber-300/60 px-3 sm:px-4 py-1.5 rounded-full text-amber-100 shadow-lg transition-all"
          >
            {/* Pulsing indicator */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>

            {/* Core Counter */}
            <div className="flex items-center gap-1.5 text-xs font-serif tracking-wide">
              <span className="font-medium text-amber-200">
                {timeTogether.days} <span className="text-[10px] font-sans text-amber-300/70">araw</span>
              </span>
              <span className="text-amber-400/40">&bull;</span>
              <span className="font-mono text-[11px] text-amber-100 tracking-wider">
                {pad(timeTogether.hours)}:{pad(timeTogether.minutes)}:{pad(timeTogether.seconds)}
              </span>
            </div>

            <Heart className="w-3 h-3 text-rose-400 fill-rose-400/80 group-hover:scale-125 transition-transform" />
          </motion.button>
        )}
      </div>

      {/* DETAILED TIME BREAKDOWN MODAL */}
      <AnimatePresence>
        {isDetailsOpen && (
          <div
            id="anniversary-counter-modal-backdrop"
            onClick={() => setIsDetailsOpen(false)}
            className="fixed inset-0 z-[65] overflow-y-auto overscroll-contain bg-black/80 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-gradient-to-b from-slate-900/95 via-stone-900/95 to-slate-950/95 border-2 border-amber-300/40 rounded-3xl p-6 sm:p-7 text-amber-50 shadow-[0_0_50px_rgba(0,0,0,0.9)] space-y-5 cursor-default pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                  <span className="text-xs font-sans tracking-widest uppercase text-amber-300/80 font-medium">
                    Clint &amp; Maica &bull; Love Counter
                  </span>
                </div>
                <button
                  type="button"
                  id="btn-close-anniversary-counter"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDetailsOpen(false);
                  }}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer pointer-events-auto"
                  title="Isara"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Central Time Card */}
              <div className="text-center space-y-2 py-1">
                <p className="text-xs text-slate-400 font-sans">
                  Sama na simula noong <strong className="text-amber-200">Setyembre 22, 2025 (9:00 PM)</strong>
                </p>
                <div className="grid grid-cols-4 gap-2 pt-2">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="block font-mono text-xl sm:text-2xl font-bold text-amber-300">
                      {timeTogether.days}
                    </span>
                    <span className="text-[9px] uppercase font-sans tracking-wider text-slate-400">
                      Araw
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="block font-mono text-xl sm:text-2xl font-bold text-amber-200">
                      {pad(timeTogether.hours)}
                    </span>
                    <span className="text-[9px] uppercase font-sans tracking-wider text-slate-400">
                      Oras
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="block font-mono text-xl sm:text-2xl font-bold text-amber-200">
                      {pad(timeTogether.minutes)}
                    </span>
                    <span className="text-[9px] uppercase font-sans tracking-wider text-slate-400">
                      Minuto
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="block font-mono text-xl sm:text-2xl font-bold text-rose-300">
                      {pad(timeTogether.seconds)}
                    </span>
                    <span className="text-[9px] uppercase font-sans tracking-wider text-slate-400">
                      Segundo
                    </span>
                  </div>
                </div>
              </div>

              {/* Milestone Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 border border-amber-300/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-300" />
                    <span className="text-xs font-serif font-bold text-amber-100">
                      1st Year Anniversary Target
                    </span>
                  </div>
                  <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30">
                    Sept 22, 2026 &bull; 9:00 PM
                  </span>
                </div>

                {isAnniversaryUnlocked ? (
                  <div className="space-y-3 pt-1">
                    <p className="text-xs text-rose-200 font-serif italic">
                      Dumating na ang araw ng ating ika-1 Taon! Available na ang buong karanasang inihanda para sa'yo:
                    </p>
                    <a
                      href={OUR_FIRST_YEAR_URL}
                      target="_top"
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-rose-500 to-pink-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_20px_rgba(251,191,36,0.6)] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Crown className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Pumasok sa Our First Year Website</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs text-slate-300 font-serif italic">
                      Konti na lang Lovey, mag-iisang taon na tayo!
                    </p>
                    <div className="text-xs font-mono text-amber-300/90 flex items-center gap-1">
                      <span>Countdown:</span>
                      <span className="font-bold text-amber-200">
                        {countdown.days}d {pad(countdown.hours)}h {pad(countdown.minutes)}m {pad(countdown.seconds)}s
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Love Quote / Note */}
              <div className="text-center pt-1">
                <p className="text-xs font-serif italic text-rose-200/80">
                  "First year down, lifetime to go. Mahal na mahal kita, Maica ko."
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

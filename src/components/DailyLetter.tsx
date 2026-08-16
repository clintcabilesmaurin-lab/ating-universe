import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Heart, Sparkles, X, ChevronLeft, ChevronRight, Feather, Calendar, Shuffle } from 'lucide-react';
import { DAILY_LETTERS, getRandomDailyLetter, DailyQuoteLetter } from '../data/dailyLettersData';
import { audioEngine } from '../utils/audioEngine';

interface DailyLetterProps {
  hasEntered: boolean;
  onLetterOpen?: () => void;
}

export const DailyLetter: React.FC<DailyLetterProps> = ({ hasEntered, onLetterOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<DailyQuoteLetter>(getRandomDailyLetter());
  const [isFlightActive, setIsFlightActive] = useState(false);
  const [flightProgress, setFlightProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [planePos, setPlanePos] = useState({ x: 100, y: 150, angle: 12 });
  const [hasLaunchedInitial, setHasLaunchedInitial] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const flightStartTimeRef = useRef<number>(0);

  // Trigger paper plane flight when the user first enters with a random letter
  useEffect(() => {
    if (hasEntered && !hasLaunchedInitial) {
      setHasLaunchedInitial(true);
      setSelectedLetter(getRandomDailyLetter());
      // Brief delay after entrance to let initial stars and title settle
      const timer = setTimeout(() => {
        launchPaperPlane();
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [hasEntered, hasLaunchedInitial]);

  // Flight path physics / animation loop
  const launchPaperPlane = () => {
    setIsFlightActive(true);
    flightStartTimeRef.current = performance.now();

    const flightDuration = 7200; // 7.2 seconds graceful cosmic traverse

    const animateFlight = (time: number) => {
      const elapsed = time - flightStartTimeRef.current;
      const progress = Math.min(1, elapsed / flightDuration);
      setFlightProgress(progress);

      const w = window.innerWidth;
      const h = window.innerHeight;

      // Graceful swooping bezier flight trajectory from top-left/middle to bottom-right resting dock
      const p0 = { x: -80, y: h * 0.24 };
      const p1 = { x: w * 0.38, y: h * 0.14 };
      const p2 = { x: w * 0.65, y: h * 0.46 };
      const p3 = { x: Math.max(20, w - 100), y: Math.max(120, h - 180) };

      // Cubic Bezier interpolation
      const t = progress;
      const u = 1 - t;
      const x = u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x;
      const y = u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y;

      // Derivative for flight angle
      const dx =
        3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x);
      const dy =
        3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      setPlanePos({ x, y, angle });

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animateFlight);
      } else {
        setIsFlightActive(false);
      }
    };

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(animateFlight);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handlePlaneClick = () => {
    audioEngine.playStarGazeChime();
    setIsOpen(true);
    if (onLetterOpen) onLetterOpen();
  };

  const handlePrevLetter = () => {
    audioEngine.playStarGazeChime();
    const currentIndex = DAILY_LETTERS.findIndex((l) => l.id === selectedLetter.id);
    const prevIndex = (currentIndex - 1 + DAILY_LETTERS.length) % DAILY_LETTERS.length;
    setSelectedLetter(DAILY_LETTERS[prevIndex]);
  };

  const handleNextLetter = () => {
    audioEngine.playStarGazeChime();
    const currentIndex = DAILY_LETTERS.findIndex((l) => l.id === selectedLetter.id);
    const nextIndex = (currentIndex + 1) % DAILY_LETTERS.length;
    setSelectedLetter(DAILY_LETTERS[nextIndex]);
  };

  const handleRandomLetter = () => {
    audioEngine.playStarGazeChime();
    let newLetter = getRandomDailyLetter();
    if (DAILY_LETTERS.length > 1 && newLetter.id === selectedLetter.id) {
      // Pick a different one if matched
      const currentIndex = DAILY_LETTERS.findIndex((l) => l.id === selectedLetter.id);
      const nextIndex = (currentIndex + 1) % DAILY_LETTERS.length;
      newLetter = DAILY_LETTERS[nextIndex];
    }
    setSelectedLetter(newLetter);
  };

  const handleRelaunch = () => {
    audioEngine.playStarGazeChime();
    setIsOpen(false);
    setSelectedLetter(getRandomDailyLetter());
    setTimeout(() => {
      launchPaperPlane();
    }, 400);
  };

  if (!hasEntered) return null;

  const currentIdx = DAILY_LETTERS.findIndex((l) => l.id === selectedLetter.id);
  const displayIdx = currentIdx >= 0 ? currentIdx + 1 : 1;

  return (
    <>
      {/* 1. Floating Origami Paper Airplane */}
      <div
        id="floating-daily-letter-plane"
        className={`fixed z-40 cursor-pointer select-none transition-transform duration-150 ${
          isFlightActive ? 'pointer-events-auto' : 'pointer-events-auto'
        }`}
        style={{
          left: isFlightActive ? `${planePos.x}px` : undefined,
          top: isFlightActive ? `${planePos.y}px` : undefined,
          right: !isFlightActive ? '24px' : undefined,
          bottom: !isFlightActive ? '130px' : undefined,
          transform: isFlightActive
            ? `translate(-50%, -50%) rotate(${planePos.angle}deg)`
            : 'none',
        }}
        onClick={handlePlaneClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Floating pulse & stardust trail */}
        <div className="relative group">
          {/* Stardust particles & glow */}
          <div
            className={`absolute -inset-3 bg-amber-400/20 rounded-full blur-md transition-opacity duration-300 ${
              isHovered || isFlightActive ? 'opacity-100 scale-125' : 'opacity-40 animate-pulse'
            }`}
          />

          {/* Paper Airplane Canvas/SVG 3D Origami Graphic */}
          <div className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-50/90 via-amber-100/90 to-amber-200/80 backdrop-blur-md shadow-[0_8px_30px_rgba(251,191,36,0.35)] border border-amber-200/60 p-2.5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
            <svg
              viewBox="0 0 64 64"
              className="w-full h-full drop-shadow-md text-amber-900"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Origami Paper Fold Facets */}
              {/* Left wing */}
              <polygon points="32,8 6,48 32,38" fill="#FFF9ED" stroke="#D4A373" strokeWidth="1.2" />
              {/* Right wing */}
              <polygon points="32,8 58,48 32,38" fill="#FAEDCD" stroke="#D4A373" strokeWidth="1.2" />
              {/* Center spine left */}
              <polygon points="32,8 32,56 24,42" fill="#E9D8A6" stroke="#D4A373" strokeWidth="1" />
              {/* Center spine right */}
              <polygon points="32,8 32,56 40,42" fill="#D4A373" stroke="#B08968" strokeWidth="1" />
              {/* Romantic heart badge on origami wing */}
              <path
                d="M32 20 C32 17 29 15 27 17 C25 19 27 22 32 26 C37 22 39 19 37 17 C35 15 32 17 32 20 Z"
                fill="#E07A5F"
              />
            </svg>

            {/* Sparkle ping */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
            </span>
          </div>

          {/* Floating Tooltip Label (docked mode) */}
          {!isFlightActive && (
            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-amber-400/30 text-[11px] text-amber-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-xl flex items-center gap-1.5">
              <Feather className="w-3 h-3 text-amber-300" />
              <span>Liham para kay Lovey • Buksan</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Handwritten Origami Love Letter Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md">
            {/* Backdrop click dismiss */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => setIsOpen(false)}
            />

            {/* Letter Paper Container */}
            <motion.div
              key={selectedLetter.id}
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#FDFBF7] text-slate-800 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] border border-amber-200/70 p-6 sm:p-8"
              style={{
                backgroundImage: `radial-gradient(#E8DFD8 1px, transparent 1px), linear-gradient(to bottom, #FAF7F2, #F4EEE5)`,
                backgroundSize: '20px 20px, 100% 100%',
              }}
            >
              {/* Vintage Header Ribbon & Close */}
              <div className="flex items-center justify-between border-b border-amber-900/10 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300/60">
                    <Send className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-serif text-sm font-semibold tracking-wide text-amber-950 flex items-center gap-1.5">
                      <span>Liham ng Pag-ibig</span>
                      <span className="text-xs text-amber-700/80 font-sans font-medium px-2 py-0.5 rounded-full bg-amber-200/50">
                        {displayIdx} / {DAILY_LETTERS.length}
                      </span>
                    </h3>
                    <p className="text-[11px] text-amber-800/70 flex items-center gap-1 font-sans mt-0.5">
                      <Calendar className="w-3 h-3 text-amber-600" />
                      <span>{selectedLetter.theme} • {selectedLetter.tag}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-amber-200/50 text-slate-500 hover:text-slate-800 transition-colors"
                  title="Isara"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Romantic Quote Banner */}
              <div className="mb-6 bg-amber-100/60 border-l-4 border-amber-500 rounded-r-2xl p-4 shadow-sm">
                <p className="font-serif italic text-base sm:text-lg text-amber-950 leading-relaxed">
                  {selectedLetter.quote}
                </p>
                <span className="block mt-2 text-xs font-sans text-amber-800/80 font-medium text-right">
                  — {selectedLetter.author}
                </span>
              </div>

              {/* Heartfelt Letter Body */}
              <div className="space-y-3.5 font-serif text-[14px] sm:text-[15px] leading-relaxed text-slate-700">
                {selectedLetter.body.map((paragraph, idx) => (
                  <p key={idx} className="first-letter:text-lg first-letter:font-semibold">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Closing & Handwritten Signature */}
              <div className="mt-7 pt-4 border-t border-amber-900/10 flex items-end justify-between">
                <div>
                  <p className="text-xs font-serif text-slate-600 italic">
                    {selectedLetter.closing}
                  </p>
                  <p className="font-serif text-base font-bold text-amber-950 tracking-wide mt-0.5">
                    Clint &hearts;
                  </p>
                </div>

                {/* Wax Seal Stamp Graphic */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-xs font-serif shadow-sm">
                  <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600 animate-pulse" />
                  <span>First Year • Lovey {selectedLetter.moodEmoji}</span>
                </div>
              </div>

              {/* Letter Navigator & Relaunch Actions */}
              <div className="mt-6 pt-4 border-t border-dashed border-amber-900/15 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevLetter}
                    className="px-2.5 py-1.5 rounded-lg hover:bg-amber-200/60 text-slate-700 hover:text-slate-900 transition-colors text-xs font-medium flex items-center gap-1 border border-amber-300/40"
                    title="Nakaraang Liham"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Nauna</span>
                  </button>

                  <button
                    onClick={handleRandomLetter}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-200/60 hover:bg-amber-300/60 text-amber-900 transition-colors text-xs font-medium flex items-center gap-1 border border-amber-300/70"
                    title="Random na Liham"
                  >
                    <Shuffle className="w-3 h-3 text-amber-800" />
                    <span className="text-[11px]">Random</span>
                  </button>

                  <button
                    onClick={handleNextLetter}
                    className="px-2.5 py-1.5 rounded-lg hover:bg-amber-200/60 text-slate-700 hover:text-slate-900 transition-colors text-xs font-medium flex items-center gap-1 border border-amber-300/40"
                    title="Susunod na Liham"
                  >
                    <span className="text-[11px]">Susunod</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={handleRelaunch}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-sans font-medium transition-all shadow-md active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Paliparin Ulit</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

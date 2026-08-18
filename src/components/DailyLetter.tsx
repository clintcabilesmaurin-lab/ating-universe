import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Heart,
  Sparkles,
  X,
  Feather,
  Calendar,
  RefreshCw,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  FolderHeart,
  ChevronRight,
  Trash2,
  Volume2,
} from 'lucide-react';
import {
  DailyQuoteLetter,
  LETTER_THEMES,
  INITIAL_FALLBACK_LETTER,
  getSavedLetters,
  saveLetterToArchive,
  removeLetterFromArchive,
  getTodayCachedLetter,
  setTodayCachedLetter,
  LetterTopicTheme,
} from '../data/dailyLettersData';
import { PersonalityContext } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface DailyLetterProps {
  hasEntered: boolean;
  personalityContext?: PersonalityContext;
  onLetterOpen?: () => void;
  onSpeakText?: (text: string) => void;
}

export const DailyLetter: React.FC<DailyLetterProps> = ({
  hasEntered,
  personalityContext,
  onLetterOpen,
  onSpeakText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'letter' | 'saved'>('letter');
  const [currentLetter, setCurrentLetter] = useState<DailyQuoteLetter>(() => {
    return getTodayCachedLetter() || INITIAL_FALLBACK_LETTER;
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<LetterTopicTheme>(LETTER_THEMES[0]);
  const [savedLetters, setSavedLetters] = useState<DailyQuoteLetter[]>([]);
  const [isSavedCurrent, setIsSavedCurrent] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Flight animation states
  const [isFlightActive, setIsFlightActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [planePos, setPlanePos] = useState({ x: 100, y: 150, angle: 12 });
  const [hasLaunchedInitial, setHasLaunchedInitial] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const flightStartTimeRef = useRef<number>(0);

  // Load saved letters from localStorage
  useEffect(() => {
    setSavedLetters(getSavedLetters());
  }, [isOpen]);

  // Check if current letter is in saved list
  useEffect(() => {
    const saved = getSavedLetters();
    const exists = saved.some(
      (l) => l.id === currentLetter.id || (l.quote === currentLetter.quote && l.theme === currentLetter.theme)
    );
    setIsSavedCurrent(exists);
  }, [currentLetter, savedLetters]);

  // Initial fetch if today's letter is not cached
  useEffect(() => {
    if (hasEntered && !hasLaunchedInitial) {
      setHasLaunchedInitial(true);
      const cached = getTodayCachedLetter();
      if (!cached) {
        // Fetch fresh daily letter from AI in background
        fetchDailyLetter(LETTER_THEMES[0].name);
      }
      // Launch paper plane animation
      const timer = setTimeout(() => {
        launchPaperPlane();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [hasEntered, hasLaunchedInitial]);

  const launchPaperPlane = () => {
    setIsFlightActive(true);
    flightStartTimeRef.current = performance.now();
    const flightDuration = 7200;

    const animateFlight = (time: number) => {
      const elapsed = time - flightStartTimeRef.current;
      const progress = Math.min(1, elapsed / flightDuration);

      const w = window.innerWidth;
      const h = window.innerHeight;

      const p0 = { x: -80, y: h * 0.24 };
      const p1 = { x: w * 0.38, y: h * 0.14 };
      const p2 = { x: w * 0.65, y: h * 0.46 };
      const p3 = { x: Math.max(20, w - 100), y: Math.max(120, h - 180) };

      const t = progress;
      const u = 1 - t;
      const x = u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x;
      const y = u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y;

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
    setActiveTab('letter');
    if (onLetterOpen) onLetterOpen();
  };

  const fetchDailyLetter = async (themeName?: string) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/companion/daily-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: themeName || selectedTheme.name,
          personalityContext,
        }),
      });

      if (res.ok) {
        const data: DailyQuoteLetter = await res.json();
        setCurrentLetter(data);
        setTodayCachedLetter(data);
        audioEngine.playStarGazeChime();
      }
    } catch (err) {
      console.warn('AI Daily Letter generation error, using fallback:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleSave = () => {
    if (isSavedCurrent) {
      removeLetterFromArchive(currentLetter.id);
      setIsSavedCurrent(false);
    } else {
      saveLetterToArchive(currentLetter);
      setIsSavedCurrent(true);
      audioEngine.playStarGazeChime();
    }
    setSavedLetters(getSavedLetters());
  };

  const handleCopy = () => {
    const fullText = `${currentLetter.quote}\n— ${currentLetter.author}\n\n${currentLetter.body.join('\n\n')}\n\n${currentLetter.closing}`;
    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRelaunch = () => {
    audioEngine.playStarGazeChime();
    setIsOpen(false);
    setTimeout(() => {
      launchPaperPlane();
    }, 400);
  };

  if (!hasEntered) return null;

  return (
    <>
      {/* 1. Floating Origami Paper Airplane */}
      <div
        id="floating-daily-letter-plane"
        className="fixed z-40 cursor-pointer select-none pointer-events-auto"
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
        <div className="relative group">
          {/* Stardust particles & glow */}
          <div
            className={`absolute -inset-3 bg-gradient-to-r from-amber-400/30 to-rose-400/30 rounded-full blur-md transition-opacity duration-300 ${
              isHovered || isFlightActive ? 'opacity-100 scale-125' : 'opacity-50 animate-pulse'
            }`}
          />

          {/* Paper Airplane Canvas/SVG 3D Origami Graphic */}
          <div className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-50/95 via-amber-100/90 to-amber-200/85 backdrop-blur-md shadow-[0_8px_30px_rgba(251,191,36,0.4)] border border-amber-200/70 p-2.5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
            <svg
              viewBox="0 0 64 64"
              className="w-full h-full drop-shadow-md text-amber-900"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon points="32,8 6,48 32,38" fill="#FFF9ED" stroke="#D4A373" strokeWidth="1.2" />
              <polygon points="32,8 58,48 32,38" fill="#FAEDCD" stroke="#D4A373" strokeWidth="1.2" />
              <polygon points="32,8 32,56 24,42" fill="#E9D8A6" stroke="#D4A373" strokeWidth="1" />
              <polygon points="32,8 32,56 40,42" fill="#D4A373" stroke="#B08968" strokeWidth="1" />
              <path
                d="M32 20 C32 17 29 15 27 17 C25 19 27 22 32 26 C37 22 39 19 37 17 C35 15 32 17 32 20 Z"
                fill="#E07A5F"
              />
            </svg>

            {/* Sparkle badge */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
            </span>
          </div>

          {/* Floating Tooltip Label (docked mode) */}
          {!isFlightActive && (
            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-400/40 text-[11px] text-amber-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-xl flex items-center gap-1.5">
              <Feather className="w-3.5 h-3.5 text-amber-300" />
              <span>Liham ng Pag-ibig • Buksan</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Handwritten Origami Love Letter Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-[#FDFBF7] text-slate-800 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65)] border border-amber-200/80 overflow-hidden"
              style={{
                backgroundImage: `radial-gradient(#E8DFD8 1px, transparent 1px), linear-gradient(to bottom, #FAF7F2, #F4EEE5)`,
                backgroundSize: '20px 20px, 100% 100%',
              }}
            >
              {/* Header Navigation Tabs & Close */}
              <div className="flex items-center justify-between border-b border-amber-900/10 px-6 py-4 bg-amber-50/60">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-full bg-amber-100 text-amber-900 border border-amber-300/60 shadow-sm">
                    <Send className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-serif text-base font-semibold tracking-wide text-amber-950 flex items-center gap-1.5">
                      <span>Munting Liham mula kay Clint</span>
                      <span className="text-[11px] font-sans font-medium px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                        Live AI Letter ✨
                      </span>
                    </h3>
                    <p className="text-[11px] text-amber-800/80 font-sans mt-0.5">
                      Personal at sariwang liham para kay Maica araw-araw
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab(activeTab === 'letter' ? 'saved' : 'letter')}
                    className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full transition-all border ${
                      activeTab === 'saved'
                        ? 'bg-amber-800 text-amber-50 border-amber-900 font-semibold'
                        : 'bg-amber-100/70 hover:bg-amber-200/70 text-amber-900 border-amber-300/60'
                    }`}
                    title="Tingnan ang mga Naka-save na Liham"
                  >
                    <FolderHeart className="w-3.5 h-3.5" />
                    <span>Memory Box ({savedLetters.length})</span>
                  </button>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-full hover:bg-amber-200/60 text-slate-500 hover:text-slate-800 transition-colors ml-1"
                    title="Isara"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                {activeTab === 'letter' ? (
                  <>
                    {/* Theme Topic Selector Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-amber-900 font-medium font-sans">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pumili ng Paksa ng Liham:</span>
                        </span>
                        <span className="text-[11px] text-amber-700/80 italic">
                          {selectedTheme.description}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {LETTER_THEMES.map((theme) => {
                          const isSelected = selectedTheme.id === theme.id;
                          return (
                            <button
                              key={theme.id}
                              onClick={() => {
                                setSelectedTheme(theme);
                                fetchDailyLetter(theme.name);
                              }}
                              disabled={isGenerating}
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-sans transition-all duration-200 ${
                                isSelected
                                  ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white font-medium shadow-sm scale-105'
                                  : 'bg-white/80 hover:bg-amber-100/80 text-amber-950 border border-amber-200/80'
                              }`}
                            >
                              <span>{theme.emoji}</span>
                              <span>{theme.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Letter Body Card */}
                    <div className="relative bg-white/60 border border-amber-200/70 rounded-2xl p-5 sm:p-6 shadow-sm">
                      {isGenerating ? (
                        <div className="py-16 flex flex-col items-center justify-center gap-3 text-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
                            className="p-3 rounded-full bg-amber-100 text-amber-700 border border-amber-300/80"
                          >
                            <Feather className="w-6 h-6 animate-pulse" />
                          </motion.div>
                          <p className="font-serif text-sm font-semibold text-amber-950">
                            Sumusulat si Clint ng bagong liham para sa'yo... ✨
                          </p>
                          <p className="text-xs text-amber-800/70 font-sans max-w-xs">
                            Inihahabi ang bawat salita mula sa puso gamit ang inyong mga alaala.
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Quote Banner */}
                          <div className="mb-5 bg-amber-100/70 border-l-4 border-amber-600 rounded-r-xl p-4 shadow-sm">
                            <p className="font-serif italic text-base sm:text-lg text-amber-950 leading-relaxed">
                              {currentLetter.quote}
                            </p>
                            <div className="mt-2 flex items-center justify-between text-xs font-sans text-amber-800/80">
                              <span className="font-medium">— {currentLetter.author}</span>
                              <span className="text-[11px] text-amber-700/70">
                                {currentLetter.generatedAt || 'Ngayong Araw'}
                              </span>
                            </div>
                          </div>

                          {/* Letter Paragraphs */}
                          <div className="space-y-3.5 font-serif text-[14.5px] sm:text-[15.5px] leading-relaxed text-slate-700">
                            {currentLetter.body.map((paragraph, idx) => (
                              <p key={idx} className="first-letter:text-lg first-letter:font-semibold">
                                {paragraph}
                              </p>
                            ))}
                          </div>

                          {/* Sign-off & Seal */}
                          <div className="mt-7 pt-4 border-t border-amber-900/10 flex items-end justify-between">
                            <div>
                              <p className="text-xs font-serif text-slate-600 italic">
                                {currentLetter.closing}
                              </p>
                              <p className="font-serif text-base font-bold text-amber-950 tracking-wide mt-0.5">
                                Clint &hearts;
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-xs font-serif shadow-sm">
                              <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600 animate-pulse" />
                              <span>First Year • {currentLetter.moodEmoji || '💖'}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Action Buttons Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handleToggleSave}
                          disabled={isGenerating}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-all border ${
                            isSavedCurrent
                              ? 'bg-rose-100 text-rose-800 border-rose-300 font-semibold'
                              : 'bg-white/80 hover:bg-amber-100/80 text-amber-900 border-amber-200'
                          }`}
                        >
                          {isSavedCurrent ? (
                            <>
                              <BookmarkCheck className="w-3.5 h-3.5 text-rose-600" />
                              <span>Naka-save sa Memory Box</span>
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-3.5 h-3.5 text-amber-700" />
                              <span>I-save ang Liham</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={handleCopy}
                          disabled={isGenerating}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-amber-100/80 text-amber-900 border border-amber-200 text-xs font-sans font-medium transition-all"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-medium">Na-kopya na!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-amber-700" />
                              <span>Kopyahin</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => fetchDailyLetter()}
                          disabled={isGenerating}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-700 to-rose-700 hover:from-amber-800 hover:to-rose-800 text-white text-xs font-sans font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                          <span>Humingi ng Bagong Liham ✨</span>
                        </button>

                        <button
                          onClick={handleRelaunch}
                          className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-amber-200/80 hover:bg-amber-300/80 text-amber-950 text-xs font-sans font-medium transition-all"
                          title="Paliparin ulit ang paper plane"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                          <span>Paliparin Ulit</span>
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Memory Box Saved Letters Tab */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-amber-900/10">
                      <div>
                        <h4 className="font-serif text-sm font-bold text-amber-950">
                          Aking Memory Box ng mga Liham
                        </h4>
                        <p className="text-xs text-amber-800/80 font-sans">
                          Koleksyon ng mga paborito mong liham mula kay Clint
                        </p>
                      </div>
                      <span className="text-xs font-sans font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300/60">
                        {savedLetters.length} Liham
                      </span>
                    </div>

                    {savedLetters.length === 0 ? (
                      <div className="py-14 text-center space-y-2">
                        <FolderHeart className="w-10 h-10 text-amber-400/80 mx-auto" />
                        <p className="font-serif text-sm text-amber-950 font-medium">
                          Wala pang naka-save na liham sa iyong Memory Box.
                        </p>
                        <p className="text-xs text-amber-800/70 font-sans max-w-xs mx-auto">
                          Pindutin ang "I-save ang Liham" habang nagbabasa upang maitago rito ang mga paborito mong sulat.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {savedLetters.map((letter) => (
                          <div
                            key={letter.id}
                            className="bg-white/80 hover:bg-white border border-amber-200/80 rounded-2xl p-4 transition-all shadow-sm group"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-amber-900 font-serif">
                                    {letter.theme}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-sans">
                                    {letter.tag}
                                  </span>
                                </div>
                                <p className="font-serif italic text-xs text-amber-950/90 line-clamp-2">
                                  {letter.quote}
                                </p>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setCurrentLetter(letter);
                                    setActiveTab('letter');
                                  }}
                                  className="px-3 py-1 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-sans font-medium transition-all"
                                >
                                  Basahin
                                </button>
                                <button
                                  onClick={() => {
                                    removeLetterFromArchive(letter.id);
                                    setSavedLetters(getSavedLetters());
                                  }}
                                  className="p-1.5 rounded-full hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
                                  title="Tanggalin sa Memory Box"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

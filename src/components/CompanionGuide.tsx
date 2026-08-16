import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import {
  Sparkles,
  Heart,
  MessageCircleHeart,
  Compass,
  Lightbulb,
  X,
  Flame,
  ChevronUp,
  MapPin,
  Send,
  Navigation,
  Smile,
  Music,
} from 'lucide-react';
import {
  GUIDE_INTERACTIVE_DIALOGUES,
  GUIDE_EXPLORATION_TIPS,
  GUIDE_IDLE_CHIRPS,
  GuideLine,
} from '../data/universeData';
import { LumiCompanion, LumiMood, LumiFlareType } from './LumiCompanion';
import { WeatherMoodId } from './CosmicWeather';
import { audioEngine } from '../utils/audioEngine';

interface CompanionGuideProps {
  currentLine: string | null;
  isAche?: boolean;
  weatherMood?: WeatherMoodId;
  externalFlareTrigger?: number;
  externalFlareType?: LumiFlareType;
  onOpenPangilatan?: () => void;
  onOpenWishModal?: () => void;
  onSpawnPhoto?: () => void;
  onTriggerHearts?: (count?: number) => void;
}

// Preset waypoints across the starry sky for Lumi to gracefully float between
const FLOATING_WAYPOINTS = [
  { x: 82, y: 76, label: 'Bottom Right' },
  { x: 84, y: 35, label: 'Upper Right' },
  { x: 74, y: 18, label: 'Top Horizon' },
  { x: 18, y: 24, label: 'Top Left' },
  { x: 14, y: 65, label: 'Mid Left' },
  { x: 48, y: 82, label: 'Bottom Center' },
  { x: 80, y: 68, label: 'Home Base' },
];

const AVAILABLE_MOODS: { mood: LumiMood; label: string; emoji: string }[] = [
  { mood: 'happy', label: 'Masayahin', emoji: '✨' },
  { mood: 'loving', label: 'Malambing', emoji: '💖' },
  { mood: 'laugh', label: 'Tawa', emoji: '😄' },
  { mood: 'giggle', label: 'Hagikgik', emoji: '😆' },
  { mood: 'angry', label: 'Nag-aapoy 🔥', emoji: '😤' },
  { mood: 'playful', label: 'Mapaglaro', emoji: '😜' },
  { mood: 'starry', label: 'Mangha', emoji: '🌟' },
  { mood: 'curious', label: 'Nagtataka', emoji: '🧐' },
  { mood: 'tender', label: 'Payapa', emoji: '💜' },
  { mood: 'ache', label: 'Damdamin', emoji: '💧' },
  { mood: 'sleepy', label: 'Antok', emoji: '🌙' },
];

export const CompanionGuide: React.FC<CompanionGuideProps> = ({
  currentLine,
  isAche = false,
  weatherMood,
  externalFlareTrigger = 0,
  externalFlareType = 'star',
  onOpenPangilatan,
  onOpenWishModal,
  onSpawnPhoto,
  onTriggerHearts,
}) => {
  const [guideMood, setGuideMood] = useState<LumiMood>('happy');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [activeSpeech, setActiveSpeech] = useState<string | null>(null);
  const [activeActionHint, setActiveActionHint] = useState<string | undefined>(undefined);
  const [isBouncing, setIsBouncing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [sparklePop, setSparklePop] = useState(false);
  const [internalFlareTrigger, setInternalFlareTrigger] = useState(0);
  const [internalFlareType, setInternalFlareType] = useState<LumiFlareType>('star');

  // Position in viewport percentages (default bottom right)
  const [position, setPosition] = useState({ x: 85, y: 78 });
  const [isFreeFloating, setIsFreeFloating] = useState(true);

  const guideContainerRef = useRef<HTMLDivElement>(null);
  const waypointIndexRef = useRef<number>(0);
  const speechTimerRef = useRef<number | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const wanderTimerRef = useRef<number | null>(null);
  const lastDialogueIndexRef = useRef<number>(-1);

  // Synchronize Lumi mood with Cosmic Weather mood
  useEffect(() => {
    if (!weatherMood) return;
    if (weatherMood === 'heart-rain') {
      setGuideMood('loving');
    } else if (weatherMood === 'soft-snow') {
      setGuideMood('tender');
    } else if (weatherMood === 'stardust-embers') {
      setGuideMood('starry');
    } else if (weatherMood === 'sakura-breeze') {
      setGuideMood('playful');
    } else if (weatherMood === 'aurora-mist') {
      setGuideMood('curious');
    }
  }, [weatherMood]);

  // Sync external speech from App (e.g. clicking constellation nodes or memories)
  useEffect(() => {
    if (currentLine) {
      setActiveSpeech(currentLine);
      setGuideMood(isAche ? 'ache' : 'loving');
      triggerBounce();
    } else {
      setActiveSpeech(null);
      setActiveActionHint(undefined);
    }
  }, [currentLine, isAche]);

  // Autonomous wandering around the starry night sky with GSAP physics
  useEffect(() => {
    if (!isFreeFloating) return;

    const scheduleNextWander = () => {
      // Float to a new waypoint every 18 - 30 seconds
      const interval = 18000 + Math.random() * 12000;
      wanderTimerRef.current = window.setTimeout(() => {
        if (!isMenuOpen && !activeSpeech) {
          waypointIndexRef.current = (waypointIndexRef.current + 1) % FLOATING_WAYPOINTS.length;
          const target = FLOATING_WAYPOINTS[waypointIndexRef.current];

          const jitterX = (Math.random() - 0.5) * 6;
          const jitterY = (Math.random() - 0.5) * 6;

          const targetX = Math.max(8, Math.min(88, target.x + jitterX));
          const targetY = Math.max(12, Math.min(82, target.y + jitterY));

          flyTo(targetX, targetY);

          // Occasionally chirp something cute upon arriving
          if (Math.random() > 0.4) {
            window.setTimeout(() => {
              const chirp = GUIDE_IDLE_CHIRPS[Math.floor(Math.random() * GUIDE_IDLE_CHIRPS.length)];
              setGuideMood(chirp.mood as LumiMood);
              setActiveSpeech(chirp.text);
              triggerBounce();

              speechTimerRef.current = window.setTimeout(() => {
                setActiveSpeech(null);
              }, 5500);
            }, 2800);
          }
        }
        scheduleNextWander();
      }, interval);
    };

    scheduleNextWander();

    return () => {
      if (wanderTimerRef.current) window.clearTimeout(wanderTimerRef.current);
    };
  }, [isFreeFloating, isMenuOpen, activeSpeech]);

  const triggerBounce = (flare: LumiFlareType = 'star') => {
    setIsBouncing(true);
    setSparklePop(true);
    setInternalFlareType(flare);
    setInternalFlareTrigger((prev) => prev + 1);
    window.setTimeout(() => setIsBouncing(false), 650);
    window.setTimeout(() => setSparklePop(false), 950);
  };

  const speakLine = (line: GuideLine, duration = 6500) => {
    if (speechTimerRef.current) {
      window.clearTimeout(speechTimerRef.current);
    }
    audioEngine.playStarGazeChime();
    setGuideMood(line.mood as LumiMood);
    setActiveSpeech(line.text);
    setActiveActionHint(line.actionHint);
    triggerBounce(line.mood === 'loving' ? 'heart' : line.mood === 'starry' ? 'wonder' : 'star');

    speechTimerRef.current = window.setTimeout(() => {
      setActiveSpeech(null);
      setActiveActionHint(undefined);
    }, duration);
  };

  // Fly Lumi smoothly to a specific viewport percentage
  const flyTo = (xPercent: number, yPercent: number) => {
    setIsFlying(true);
    setPosition({ x: xPercent, y: yPercent });
    triggerBounce('star');
    window.setTimeout(() => setIsFlying(false), 3200);
  };

  // User clicked on Lumi directly
  const handleLumiClick = () => {
    audioEngine.playStarGazeChime();
    triggerBounce('star');
    if (onTriggerHearts) {
      onTriggerHearts(14);
    }

    let nextIdx = Math.floor(Math.random() * GUIDE_INTERACTIVE_DIALOGUES.length);
    if (nextIdx === lastDialogueIndexRef.current) {
      nextIdx = (nextIdx + 1) % GUIDE_INTERACTIVE_DIALOGUES.length;
    }
    lastDialogueIndexRef.current = nextIdx;
    const dialogue = GUIDE_INTERACTIVE_DIALOGUES[nextIdx];
    speakLine(dialogue);
  };

  // Special Cosmic Dance routine with GSAP and sound
  const handleLumiDance = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playStarGazeChime();
    setGuideMood('giggle');
    triggerBounce();
    if (onTriggerHearts) {
      onTriggerHearts(24);
    }

    if (guideContainerRef.current) {
      gsap.timeline()
        .to(guideContainerRef.current, { y: '-=30', rotation: 15, duration: 0.25, ease: 'power1.out' })
        .to(guideContainerRef.current, { y: '+=35', rotation: -15, duration: 0.25, ease: 'power1.inOut' })
        .to(guideContainerRef.current, { y: '-=25', rotation: 360, duration: 0.5, ease: 'back.out(2)' })
        .to(guideContainerRef.current, { y: 0, rotation: 0, duration: 0.3, ease: 'power2.out' });
    }

    setActiveSpeech("Hahahah! Tan-awa, nag-sayaw si Lumi para sa'yo, Lovey! ✨💃");
    setIsMenuOpen(false);
  };

  const handleKwentuhan = (e: React.MouseEvent) => {
    e.stopPropagation();
    let nextIdx = Math.floor(Math.random() * GUIDE_INTERACTIVE_DIALOGUES.length);
    if (nextIdx === lastDialogueIndexRef.current) {
      nextIdx = (nextIdx + 1) % GUIDE_INTERACTIVE_DIALOGUES.length;
    }
    lastDialogueIndexRef.current = nextIdx;
    speakLine(GUIDE_INTERACTIVE_DIALOGUES[nextIdx]);
    setIsMenuOpen(false);
  };

  const handleGuideTips = (e: React.MouseEvent) => {
    e.stopPropagation();
    const tip = GUIDE_EXPLORATION_TIPS[Math.floor(Math.random() * GUIDE_EXPLORATION_TIPS.length)];
    speakLine(tip, 7500);
    setIsMenuOpen(false);
  };

  const handleLambing = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTriggerHearts) {
      onTriggerHearts(30);
    }
    audioEngine.playStarGazeChime();
    speakLine({
      text: "Mahal na mahal ka ni Clint, Lovey! Ang lambing sa imong kasingkasing ang nagpabilin nga hayag sa atong tibuok kalawakan. 💖✨",
      mood: 'loving',
    });
    setIsMenuOpen(false);
  };

  const handleWishPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenWishModal) {
      onOpenWishModal();
    }
    setIsMenuOpen(false);
  };

  const handleSpawnPhotoPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSpawnPhoto) {
      onSpawnPhoto();
    }
    speakLine({
      text: "Lumipad na ang usa ka nindot nga alaala sa kalangitan! Tan-awa tong naglutaw-lutaw nga litrato sa Pangilatan. 📸✨",
      mood: 'playful',
    });
    setIsMenuOpen(false);
  };

  const handlePangilatanGuide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenPangilatan) {
      onOpenPangilatan();
    }
    setIsMenuOpen(false);
  };

  const isLeftSided = position.x < 45;
  const isTopSided = position.y < 35;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden select-none">
      {/* Dynamic Floating Container */}
      <motion.div
        ref={guideContainerRef}
        animate={{
          left: `${position.x}%`,
          top: `${position.y}%`,
        }}
        transition={{
          duration: isFlying ? 3.2 : 1.2,
          ease: [0.25, 1, 0.5, 1],
        }}
        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 1. Spoken Speech Bubble Card */}
        <AnimatePresence>
          {activeSpeech && (
            <motion.div
              initial={{ opacity: 0, y: isTopSided ? -15 : 15, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute',
                top: isTopSided ? '92px' : undefined,
                bottom: !isTopSided ? '92px' : undefined,
                left: isLeftSided ? '0px' : undefined,
                right: !isLeftSided ? '0px' : undefined,
              }}
              className="w-72 sm:w-84 pointer-events-auto z-30"
            >
              <div
                className="relative rounded-3xl p-4 sm:p-4.5 backdrop-blur-2xl border bg-slate-950/92 border-amber-300/40 shadow-2xl overflow-hidden"
                style={{
                  boxShadow: '0 0 35px rgba(244,213,141,0.35), 0 10px 35px rgba(0,0,0,0.85)',
                }}
              >
                {/* Ambient Top Glow */}
                <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-40 bg-amber-400 pointer-events-none" />

                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full animate-ping bg-amber-400" />
                    <span className="text-[11px] font-sans font-semibold tracking-wider uppercase text-amber-200/90 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      Lumi &bull; Gabay ng Kalawakan
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveSpeech(null)}
                    className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors text-xs"
                    title="Isara"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Speech Text */}
                <p className="text-sm sm:text-[14.5px] font-serif leading-relaxed italic text-amber-100 drop-shadow-sm">
                  "{activeSpeech}"
                </p>

                {/* Action Hint Tag */}
                {activeActionHint && (
                  <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-1 text-[11px] font-sans text-amber-200/90 bg-white/5 px-2.5 py-1 rounded-xl">
                    <Compass className="w-3 h-3 text-amber-300 shrink-0 animate-spin-slow" />
                    <span>{activeActionHint}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. Interactive Guide Menu Expansion */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: isTopSided ? -15 : 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.25 }}
              style={{
                position: 'absolute',
                top: isTopSided ? '88px' : undefined,
                bottom: !isTopSided ? '88px' : undefined,
                left: isLeftSided ? '0px' : undefined,
                right: !isLeftSided ? '0px' : undefined,
                boxShadow: '0 0 35px rgba(244,213,141,0.3), 0 10px 40px rgba(0,0,0,0.9)',
              }}
              className="bg-slate-950/95 backdrop-blur-2xl border border-amber-300/40 rounded-3xl p-3 shadow-2xl pointer-events-auto flex flex-col gap-1.5 w-60 z-30"
            >
              <div className="px-2 py-1 flex items-center justify-between border-b border-white/10 mb-1">
                <span className="text-[10px] uppercase font-sans font-semibold tracking-wider text-amber-200/80">
                  Si Lumi • Ano ang Nais Mo, Lovey? ✨
                </span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-slate-400 hover:text-white text-xs p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Main Actions */}
              <button
                onClick={handleKwentuhan}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-serif text-amber-100 hover:bg-amber-400/20 transition-all text-left group"
              >
                <MessageCircleHeart className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                <span>Kwentuhan Tayo</span>
              </button>

              <button
                onClick={handleLumiDance}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-serif text-pink-100 hover:bg-pink-400/20 transition-all text-left group"
              >
                <Music className="w-4 h-4 text-pink-300 group-hover:scale-110 transition-transform" />
                <span>Sayaw ni Lumi (Dance ✨)</span>
              </button>

              <button
                onClick={handleGuideTips}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-serif text-sky-100 hover:bg-sky-400/20 transition-all text-left group"
              >
                <Lightbulb className="w-4 h-4 text-sky-300 group-hover:scale-110 transition-transform" />
                <span>Gabayan Ako (Tips)</span>
              </button>

              <button
                onClick={handleLambing}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-serif text-rose-100 hover:bg-rose-400/20 transition-all text-left group"
              >
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400 group-hover:scale-110 transition-transform" />
                <span>Magpadala ng Lambing</span>
              </button>

              {onOpenPangilatan && (
                <button
                  onClick={handlePangilatanGuide}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-serif text-emerald-100 hover:bg-emerald-400/20 transition-all text-left group"
                >
                  <MapPin className="w-4 h-4 text-emerald-300 group-hover:scale-110 transition-transform" />
                  <span>Puntahan ang Pangilatan</span>
                </button>
              )}

              {onSpawnPhoto && (
                <button
                  onClick={handleSpawnPhotoPrompt}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-serif text-yellow-100 hover:bg-yellow-400/20 transition-all text-left group"
                >
                  <Flame className="w-4 h-4 text-yellow-300 group-hover:scale-110 transition-transform" />
                  <span>Paliparin ang Alaala</span>
                </button>
              )}

              {onOpenWishModal && (
                <button
                  onClick={handleWishPrompt}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-serif text-purple-100 hover:bg-purple-400/20 transition-all text-left group"
                >
                  <Sparkles className="w-4 h-4 text-purple-300 group-hover:scale-110 transition-transform" />
                  <span>Humiling sa Bulalakaw</span>
                </button>
              )}

              {/* Expression & Mood Swapper Submenu */}
              <div className="pt-1.5 mt-1 border-t border-white/10">
                <button
                  onClick={() => setShowMoodPicker(!showMoodPicker)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[10px] text-amber-200/90 hover:text-amber-100 font-sans"
                >
                  <span className="flex items-center gap-1">
                    <Smile className="w-3 h-3 text-amber-300" />
                    <span>Anyo & Ekspresyon ni Lumi</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10">
                    {guideMood}
                  </span>
                </button>

                {showMoodPicker && (
                  <div className="grid grid-cols-3 gap-1 mt-1 p-1 bg-black/40 rounded-xl border border-white/5">
                    {AVAILABLE_MOODS.map((m) => (
                      <button
                        key={m.mood}
                        onClick={() => {
                          setGuideMood(m.mood);
                          triggerBounce();
                          audioEngine.playStarGazeChime();
                        }}
                        className={`px-1.5 py-1 rounded-lg text-[10px] flex flex-col items-center gap-0.5 transition-all ${
                          guideMood === m.mood
                            ? 'bg-amber-400/30 text-amber-100 border border-amber-300/50'
                            : 'hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        <span className="text-xs">{m.emoji}</span>
                        <span className="text-[9px] truncate max-w-[50px]">{m.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Fly-around Toggle */}
              <div className="pt-1 mt-1 border-t border-white/10 flex items-center justify-between px-2">
                <span className="text-[10px] text-slate-400 font-sans">Lumipad sa Ibang Dako</span>
                <button
                  onClick={() => {
                    const nextW = FLOATING_WAYPOINTS[Math.floor(Math.random() * FLOATING_WAYPOINTS.length)];
                    flyTo(nextW.x, nextW.y);
                    setIsMenuOpen(false);
                  }}
                  className="text-[10px] text-amber-200 hover:text-amber-100 px-2 py-0.5 bg-white/10 rounded-full flex items-center gap-1"
                >
                  <Navigation className="w-2.5 h-2.5" />
                  <span>Lipad!</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. The 3D Lumi Starry Spirit Animated Character Body */}
        <motion.div
          animate={{
            y: [0, -8, 0, 8, 0],
            rotate: isFlying ? [0, 6, -6, 0] : [0, 2, -2, 0],
          }}
          transition={{
            duration: isFlying ? 2 : 4.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative cursor-pointer group pointer-events-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleLumiClick}
        >
          {/* 3D React-Three-Fiber Lumi Companion with GSAP and Framer Motion */}
          <LumiCompanion
            mood={guideMood}
            weatherMood={weatherMood}
            flareTrigger={internalFlareTrigger + (externalFlareTrigger || 0)}
            flareType={internalFlareTrigger > 0 ? internalFlareType : externalFlareType || 'star'}
            isBouncing={isBouncing}
            isFlying={isFlying}
            isHovered={isHovered}
            size={104}
          />

          {/* Quick Menu Button Toggle Floating on Lumi's Side */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              audioEngine.playStarGazeChime();
              setIsMenuOpen(!isMenuOpen);
            }}
            title={isMenuOpen ? 'Isara' : 'Kausapin si Lumi'}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-black/80 hover:bg-black border border-amber-300/60 text-amber-200 flex items-center justify-center shadow-lg transition-colors z-20 backdrop-blur-md"
          >
            {isMenuOpen ? <X className="w-3 h-3" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </motion.button>

          {/* Stardust Ripple Burst on Click */}
          {sparklePop && (
            <motion.div
              initial={{ scale: 0.4, opacity: 1 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border-2 border-amber-300 pointer-events-none"
            />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

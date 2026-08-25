import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'motion/react';
import {
  Mail,
  Heart,
  ExternalLink,
  ArrowLeft,
  X,
  Globe,
  ChevronRight,
  Compass,
  Pause,
  Play,
  Crown,
} from 'lucide-react';
import {
  LETTERS,
  ELEVEN_MONTHSARY_LETTER,
  SECRET_LETTER_DAW_URL,
} from '../data/universeData';
import { Letter } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { lumiSync } from '../utils/lumiSyncBus';
import { NebulaShaderCanvas } from './NebulaShaderCanvas';

interface LettersSubUniverseViewProps {
  onBackToUniverse: () => void;
  onSpeak?: (line: string, isAche?: boolean) => void;
  initialSubworldId?: string;
}

// Pre-calculated orbital configuration for each letter to simulate unique non-linear celestial drift
interface MailOrbitConfig {
  initialX: number; // percentage (-50 to 50)
  initialY: number; // percentage (-50 to 50)
  orbitPathX: number[];
  orbitPathY: number[];
  orbitPathRotateZ: number[];
  orbitPathRotateY: number[];
  orbitPathRotateX: number[];
  duration: number;
  delay: number;
  depthZ: number; // used for parallax weighting
  accentGlow: string;
  badgeLabel: string;
  stampIcon: string;
  isOutsideLink?: boolean; // Prioritized superior external link letter
  outsideUrl?: string;
}

const ORBIT_CONFIGS: Record<string, MailOrbitConfig> = {
  'letter-11-monthsary': {
    initialX: 0,
    initialY: -4,
    orbitPathX: [0, 16, -14, 18, -10, 0],
    orbitPathY: [0, -16, 14, -12, 16, 0],
    orbitPathRotateZ: [0, 3, -4, 2, -2, 0],
    orbitPathRotateY: [-8, 10, -10, 12, -8],
    orbitPathRotateX: [6, -8, 8, -5, 6],
    duration: 16,
    delay: 0,
    depthZ: 60, // Strongest parallax responsiveness
    accentGlow: 'rgba(244, 63, 94, 0.75)',
    badgeLabel: '11th Monthsary',
    stampIcon: '💎',
    isOutsideLink: true,
    outsideUrl: SECRET_LETTER_DAW_URL,
  },
  'letter-1': {
    initialX: -36,
    initialY: -24,
    orbitPathX: [-36, -24, -46, -30, -40, -36],
    orbitPathY: [-24, -36, -16, -38, -20, -24],
    orbitPathRotateZ: [-6, 2, -8, 4, -6],
    orbitPathRotateY: [12, -6, 14, -8, 12],
    orbitPathRotateX: [-6, 8, -5, 7, -6],
    duration: 25,
    delay: 1.5,
    depthZ: 20,
    accentGlow: 'rgba(251, 146, 60, 0.3)',
    badgeLabel: 'LDR Archive',
    stampIcon: '📜',
    isOutsideLink: false,
  },
  'letter-2': {
    initialX: 38,
    initialY: -22,
    orbitPathX: [38, 48, 26, 44, 30, 38],
    orbitPathY: [-22, -12, -32, -10, -28, -22],
    orbitPathRotateZ: [5, -4, 6, -3, 5],
    orbitPathRotateY: [-10, 8, -12, 6, -10],
    orbitPathRotateX: [8, -6, 10, -4, 8],
    duration: 27,
    delay: 3,
    depthZ: 15,
    accentGlow: 'rgba(52, 211, 153, 0.3)',
    badgeLabel: 'Sooner',
    stampIcon: '🌱',
    isOutsideLink: false,
  },
  'letter-3': {
    initialX: -32,
    initialY: 28,
    orbitPathX: [-32, -44, -20, -38, -24, -32],
    orbitPathY: [28, 16, 38, 20, 34, 28],
    orbitPathRotateZ: [4, -5, 3, -4, 4],
    orbitPathRotateY: [-12, 8, -10, 8, -12],
    orbitPathRotateX: [-8, 10, -6, 8, -8],
    duration: 29,
    delay: 2,
    depthZ: 12,
    accentGlow: 'rgba(96, 165, 250, 0.3)',
    badgeLabel: 'Pangarap',
    stampIcon: '🪐',
    isOutsideLink: false,
  },
  'letter-4': {
    initialX: 34,
    initialY: 26,
    orbitPathX: [34, 22, 46, 28, 42, 34],
    orbitPathY: [26, 38, 18, 34, 20, 26],
    orbitPathRotateZ: [-5, 5, -3, 4, -5],
    orbitPathRotateY: [12, -8, 10, -6, 12],
    orbitPathRotateX: [9, -7, 11, -5, 9],
    duration: 31,
    delay: 4,
    depthZ: 18,
    accentGlow: 'rgba(192, 132, 252, 0.3)',
    badgeLabel: 'Bulong',
    stampIcon: '🌙',
    isOutsideLink: false,
  },
  'letter-5': {
    initialX: 2,
    initialY: 34,
    orbitPathX: [2, -14, 18, -10, 12, 2],
    orbitPathY: [34, 44, 26, 40, 28, 34],
    orbitPathRotateZ: [3, -4, 3, -3, 3],
    orbitPathRotateY: [-8, 12, -7, 10, -8],
    orbitPathRotateX: [-6, 8, -4, 8, -6],
    duration: 23,
    delay: 2.5,
    depthZ: 25,
    accentGlow: 'rgba(244, 114, 182, 0.3)',
    badgeLabel: 'Pasasalamat',
    stampIcon: '✨',
    isOutsideLink: false,
  },
};

// Component for an individual 3D floating mail envelope drifting in simulated orbit with parallax movement
interface FloatingMailEnvelopeProps {
  letter: Letter;
  config: MailOrbitConfig;
  isSelected: boolean;
  isOrbitPaused: boolean;
  onSelect: (letter: Letter) => void;
  onHoverSound: () => void;
  parallaxX: any; // MotionValue for global parallax X
  parallaxY: any; // MotionValue for global parallax Y
}

const FloatingMailEnvelope: React.FC<FloatingMailEnvelopeProps> = memo(({
  letter,
  config,
  isOrbitPaused,
  onSelect,
  onHoverSound,
  parallaxX,
  parallaxY,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isSuperiorOutside = config.isOutsideLink;

  // Depth multiplier for parallax movement
  const depthFactor = config.depthZ / 50;
  const letterParallaxX = useTransform(parallaxX, (v: number) => v * depthFactor);
  const letterParallaxY = useTransform(parallaxY, (v: number) => v * depthFactor);

  // Individual Mouse tilt effect when hovering (tactile hover-peek)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [22, -22]), { stiffness: 280, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-22, 22]), { stiffness: 280, damping: 20 });
  const peekElevation = useSpring(isHovered ? -12 : 0, { stiffness: 300, damping: 22 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      id={`floating-mail-envelope-${letter.id}`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1200,
        x: letterParallaxX,
        y: letterParallaxY,
        zIndex: isHovered ? 55 : isSuperiorOutside ? 35 : 12,
      }}
      className="absolute cursor-pointer select-none touch-manipulation group"
      onClick={() => onSelect(letter)}
      onMouseEnter={() => {
        setIsHovered(true);
        onHoverSound();
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Base Non-Linear Orbit / Drift Physics Wrapper */}
      <motion.div
        animate={
          isOrbitPaused || isHovered
            ? {
                x: `${config.initialX}vw`,
                y: `${config.initialY}vh`,
                scale: isHovered ? (isSuperiorOutside ? 1.2 : 1.14) : isSuperiorOutside ? 1.05 : 0.88,
              }
            : {
                x: config.orbitPathX.map((px) => `${px}vw`),
                y: config.orbitPathY.map((py) => `${py}vh`),
                rotateZ: config.orbitPathRotateZ,
                rotateY: config.orbitPathRotateY,
                rotateX: config.orbitPathRotateX,
                scale: isSuperiorOutside
                  ? [1.02, 1.08, 1.01, 1.07, 1.03, 1.02]
                  : [0.85, 0.89, 0.84, 0.88, 0.85, 0.85],
              }
        }
        transition={
          isOrbitPaused || isHovered
            ? { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }
            : {
                duration: config.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: config.delay,
              }
        }
      >
        {/* 3D Envelope Body with Pure Depth & Tactile Cursor Tilt */}
        <motion.div
          style={{
            rotateX: isHovered ? rotateX : 0,
            rotateY: isHovered ? rotateY : 0,
            y: peekElevation,
            transformStyle: 'preserve-3d',
          }}
          className={`relative rounded-3xl transition-all duration-300 ${
            isSuperiorOutside
              ? 'w-[300px] sm:w-[380px] h-[190px] sm:h-[230px] bg-gradient-to-br from-rose-950 via-stone-900 to-slate-950 border-2 border-rose-400/90 shadow-[0_0_60px_rgba(244,63,94,0.6),0_0_25px_rgba(251,191,36,0.35)] ring-2 ring-amber-400/50 hover:ring-amber-300'
              : 'w-[220px] sm:w-[270px] h-[145px] sm:h-[165px] bg-stone-950/85 border border-white/20 hover:border-amber-300/50 shadow-[0_8px_30px_rgba(0,0,0,0.8)] hover:shadow-[0_12px_40px_rgba(244,114,182,0.25)] opacity-85 hover:opacity-100 backdrop-blur-md'
          } p-4 sm:p-5 flex flex-col justify-between overflow-visible`}
        >
          {/* Tactile Hover-Peek Parchment Sheet sliding out from top slit */}
          <motion.div
            initial={false}
            animate={
              isHovered
                ? { y: isSuperiorOutside ? -24 : -18, opacity: 1, scale: 1.02 }
                : { y: 0, opacity: 0, scale: 0.95 }
            }
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className={`absolute -top-2 inset-x-3 sm:inset-x-5 h-16 sm:h-20 rounded-t-2xl border shadow-lg p-2 sm:p-2.5 pointer-events-none z-[5] overflow-hidden ${
              isSuperiorOutside
                ? 'bg-gradient-to-b from-amber-100 via-rose-50 to-stone-100 text-stone-900 border-amber-300/80'
                : 'bg-gradient-to-b from-amber-50 via-stone-100 to-stone-200 text-stone-900 border-amber-200/60'
            }`}
          >
            <div className="flex items-center justify-between border-b border-stone-300/70 pb-0.5 mb-1">
              <span className="text-[8px] sm:text-[9px] font-serif uppercase tracking-wider text-rose-700 font-bold flex items-center gap-1">
                <Heart className="w-2.5 h-2.5 fill-rose-600 text-rose-600" />
                <span>{isSuperiorOutside ? '11th Monthsary Letter' : 'Liham ni Clint'}</span>
              </span>
              <span className="text-[7px] font-mono text-stone-500">Para kay Lovey</span>
            </div>
            <p className="text-[8px] sm:text-[9px] font-serif italic text-stone-800 line-clamp-2 leading-tight">
              "{letter.excerpt}"
            </p>
          </motion.div>

          {/* Superior Floating Aura for Outside Link */}
          {isSuperiorOutside ? (
            <>
              <div className="absolute -inset-4 rounded-3xl bg-radial from-rose-500/30 via-amber-500/10 to-transparent blur-xl pointer-events-none animate-pulse" />
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 via-transparent to-amber-400/15 pointer-events-none rounded-3xl" />
            </>
          ) : (
            <div
              className="absolute -inset-3 rounded-2xl blur-lg pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity"
              style={{ backgroundColor: config.accentGlow }}
            />
          )}

          {/* Dynamic Light Sheen on Cursor Hover */}
          {isHovered && (
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-transparent via-white/10 to-amber-300/15 pointer-events-none" />
          )}

          {/* Envelope Airmail Flap Geometry Folds */}
          <div
            className={`absolute top-0 left-0 right-0 h-1/2 border-b pointer-events-none z-[6] ${
              isSuperiorOutside ? 'border-rose-400/40 bg-rose-500/10' : 'border-white/10 bg-white/5'
            }`}
          />
          <div
            className={`absolute -top-10 left-1/2 -translate-x-1/2 w-44 h-28 rotate-45 border pointer-events-none z-[6] ${
              isSuperiorOutside ? 'bg-rose-950/50 border-rose-400/30' : 'bg-stone-900/60 border-white/10'
            }`}
          />

          {/* Top Row: Tag / Stamp */}
          <div className="relative z-10 flex items-start justify-between">
            <div className="text-left space-y-0.5 max-w-[190px] sm:max-w-[240px]">
              {isSuperiorOutside ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 text-[9px] font-bold uppercase tracking-wider shadow-md">
                    <Crown className="w-2.5 h-2.5 fill-slate-950" />
                    <span>Secret Letter</span>
                  </span>
                </div>
              ) : (
                <span className="text-[8px] uppercase font-sans tracking-widest text-slate-400 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                  {config.badgeLabel}
                </span>
              )}

              <p
                className={`font-serif truncate pt-1 ${
                  isSuperiorOutside
                    ? 'text-sm sm:text-base text-rose-50 font-bold tracking-wide'
                    : 'text-xs text-slate-300 font-normal'
                }`}
              >
                {isSuperiorOutside ? 'Para kay Lovey (Maica) 💖' : letter.title}
              </p>
            </div>

            {/* Postal Stamp */}
            <div
              className={`shrink-0 px-2 py-1 rounded-lg border shadow-inner flex flex-col items-center select-none ${
                isSuperiorOutside
                  ? 'bg-rose-950/90 border-amber-400/80 ring-1 ring-rose-400/50'
                  : 'bg-stone-900/80 border-white/20'
              }`}
            >
              <span className="text-xs sm:text-sm my-0.5">{config.stampIcon}</span>
              <span className="text-[5px] sm:text-[6px] text-slate-400 font-mono">CLINT&bull;MAICA</span>
            </div>
          </div>

          {/* Center: Wax Seal Stamp */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto">
            {isSuperiorOutside ? (
              <motion.div
                whileHover={{ scale: 1.12 }}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-amber-400 via-rose-600 to-pink-700 border-2 border-amber-200 shadow-[0_0_25px_rgba(251,191,36,0.6)] flex flex-col items-center justify-center text-white"
              >
                <Heart className="w-3.5 h-3.5 text-amber-100 fill-amber-100" />
                <span className="text-[11px] sm:text-xs font-serif font-black leading-none text-white">11</span>
                <span className="text-[6px] uppercase font-sans tracking-widest text-amber-100">MONTHS</span>
              </motion.div>
            ) : (
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border shadow-md flex items-center justify-center text-white/80"
                style={{
                  backgroundColor: letter.sealColor,
                  borderColor: '#ffffff40',
                }}
              >
                <Mail className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>

          {/* Bottom: Excerpt & Open Action */}
          <div className="relative z-10 flex items-end justify-between text-left">
            <div className={isSuperiorOutside ? 'max-w-[180px] sm:max-w-[230px]' : 'max-w-[140px]'}>
              <p
                className={`text-[9px] sm:text-[10px] italic line-clamp-1 ${
                  isSuperiorOutside ? 'text-rose-100 font-serif font-medium' : 'text-slate-400 font-serif'
                }`}
              >
                "{letter.excerpt}"
              </p>
            </div>

            <div
              className={`flex items-center gap-1 font-sans font-medium transition-colors ${
                isSuperiorOutside
                  ? 'text-xs text-amber-300 hover:text-white bg-rose-900/60 px-2.5 py-1 rounded-full border border-rose-400/50'
                  : 'text-[10px] text-slate-300 hover:text-white'
              }`}
            >
              <span>Buksan</span>
              {isSuperiorOutside ? (
                <ExternalLink className="w-3 h-3 text-amber-300" />
              ) : (
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              )}
            </div>
          </div>
        </motion.div>

        {/* Orbit Shadow under Envelope */}
        <div
          className={`mx-auto mt-2 rounded-full blur-md pointer-events-none ${
            isSuperiorOutside ? 'w-48 h-5 bg-rose-900/50' : 'w-28 h-3 bg-black/30'
          }`}
        />
      </motion.div>
    </motion.div>
  );
});

FloatingMailEnvelope.displayName = 'FloatingMailEnvelope';

export const LettersSubUniverseView: React.FC<LettersSubUniverseViewProps> = memo(({
  onBackToUniverse,
  onSpeak,
}) => {
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [isPreviewIframeOpen, setIsPreviewIframeOpen] = useState(false);
  const [reactionSubmitted, setReactionSubmitted] = useState<string | null>(null);
  const [isOrbitPaused, setIsOrbitPaused] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax Physics Coordinates
  const mouseScreenX = useMotionValue(0);
  const mouseScreenY = useMotionValue(0);

  const smoothParallaxX = useSpring(mouseScreenX, { stiffness: 60, damping: 20 });
  const smoothParallaxY = useSpring(mouseScreenY, { stiffness: 60, damping: 20 });

  // Background Nebula Parallax transforms
  const bgParallaxX = useTransform(smoothParallaxX, (v) => -v * 0.25);
  const bgParallaxY = useTransform(smoothParallaxY, (v) => -v * 0.25);

  const starsParallaxX = useTransform(smoothParallaxX, (v) => -v * 0.4);
  const starsParallaxY = useTransform(smoothParallaxY, (v) => -v * 0.4);

  // Space Tilt Transform
  const spaceRotateY = useTransform(smoothParallaxX, [-50, 50], [-4, 4]);
  const spaceRotateX = useTransform(smoothParallaxY, [-50, 50], [4, -4]);

  // Handle global container mouse movement
  const handleContainerMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    const normX = ((clientX / innerWidth) - 0.5) * 80;
    const normY = ((clientY / innerHeight) - 0.5) * 80;

    mouseScreenX.set(normX);
    mouseScreenY.set(normY);
    setMouseOffset({
      x: (clientX / innerWidth - 0.5) * 2,
      y: (clientY / innerHeight - 0.5) * 2,
    });
  }, [mouseScreenX, mouseScreenY]);

  // Synchronize with companion Lumi
  useEffect(() => {
    lumiSync.notifyModal('letters-universe', true);
    if (onSpeak) {
      onSpeak("Nandito ang mga liham nating dalawa... lumulutang sa kalawakan 💌✨");
    }
    return () => {
      lumiSync.notifyModal('letters-universe', false);
    };
  }, [onSpeak]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isPreviewIframeOpen) {
          setIsPreviewIframeOpen(false);
        } else if (selectedLetter) {
          setSelectedLetter(null);
        } else {
          onBackToUniverse();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLetter, isPreviewIframeOpen, onBackToUniverse]);

  const handleSelectLetter = useCallback((letter: Letter) => {
    audioEngine.playStarGazeChime();
    setSelectedLetter(letter);
    setReactionSubmitted(null);
    if (onSpeak) {
      if (letter.id === 'letter-11-monthsary') {
        onSpeak("Ang espesyal nating liham para sa ika-11 buwan... 💖");
      } else {
        onSpeak(`"${letter.title}"`);
      }
    }
  }, [onSpeak]);

  const handleCloseSelectedLetter = useCallback(() => {
    audioEngine.playStarGazeChime();
    setSelectedLetter(null);
    setIsPreviewIframeOpen(false);
  }, []);

  const handleReactToLetter = (reactionText: string, emoji: string) => {
    audioEngine.playInLoveSound();
    setReactionSubmitted(reactionText);
    if (onSpeak) {
      onSpeak(`Salamat Lovey! ${emoji} Ramdam na ramdam ko ang pagmamahal mo.`);
    }
  };

  const handleHoverSound = useCallback(() => {
    audioEngine.playStarGazeChime();
  }, []);

  return (
    <div
      ref={containerRef}
      id="letters-sub-universe"
      data-lenis-prevent
      tabIndex={0}
      onMouseMove={handleContainerMouseMove}
      className="fixed inset-0 z-50 bg-slate-950 text-slate-100 overflow-hidden flex flex-col font-sans focus:outline-none select-none"
      style={{
        WebkitOverflowScrolling: 'touch',
        touchAction: 'none',
      }}
    >
      {/* PARALLAX LAYER 1: Celestial Background with Dynamic Time-of-Day Nebula Shader */}
      <motion.div
        style={{
          x: bgParallaxX,
          y: bgParallaxY,
        }}
        className="fixed -inset-10 pointer-events-none z-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-radial from-rose-950/30 via-slate-950/85 to-black" />
        
        {/* Dynamic GPU Shaded Nebula Gas Clouds with Time-of-Day Chromatics */}
        <NebulaShaderCanvas
          parallaxX={mouseOffset.x}
          parallaxY={mouseOffset.y}
          opacity={0.5}
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-gradient-to-tr from-rose-600/10 via-amber-500/10 to-transparent blur-[160px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[600px] h-[600px] rounded-full bg-pink-600/10 blur-[130px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />
      </motion.div>

      {/* PARALLAX LAYER 2: Orbit Rings */}
      <motion.div
        style={{
          x: starsParallaxX,
          y: starsParallaxY,
        }}
        className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center"
      >
        <div className="absolute w-[440px] sm:w-[680px] h-[440px] sm:h-[680px] rounded-full border-2 border-dashed border-amber-400/25 animate-spin-slow" />
        <div className="absolute w-[640px] sm:w-[980px] h-[640px] sm:h-[980px] rounded-full border border-rose-500/15" />
        <div className="absolute w-[240px] sm:w-[380px] h-[240px] sm:h-[380px] rounded-full border border-amber-400/30" />
      </motion.div>

      {/* Top Bar */}
      <header className="relative z-40 backdrop-blur-xl bg-slate-950/85 border-b border-rose-400/30 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <button
            id="back-to-main-universe-btn"
            onClick={onBackToUniverse}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-rose-500/25 text-slate-200 hover:text-rose-200 border border-white/15 hover:border-rose-400/40 text-xs font-medium transition-all group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Balik sa Kalawakan</span>
          </button>
        </div>

        {/* Header Action Highlights */}
        <div className="flex items-center gap-2">
          {/* Pause / Resume Orbit Simulation */}
          <button
            id="toggle-orbit-simulation-btn"
            onClick={() => setIsOrbitPaused(!isOrbitPaused)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-slate-300 hover:text-white text-xs font-sans transition-all"
          >
            {isOrbitPaused ? (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Lutang</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-300" />
                <span>Hinto</span>
              </>
            )}
          </button>

          {/* SUPERIOR OUTSIDE PORTAL BUTTON (Direct parent navigation) */}
          <a
            href={SECRET_LETTER_DAW_URL}
            target="_top"
            id="header-superior-portal-btn"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-pink-600 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_20px_rgba(251,191,36,0.5)] hover:scale-105"
          >
            <Crown className="w-3.5 h-3.5 fill-slate-950" />
            <span>Secret Letter</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            id="close-letters-view-btn"
            onClick={onBackToUniverse}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN 3D PARALLAX STAGE */}
      <main className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center">
        {/* Subtle Ambient Guide */}
        <div className="absolute z-0 flex flex-col items-center justify-center text-center pointer-events-none select-none px-4 max-w-lg">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500/20 to-amber-500/20 border border-amber-400/40 flex items-center justify-center shadow-[0_0_50px_rgba(251,191,36,0.3)] mb-3 animate-pulse">
            <Compass className="w-7 h-7 text-amber-300 animate-spin-slow" />
          </div>
          <h2 className="text-xl sm:text-2xl font-serif text-rose-100 font-light tracking-wide mb-1">
            Mga Liham sa Kalawakan
          </h2>
        </div>

        {/* 3D PARALLAX FLOATING ENVELOPES */}
        <motion.div
          style={{
            rotateX: spaceRotateX,
            rotateY: spaceRotateY,
            transformStyle: 'preserve-3d',
          }}
          className="absolute inset-0 flex items-center justify-center pointer-events-auto"
        >
          {LETTERS.map((letter) => {
            const config = ORBIT_CONFIGS[letter.id] || {
              initialX: 0,
              initialY: 0,
              orbitPathX: [0, 15, -15, 0],
              orbitPathY: [0, -15, 15, 0],
              orbitPathRotateZ: [0, 4, -4, 0],
              orbitPathRotateY: [-10, 10, -10],
              orbitPathRotateX: [8, -8, 8],
              duration: 20,
              delay: 0,
              depthZ: 20,
              accentGlow: 'rgba(244, 63, 94, 0.4)',
              badgeLabel: letter.tag,
              stampIcon: '💌',
              isOutsideLink: false,
            };

            return (
              <FloatingMailEnvelope
                key={letter.id}
                letter={letter}
                config={config}
                isSelected={selectedLetter?.id === letter.id}
                isOrbitPaused={isOrbitPaused}
                onSelect={handleSelectLetter}
                onHoverSound={handleHoverSound}
                parallaxX={smoothParallaxX}
                parallaxY={smoothParallaxY}
              />
            );
          })}
        </motion.div>

        {/* BOTTOM DOCK */}
        <div className="absolute bottom-6 z-30 flex items-center gap-2 overflow-x-auto max-w-full px-4 py-2 bg-slate-950/90 backdrop-blur-xl border border-rose-400/30 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8)]">
          {/* SUPERIOR OUTSIDE PORTAL DOCK BUTTON */}
          <button
            id="dock-superior-outside-letter-btn"
            onClick={() => handleSelectLetter(ELEVEN_MONTHSARY_LETTER)}
            className="px-3.5 py-1.5 rounded-full text-xs font-sans font-bold whitespace-nowrap transition-all flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-rose-500 to-pink-600 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.6)] hover:scale-105"
          >
            <Crown className="w-3.5 h-3.5 fill-slate-950" />
            <span>11th Monthsary Secret Letter</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <div className="h-4 w-px bg-white/20" />

          {/* SUBORDINATE NOTES */}
          {LETTERS.filter((l) => !l.isSpecialMilestone).map((letter) => (
            <button
              key={letter.id}
              id={`dock-letter-${letter.id}`}
              onClick={() => handleSelectLetter(letter)}
              className="px-2.5 py-1 rounded-full text-[11px] font-sans whitespace-nowrap transition-all flex items-center gap-1 bg-white/5 hover:bg-white/15 text-slate-400 hover:text-slate-200 border border-white/10"
            >
              <Mail className="w-3 h-3 text-slate-400" />
              <span>{letter.title.replace('Para sa Aking Lovey, ', '').slice(0, 20)}</span>
            </button>
          ))}
        </div>
      </main>

      {/* EXPANDED UNFOLDED LETTER MODAL */}
      <AnimatePresence>
        {selectedLetter && (
          <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 select-text">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className={`relative w-full max-w-3xl my-8 p-6 sm:p-10 rounded-3xl text-amber-50 shadow-2xl space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto ${
                selectedLetter.isSpecialMilestone
                  ? 'bg-gradient-to-b from-stone-900/95 via-rose-950/95 to-black border-2 border-amber-400/80 ring-2 ring-rose-500/50 shadow-[0_0_60px_rgba(251,191,36,0.3)]'
                  : 'bg-stone-950/95 border border-white/20'
              }`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <button
                  id="close-unfolded-letter-modal-btn"
                  onClick={handleCloseSelectedLetter}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-sans transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>I-tiklop</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-300 font-serif italic">
                    {selectedLetter.tag} &bull; {selectedLetter.date}
                  </span>
                  <button
                    onClick={handleCloseSelectedLetter}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs ml-2"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* SUPERIOR EXTERNAL PORTAL SHOWCASE BANNER */}
              {selectedLetter.isSpecialMilestone && (
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-rose-950/80 via-amber-950/60 to-stone-900/90 border-2 border-amber-400/60 text-rose-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-sans font-bold text-amber-300 tracking-wider">
                        Secret Letter Portal
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 font-serif italic leading-relaxed">
                      Ang espesyal nating liham para sa ika-11 buwan.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    {/* Opens and replaces parent tab */}
                    <a
                      href={SECRET_LETTER_DAW_URL}
                      target="_top"
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-rose-500 to-pink-600 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_20px_rgba(251,191,36,0.5)] flex items-center justify-center gap-2"
                    >
                      <Crown className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Pumasok</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => setIsPreviewIframeOpen(!isPreviewIframeOpen)}
                      className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/25 text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Globe className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isPreviewIframeOpen ? 'Itago' : 'Silipin'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Embedded Live Iframe View if toggled */}
              {selectedLetter.isSpecialMilestone && isPreviewIframeOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 pt-2 border-t border-amber-400/30"
                >
                  <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border-2 border-amber-400/50 bg-slate-900 shadow-2xl">
                    <iframe
                      src={SECRET_LETTER_DAW_URL}
                      title="Secret Letter"
                      className="w-full h-full border-0"
                      allow="autoplay; encrypted-media"
                      loading="lazy"
                    />
                  </div>
                </motion.div>
              )}

              {/* Title and Metadata */}
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-serif text-amber-100 font-medium">
                  {selectedLetter.title}
                </h2>
                <p className="text-xs text-rose-300/80 font-sans tracking-wide">
                  Mula kay Clint para kay Maica
                </p>
              </div>

              {/* Parchment Body Paragraphs */}
              <div className="space-y-4 font-serif text-base sm:text-lg leading-relaxed text-amber-50/95 italic pt-2">
                {selectedLetter.content.map((paragraph, pIdx) => (
                  <p key={pIdx} className="indent-4 sm:indent-6">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Signoff */}
              <div className="pt-6 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-xs font-sans text-slate-400">
                  Nagmamahal nang Walang Hanggan
                </div>
                <div className="font-serif text-rose-200 italic font-medium text-lg">
                  {selectedLetter.signature}
                </div>
              </div>

              {/* Reader Reactions */}
              <div className="pt-6 border-t border-white/10 space-y-3">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => handleReactToLetter("Kinikilig ako Lovey! 🥰", "🥰")}
                    className="px-3.5 py-1.5 rounded-full bg-pink-500/20 hover:bg-pink-500/35 border border-pink-400/40 text-pink-100 text-xs font-sans transition-all hover:scale-105 flex items-center gap-1.5"
                  >
                    <span>🥰</span>
                    <span>Kinikilig ako</span>
                  </button>

                  <button
                    onClick={() => handleReactToLetter("Naiyak ako sa ganda ng liham 🥺", "🥺")}
                    className="px-3.5 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/40 text-rose-100 text-xs font-sans transition-all hover:scale-105 flex items-center gap-1.5"
                  >
                    <span>🥺</span>
                    <span>Naiyak sa tuwa</span>
                  </button>

                  <button
                    onClick={() => handleReactToLetter("Mahigpit na virtual yakap sa'yo! 🫂", "🫂")}
                    className="px-3.5 py-1.5 rounded-full bg-purple-500/20 hover:bg-purple-500/35 border border-purple-400/40 text-purple-100 text-xs font-sans transition-all hover:scale-105 flex items-center gap-1.5"
                  >
                    <span>🫂</span>
                    <span>Virtual Yakap</span>
                  </button>

                  <button
                    onClick={() => handleReactToLetter("Mahal na mahal din kita Clint! 💖", "💖")}
                    className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-pink-600 text-slate-950 font-bold text-xs font-sans transition-all hover:scale-105 flex items-center gap-1.5 shadow-md"
                  >
                    <span>💖</span>
                    <span>Mahal na mahal din kita</span>
                  </button>
                </div>

                {reactionSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-xs text-pink-300 font-serif italic pt-1"
                  >
                    ✓ Naipadala: "{reactionSubmitted}"
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});

LettersSubUniverseView.displayName = 'LettersSubUniverseView';

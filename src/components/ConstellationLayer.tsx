import React, { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  WORLDS,
  PANGILATAN_LINES,
} from '../data/universeData';
import { WorldStar } from '../types';
import {
  Sparkles,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { World3DIcon } from './World3DIcon';
import { audioEngine } from '../utils/audioEngine';
import { isFirstYearAnniversaryUnlocked } from '../utils/timeHelper';

// Ensure ScrollTrigger is registered with GSAP
gsap.registerPlugin(ScrollTrigger);

interface ConstellationLayerProps {
  onSelectWorld: (world: WorldStar) => void;
  onSpeak: (line: string, isAche?: boolean) => void;
  onOpenPangilatan: (line: string) => void;
  previewedIds: Set<string>;
  lenis?: Lenis | null;
}

// 5 World arrival stops along the normalized progress timeline [0..1]
// World 0: 0.00, World 1: 0.20, World 2: 0.40, World 3: 0.60, World 4: 0.80, Closing: 0.98
const WORLD_STOPS = [0.0, 0.2, 0.4, 0.6, 0.8];
const CLOSING_STOP = 0.98;
const ALL_STOPS = [...WORLD_STOPS, CLOSING_STOP];

// Subtle celestial lateral offsets (in vw / vh) to form an organic flight path through space
const FLIGHT_PATH_OFFSETS = [
  { x: 0, y: 0 },
  { x: -14, y: 3 },
  { x: 14, y: -2 },
  { x: -10, y: 4 },
  { x: 12, y: -2 },
];

export const ConstellationLayer: React.FC<ConstellationLayerProps> = memo(({
  onSelectWorld,
  onSpeak,
  onOpenPangilatan,
  previewedIds,
  lenis,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Scroll progress state [0..1]
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeWorldIndex, setActiveWorldIndex] = useState(0);
  const [isSettled, setIsSettled] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const settleTimeoutRef = useRef<number | null>(null);

  // Selected spoken line for Pangilatan Mountain
  const [selectedMountainLine] = useState(() => {
    return PANGILATAN_LINES[Math.floor(Math.random() * PANGILATAN_LINES.length)];
  });

  // Track anniversary unlock time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Detect prefers-reduced-motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Synchronize ScrollTrigger and scroll position
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Scroll handler that calculates progress within the journey track
    const updateProgress = () => {
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;

      const progress = Math.min(1, Math.max(0, -rect.top / totalScrollable));
      setScrollProgress(progress);

      // Determine the nearest world index
      const mappedPos = progress / 0.2;
      const nearestIndex = Math.min(WORLDS.length - 1, Math.max(0, Math.round(mappedPos)));

      // Check distance from nearest stop for arrival settling
      const nearestStop = WORLD_STOPS[nearestIndex];
      const distFromStop = Math.abs(progress - nearestStop);

      // Actively travelling vs settled
      setIsSettled(distFromStop < 0.055);
      setActiveWorldIndex(nearestIndex);

      // Debounce settling flag
      if (settleTimeoutRef.current) {
        window.clearTimeout(settleTimeoutRef.current);
      }
      settleTimeoutRef.current = window.setTimeout(() => {
        setIsSettled(true);
      }, 160);
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    updateProgress();

    // GSAP ScrollTrigger snap to deliberate world arrival points
    const trigger = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      snap: {
        snapTo: ALL_STOPS,
        duration: { min: 0.25, max: 0.55 },
        delay: 0.08,
        ease: 'power1.out',
      },
      onUpdate: (self) => {
        setScrollProgress(self.progress);
      },
    });

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
      trigger.kill();
      if (settleTimeoutRef.current) {
        window.clearTimeout(settleTimeoutRef.current);
      }
    };
  }, []);

  // Programmatically travel to a specific world stop
  const scrollToStop = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const targetProgress = index < WORLD_STOPS.length ? WORLD_STOPS[index] : CLOSING_STOP;
    const totalScrollable = track.offsetHeight - window.innerHeight;
    const targetY = track.offsetTop + targetProgress * totalScrollable;

    if (lenis) {
      lenis.scrollTo(targetY, { duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    } else {
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  }, [lenis]);

  // Keyboard navigation between worlds (ArrowDown / ArrowUp / PageDown / PageUp)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input or text area
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (activeWorldIndex < WORLDS.length - 1) {
          e.preventDefault();
          scrollToStop(activeWorldIndex + 1);
        } else if (activeWorldIndex === WORLDS.length - 1 && scrollProgress < 0.9) {
          e.preventDefault();
          scrollToStop(WORLDS.length); // Closing moment
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (scrollProgress > 0.9) {
          e.preventDefault();
          scrollToStop(WORLDS.length - 1);
        } else if (activeWorldIndex > 0) {
          e.preventDefault();
          scrollToStop(activeWorldIndex - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeWorldIndex, scrollProgress, scrollToStop]);

  // Handle Pangilatan Mountain waypoint selection
  const handleMountainClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSpeak(selectedMountainLine);
    onOpenPangilatan(selectedMountainLine);
  };

  // Continuous world position [0..5]
  const currentWorldPosition = scrollProgress / 0.2;

  // Active arrived world object
  const arrivedWorld = WORLDS[activeWorldIndex];
  const isNearWorldArrival = Math.abs(currentWorldPosition - activeWorldIndex) < 0.28 && isSettled;
  const isClosingMoment = scrollProgress > 0.92;

  return (
    <div
      ref={containerRef}
      id="forward-3d-world-journey"
      className="relative w-full text-slate-100 select-none"
    >
      {/* Tall Scroll Track establishing the journey distance (550vh) */}
      <div ref={trackRef} className="relative w-full h-[550vh]">
        {/* Sticky Full-Viewport 3D Celestial Stage */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center">

          {/* 3D Perspective Viewport */}
          <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden"
            style={{
              perspective: '1200px',
              perspectiveOrigin: '50% 50%',
            }}
          >
            {/* Ambient Cosmic Horizon Glow */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
              style={{
                background: arrivedWorld && !isClosingMoment
                  ? `radial-gradient(circle at 50% 48%, ${arrivedWorld.starColor}22 0%, transparent 68%)`
                  : 'radial-gradient(circle at 50% 48%, rgba(244, 213, 141, 0.12) 0%, transparent 68%)',
                opacity: isNearWorldArrival ? 1 : 0.45,
              }}
            />

            {/* Subtle Constellation Path Line between sequential worlds in 3D */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-25 mix-blend-screen"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="cosmic-path-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f4d58d" stopOpacity="0.8" />
                  <stop offset="25%" stopColor="#c084fc" stopOpacity="0.7" />
                  <stop offset="50%" stopColor="#fb7185" stopOpacity="0.8" />
                  <stop offset="75%" stopColor="#34d399" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              <line
                x1="25%"
                y1="35%"
                x2="75%"
                y2="65%"
                stroke="url(#cosmic-path-grad)"
                strokeWidth="1.5"
                strokeDasharray="4 8"
              />
            </svg>

            {/* Standalone Pangilatan Mountain Waypoint (Preserved off-path side destination) */}
            <div
              id="pangilatan-side-waypoint"
              onClick={handleMountainClick}
              className="absolute top-20 sm:top-24 right-4 sm:right-10 z-30 group cursor-pointer flex flex-col items-end transition-transform duration-300 hover:scale-105"
            >
              <div className="relative flex items-center gap-2">
                {/* Emerald ambient glow */}
                <div className="absolute -inset-2 rounded-full bg-emerald-500/30 blur-md group-hover:scale-140 transition-transform duration-500" />

                {/* Tag / Tooltip */}
                <span className="glass-pill text-[11px] font-serif tracking-wider text-emerald-200 border border-emerald-400/40 px-2.5 py-1 rounded-full shadow-lg group-hover:border-emerald-300 group-hover:text-emerald-100 transition-colors">
                  ⛰️ Pangilatan Mountain
                </span>

                {/* 4-Pointed Star Icon */}
                <div className="relative w-8 h-8 rounded-full bg-emerald-950/80 border border-emerald-400/60 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                  <svg viewBox="0 0 100 100" className="w-5 h-5 drop-shadow-[0_0_8px_#10b981] animate-spin-slow">
                    <path
                      d="M 50 0 L 60 40 L 100 50 L 60 60 L 50 100 L 40 60 L 0 50 L 40 40 Z"
                      fill="#34d399"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Spatial World Journey 3D Node Array */}
            {WORLDS.map((world, idx) => {
              // Delta: distance in world units from the camera focal plane
              const delta = idx - currentWorldPosition;
              const isCurrent = idx === activeWorldIndex;
              const isArrived = isCurrent && isNearWorldArrival && !isClosingMoment;
              const hasBeenPreviewed = previewedIds.has(world.id);

              // 3D Spatial Parameters
              let translateZ = 0;
              let scale = 1;
              let opacity = 0;
              let blurPx = 0;
              let pointerEvents: 'auto' | 'none' = 'none';

              if (isReducedMotion) {
                // Reduced motion: 2D cross-fade without 3D translation
                if (Math.abs(delta) < 0.6) {
                  opacity = Math.max(0, 1 - Math.abs(delta) * 1.6);
                  scale = 0.95 + (1 - Math.abs(delta)) * 0.08;
                  pointerEvents = isArrived ? 'auto' : 'none';
                }
              } else {
                // Full 3D Forward Travel Choreography
                if (delta > 0) {
                  // Upcoming world ahead in deep space (incoming)
                  translateZ = -delta * 860;
                  scale = Math.max(0.18, 1 - delta * 0.28);
                  // Fade out as it goes further into deep space
                  if (delta <= 1.0) {
                    opacity = Math.max(0.2, 1 - delta * 0.65);
                  } else if (delta <= 2.2) {
                    opacity = Math.max(0.06, 0.35 - (delta - 1) * 0.22);
                  } else {
                    opacity = 0;
                  }
                  pointerEvents = 'none';
                } else if (delta < 0) {
                  // Previous world receding past the camera (outgoing)
                  const absDelta = -delta;
                  translateZ = absDelta * 520; // moves forward past camera
                  scale = 1 + absDelta * 0.65;
                  opacity = Math.max(0, 1 - absDelta * 1.7);
                  blurPx = Math.min(12, absDelta * 9);
                  pointerEvents = 'none';
                } else {
                  // Exactly at focal plane
                  translateZ = 0;
                  scale = 1;
                  opacity = 1;
                  blurPx = 0;
                  pointerEvents = isArrived ? 'auto' : 'none';
                }

                if (isArrived) {
                  pointerEvents = 'auto';
                }
              }

              // Flight path lateral offset
              const offset = FLIGHT_PATH_OFFSETS[idx] || { x: 0, y: 0 };
              const offsetX = isReducedMotion ? 0 : offset.x * (1 - Math.min(1, Math.abs(delta) * 0.6));
              const offsetY = isReducedMotion ? 0 : offset.y * (1 - Math.min(1, Math.abs(delta) * 0.6));

              // If completely invisible, cull from visual DOM rendering
              if (opacity <= 0.01) {
                return null;
              }

              return (
                <div
                  key={world.id}
                  id={`world-node-${world.id}`}
                  style={{
                    transform: isReducedMotion
                      ? `scale(${scale})`
                      : `translate3d(calc(-50% + ${offsetX}vw), calc(-50% + ${offsetY}vh), ${translateZ}px) scale(${scale})`,
                    opacity,
                    filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
                    pointerEvents,
                    zIndex: isArrived ? 25 : Math.round(20 - Math.abs(delta) * 5),
                  }}
                  className="absolute top-1/2 left-1/2 transform-gpu transition-[opacity] duration-300 flex flex-col items-center justify-center will-change-transform"
                >
                  {/* Core 3D Celestial Body */}
                  <div
                    onClick={() => {
                      if (!world.active) {
                        audioEngine.playLockedSound();
                        onSpeak(world.previewLine || 'Pansamantalang naka-lock pa ang mundong ito, Lovey. 🔒');
                      } else {
                        onSpeak(world.previewLine);
                        onSelectWorld(world);
                      }
                    }}
                    className={`group relative cursor-pointer flex items-center justify-center transition-transform duration-500 ${
                      isArrived ? 'hover:scale-108' : ''
                    }`}
                  >
                    {/* Ambient Celestial Starlight Aura */}
                    <div
                      className="absolute -inset-10 sm:-inset-14 rounded-full blur-3xl pointer-events-none transition-all duration-700"
                      style={{
                        backgroundColor: world.active ? world.starColor : '#64748b',
                        opacity: isArrived ? 0.75 : 0.35,
                      }}
                    />

                    {/* Orbit Ring */}
                    {world.active && (
                      <div
                        className={`absolute -inset-4 sm:-inset-6 rounded-full border border-white/20 transition-all duration-700 pointer-events-none ${
                          isArrived ? 'animate-ping opacity-35' : 'opacity-10'
                        }`}
                        style={{
                          borderColor: world.starColor,
                          animationDuration: `${3.5 + idx * 0.5}s`,
                        }}
                      />
                    )}

                    {/* Glass Celestial Sphere Housing World3DIcon */}
                    <div
                      className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all duration-500 shadow-2xl ${
                        isArrived
                          ? 'border-white/50 shadow-[0_0_50px_rgba(255,255,255,0.3)] bg-gradient-to-b from-white/20 via-slate-950/70 to-slate-950/90'
                          : 'border-white/20 bg-slate-950/60 opacity-80'
                      }`}
                      style={{
                        borderColor: isArrived ? world.starColor : undefined,
                        boxShadow: isArrived
                          ? `0 0 45px ${world.starColor}80, inset 0 2px 4px rgba(255,255,255,0.4)`
                          : `0 0 20px ${world.starColor}30`,
                      }}
                    >
                      {/* Specular highlight */}
                      <div className="absolute top-2 inset-x-4 h-4 rounded-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

                      {/* Three.js Interactive 3D Mesh */}
                      <World3DIcon
                        worldId={world.id}
                        color={world.starColor}
                        isActive={world.active}
                        isHovered={isArrived}
                        size={typeof window !== 'undefined' && window.innerWidth < 640 ? 84 : 108}
                      />

                      {/* Order Number Badge */}
                      <span
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full text-slate-950 text-xs font-bold font-mono flex items-center justify-center shadow-md"
                        style={{ backgroundColor: world.starColor }}
                      >
                        {world.order}
                      </span>
                    </div>
                  </div>

                  {/* World Arrival Destination Card & Primary Visit Button */}
                  <div
                    className={`mt-6 sm:mt-8 w-[92vw] max-w-sm mx-auto text-center px-5 py-5 sm:px-6 sm:py-6 rounded-3xl glass-card backdrop-blur-2xl border transition-all duration-500 ${
                      isArrived
                        ? 'opacity-100 translate-y-0 pointer-events-auto border-white/35 shadow-[0_20px_50px_rgba(0,0,0,0.65)]'
                        : 'opacity-0 translate-y-4 pointer-events-none border-transparent'
                    }`}
                  >
                    {/* Specular top rim line */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

                    {/* World Order Indicator */}
                    <div className="flex items-center justify-center gap-2 mb-1.5">
                      <span className="text-[10px] tracking-[0.25em] uppercase font-mono text-amber-300/80">
                        World {world.order} of {WORLDS.length}
                      </span>
                    </div>

                    {/* World Title */}
                    <h2
                      className="text-2xl sm:text-3xl font-serif font-medium tracking-wide mb-1"
                      style={{ color: world.starColor }}
                    >
                      {world.name}
                    </h2>

                    {/* Tagline */}
                    <p className="text-xs sm:text-sm text-amber-100/90 font-sans tracking-wide mb-2">
                      {world.tagline}
                    </p>

                    {/* Short Description */}
                    <p className="text-xs text-slate-300/80 font-serif italic leading-relaxed max-w-xs mx-auto mb-4">
                      {world.description}
                    </p>

                    {/* Primary Visit Button */}
                    <div className="flex items-center justify-center pt-1">
                      {!world.active ? (
                        <button
                          id={`btn-visit-${world.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            audioEngine.playLockedSound();
                            onSpeak(world.previewLine || 'Pansamantalang naka-lock pa ang mundong ito, Lovey. 🔒');
                          }}
                          className="glass-pill text-xs px-5 py-2.5 rounded-full font-sans tracking-wider text-rose-300/90 hover:text-rose-200 transition-all flex items-center gap-1.5 border border-rose-400/40 cursor-pointer shadow-md active:scale-95"
                        >
                          <Lock className="w-3.5 h-3.5 text-rose-400" />
                          <span>Naka-lock</span>
                        </button>
                      ) : world.id === 'our-first-year' && !isFirstYearAnniversaryUnlocked(currentTime) ? (
                        <button
                          type="button"
                          id={`btn-visit-${world.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            audioEngine.playLockedSound();
                            onSpeak('Hindi pa ito ang tamang oras hanggang sa Setyembre 22, 2026 nang 9:00 PM... Sabay nating bubuksan sa ating 1st Anniversary, Lovey! 🔒✨');
                          }}
                          className="glass-pill text-xs px-5 py-2.5 rounded-full font-sans tracking-wider text-amber-300/90 transition-all flex items-center gap-1.5 border border-amber-400/40 shadow-md cursor-pointer active:scale-95"
                        >
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Naka-lock &bull; Sept 22</span>
                        </button>
                      ) : (
                        <button
                          id={`btn-visit-${world.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSpeak(world.previewLine);
                            onSelectWorld(world);
                          }}
                          className="px-7 py-2.5 rounded-full font-serif font-bold text-xs sm:text-sm tracking-wider uppercase text-slate-950 transition-all duration-300 flex items-center gap-2 shadow-[0_0_30px_rgba(251,191,36,0.6)] hover:shadow-[0_0_40px_rgba(251,191,36,0.85)] hover:scale-105 active:scale-95 cursor-pointer"
                          style={{
                            background: `linear-gradient(135deg, #ffffff 0%, ${world.starColor} 60%, #ffffff 100%)`,
                          }}
                        >
                          <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950" />
                          <span>Visit</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Closing Horizon Moment (Beyond World 5) */}
            <div
              id="journey-closing-moment"
              style={{
                opacity: isClosingMoment ? 1 : 0,
                transform: isClosingMoment ? 'translate3d(0, 0, 0)' : 'translate3d(0, 30px, 0)',
                pointerEvents: isClosingMoment ? 'auto' : 'none',
              }}
              className="absolute z-20 text-center transition-all duration-700 max-w-md px-6 py-8 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80 mb-2 font-mono">
                Wakas at Bagong Simula
              </p>
              <p className="text-lg sm:text-xl font-serif italic text-amber-100/95 leading-relaxed">
                "Maraming pang mundo ang malilikha, sooner, heheh."
              </p>
              <p className="text-xs text-slate-400 mt-3 font-sans">
                Para sa ating dalawa, magpakailanman &bull; Clint &amp; Maica
              </p>
              <button
                onClick={() => scrollToStop(0)}
                className="mt-5 glass-pill text-xs text-amber-200 px-4 py-2 rounded-full flex items-center gap-1.5 mx-auto hover:text-white border border-amber-300/30 transition-all hover:scale-105 cursor-pointer"
              >
                <ChevronUp className="w-3.5 h-3.5 text-amber-300" />
                <span>Bumalik sa Simula</span>
              </button>
            </div>
          </div>

          {/* Minimal 5-Point Journey Position Indicator (Bottom Floating Pill) */}
          <div className="fixed bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center gap-2 sm:gap-3 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full glass-panel border border-white/20 shadow-2xl backdrop-blur-xl">
            {/* Previous World Button */}
            <button
              onClick={() => {
                if (activeWorldIndex > 0) scrollToStop(activeWorldIndex - 1);
              }}
              disabled={activeWorldIndex === 0 && scrollProgress <= 0.05}
              title="Previous Destination"
              className="p-1 rounded-full text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronUp className="w-3.5 h-3.5 rotate-[-90deg]" />
            </button>

            {/* World Label */}
            <span className="text-[11px] font-mono font-medium tracking-wider text-slate-200 whitespace-nowrap hidden xs:inline">
              {isClosingMoment ? 'Horizon' : `World ${activeWorldIndex + 1} of ${WORLDS.length}`}
            </span>

            {/* 5 Destination Dots */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {WORLDS.map((w, idx) => {
                const isActive = idx === activeWorldIndex && !isClosingMoment;
                return (
                  <button
                    key={w.id}
                    onClick={() => scrollToStop(idx)}
                    title={`Jump to ${w.name}`}
                    className={`group relative rounded-full transition-all duration-300 cursor-pointer ${
                      isActive ? 'w-5 h-2 sm:w-6 sm:h-2.5' : 'w-2 h-2 sm:w-2.5 sm:h-2.5 hover:scale-130'
                    }`}
                    style={{
                      backgroundColor: isActive ? w.starColor : 'rgba(255, 255, 255, 0.25)',
                      boxShadow: isActive ? `0 0 10px ${w.starColor}` : undefined,
                    }}
                  >
                    {/* Hover Tooltip */}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-0.5 rounded text-[10px] font-sans font-medium whitespace-nowrap bg-slate-900/90 text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      {w.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Next World Button */}
            <button
              onClick={() => {
                if (activeWorldIndex < WORLDS.length - 1) {
                  scrollToStop(activeWorldIndex + 1);
                } else if (!isClosingMoment) {
                  scrollToStop(WORLDS.length);
                }
              }}
              disabled={isClosingMoment}
              title="Next Destination"
              className="p-1 rounded-full text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5 rotate-[-90deg]" />
            </button>
          </div>

          {/* Scroll Down Hint on initial world arrival */}
          {activeWorldIndex === 0 && scrollProgress < 0.05 && (
            <div className="fixed bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-bounce flex flex-col items-center gap-1 text-[11px] font-sans text-amber-200/80">
              <span className="tracking-widest uppercase text-[9px] font-mono">Scroll forward to explore</span>
              <ChevronDown className="w-4 h-4 text-amber-300" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ConstellationLayer.displayName = 'ConstellationLayer';

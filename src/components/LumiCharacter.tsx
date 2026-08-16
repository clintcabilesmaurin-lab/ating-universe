import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { LumiThreeCore, LumiMood } from './LumiThreeCore';

export type { LumiMood };

interface LumiCharacterProps {
  mood: LumiMood;
  isBouncing?: boolean;
  isFlying?: boolean;
  isSleeping?: boolean;
  isHovered?: boolean;
  size?: number;
  onSpinComplete?: () => void;
}

export const LumiCharacter: React.FC<LumiCharacterProps> = ({
  mood,
  isBouncing = false,
  isFlying = false,
  isSleeping = false,
  isHovered = false,
  size = 84,
  onSpinComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const eyeLeftRef = useRef<SVGGElement>(null);
  const eyeRightRef = useRef<SVGGElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; size: number }[]>([]);

  // Eye tracking with GSAP quickTo for ultra-smooth responsiveness
  const quickEyeLeftX = useRef<((value: number) => void) | null>(null);
  const quickEyeLeftY = useRef<((value: number) => void) | null>(null);
  const quickEyeRightX = useRef<((value: number) => void) | null>(null);
  const quickEyeRightY = useRef<((value: number) => void) | null>(null);

  useEffect(() => {
    if (eyeLeftRef.current && eyeRightRef.current) {
      quickEyeLeftX.current = gsap.quickTo(eyeLeftRef.current, 'x', { duration: 0.3, ease: 'power2.out' });
      quickEyeLeftY.current = gsap.quickTo(eyeLeftRef.current, 'y', { duration: 0.3, ease: 'power2.out' });
      quickEyeRightX.current = gsap.quickTo(eyeRightRef.current, 'x', { duration: 0.3, ease: 'power2.out' });
      quickEyeRightY.current = gsap.quickTo(eyeRightRef.current, 'y', { duration: 0.3, ease: 'power2.out' });
    }
  }, []);

  // Track global mouse position to direct Lumi's gaze
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);

      const clampedX = Math.max(-1, Math.min(1, dx));
      const clampedY = Math.max(-1, Math.min(1, dy));

      setMousePos({ x: clampedX, y: clampedY });

      // Pupil offset max 3px
      const eyeOffsetX = clampedX * 3.2;
      const eyeOffsetY = clampedY * 2.8;

      if (quickEyeLeftX.current) quickEyeLeftX.current(eyeOffsetX);
      if (quickEyeLeftY.current) quickEyeLeftY.current(eyeOffsetY);
      if (quickEyeRightX.current) quickEyeRightX.current(eyeOffsetX);
      if (quickEyeRightY.current) quickEyeRightY.current(eyeOffsetY);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Natural blinking interval
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (mood !== 'sleepy' && !isSleeping) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 180);
      }
    }, 3800 + Math.random() * 2500);

    return () => clearInterval(blinkInterval);
  }, [mood, isSleeping]);

  // GSAP 3D Spin Flip on bounce or tap
  useEffect(() => {
    if (isBouncing && characterRef.current) {
      setIsSpinning(true);

      // Spawn GSAP burst particles
      const newParticles = Array.from({ length: 10 }).map((_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 60,
        y: (Math.random() - 0.5) * 60,
        color: ['#fbbf24', '#f43f5e', '#38bdf8', '#c084fc', '#ffffff'][Math.floor(Math.random() * 5)],
        size: 3 + Math.random() * 4,
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 800);

      gsap.timeline()
        .to(characterRef.current, {
          rotationY: '+=360',
          scale: 1.22,
          y: -12,
          duration: 0.65,
          ease: 'back.out(2)',
        })
        .to(characterRef.current, {
          scale: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
          onComplete: () => {
            setIsSpinning(false);
            if (onSpinComplete) onSpinComplete();
          },
        });
    }
  }, [isBouncing]);

  // Theme palettes and facial accents per mood
  const getMoodAesthetic = () => {
    switch (mood) {
      case 'loving':
        return {
          glow: 'rgba(251, 113, 133, 0.55)',
          bodyGrad: ['#fff1f2', '#ffe4e6', '#fecdd3'],
          cheek: '#fb7185',
          sparkle: '#fda4af',
          halo: '#f43f5e',
          shadow: 'rgba(244, 63, 94, 0.4)',
        };
      case 'starry':
        return {
          glow: 'rgba(56, 189, 248, 0.55)',
          bodyGrad: ['#f0f9ff', '#e0f2fe', '#bae6fd'],
          cheek: '#38bdf8',
          sparkle: '#7dd3fc',
          halo: '#0284c7',
          shadow: 'rgba(2, 132, 199, 0.4)',
        };
      case 'playful':
        return {
          glow: 'rgba(250, 204, 21, 0.55)',
          bodyGrad: ['#fefce8', '#fef9c3', '#fef08a'],
          cheek: '#f59e0b',
          sparkle: '#fde047',
          halo: '#eab308',
          shadow: 'rgba(234, 179, 8, 0.4)',
        };
      case 'tender':
        return {
          glow: 'rgba(192, 132, 252, 0.55)',
          bodyGrad: ['#faf5ff', '#f3e8ff', '#e9d5ff'],
          cheek: '#c084fc',
          sparkle: '#d8b4fe',
          halo: '#a855f7',
          shadow: 'rgba(168, 85, 247, 0.4)',
        };
      case 'ache':
        return {
          glow: 'rgba(168, 85, 247, 0.55)',
          bodyGrad: ['#f5f3ff', '#ede9fe', '#ddd6fe'],
          cheek: '#a78bfa',
          sparkle: '#c4b5fd',
          halo: '#7c3aed',
          shadow: 'rgba(124, 58, 237, 0.4)',
        };
      case 'curious':
        return {
          glow: 'rgba(52, 211, 153, 0.55)',
          bodyGrad: ['#ecfdf5', '#d1fae5', '#a7f3d0'],
          cheek: '#10b981',
          sparkle: '#6ee7b7',
          halo: '#059669',
          shadow: 'rgba(5, 150, 105, 0.4)',
        };
      case 'sleepy':
        return {
          glow: 'rgba(148, 163, 184, 0.45)',
          bodyGrad: ['#f8fafc', '#f1f5f9', '#e2e8f0'],
          cheek: '#94a3b8',
          sparkle: '#cbd5e1',
          halo: '#64748b',
          shadow: 'rgba(100, 116, 139, 0.3)',
        };
      case 'giggle':
        return {
          glow: 'rgba(244, 114, 182, 0.55)',
          bodyGrad: ['#fdf2f8', '#fce7f3', '#fbcfe8'],
          cheek: '#ec4899',
          sparkle: '#f472b6',
          halo: '#db2777',
          shadow: 'rgba(219, 39, 119, 0.4)',
        };
      case 'happy':
      default:
        return {
          glow: 'rgba(244, 213, 141, 0.55)',
          bodyGrad: ['#fffbeb', '#fef3c7', '#fde68a'],
          cheek: '#fb923c',
          sparkle: '#fcd34d',
          halo: '#f59e0b',
          shadow: 'rgba(245, 158, 11, 0.4)',
        };
    }
  };

  const style = getMoodAesthetic();

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center select-none pointer-events-none"
      style={{ width: size, height: size, perspective: 1000 }}
    >
      {/* 1. Ambient Volumetric Glow Background */}
      <motion.div
        animate={{
          scale: isHovered ? [1.2, 1.4, 1.2] : [1, 1.22, 1],
          opacity: isHovered ? [0.65, 0.9, 0.65] : [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
        style={{ backgroundColor: style.glow }}
      />

      {/* 2. Orbiting Stardust Wandering Particles */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 flex items-start justify-center pointer-events-none"
      >
        <div
          className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] -translate-y-1.5 animate-pulse"
          style={{ backgroundColor: style.sparkle, color: style.sparkle }}
        />
      </motion.div>
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 flex items-end justify-center pointer-events-none"
      >
        <div
          className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] translate-y-1.5"
          style={{ backgroundColor: style.cheek, color: style.cheek }}
        />
      </motion.div>

      {/* 3. Tap Particle Burst Shards */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: p.x * 1.5, y: p.y * 1.5, scale: 0, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 10px ${p.color}`,
            }}
          />
        ))}
      </AnimatePresence>

      {/* 4. Main Animated Character Avatar */}
      <div
        ref={characterRef}
        className="relative w-full h-full flex items-center justify-center"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Layer A: Three.js 3D Celestial Core Sphere inside Lumi's chest */}
        <div className="absolute inset-0 flex items-center justify-center scale-90 z-0">
          <LumiThreeCore
            mood={mood}
            isHovered={isHovered}
            isSpinning={isSpinning}
            size={size * 0.92}
            interactiveX={mousePos.x}
            interactiveY={mousePos.y}
          />
        </div>

        {/* Layer B: SVG Expressive Fairy Character Body & Face Over Core */}
        <motion.svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.55)] overflow-visible relative z-10"
          animate={{
            rotate: isFlying ? [0, 6, -6, 0] : mood === 'curious' ? [0, 8, 4, 8] : [0, 2.5, -2.5, 0],
            y: isFlying ? [0, -4, 0] : [0, -2, 0],
          }}
          transition={{
            rotate: { duration: isFlying ? 2.5 : 4.5, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <defs>
            <radialGradient id={`lumi-body-${mood}`} cx="45%" cy="35%" r="65%">
              <stop offset="0%" stopColor={style.bodyGrad[0]} />
              <stop offset="60%" stopColor={style.bodyGrad[1]} stopOpacity="0.85" />
              <stop offset="100%" stopColor={style.bodyGrad[2]} stopOpacity="0.75" />
            </radialGradient>

            <linearGradient id={`lumi-wing-${mood}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="60%" stopColor={style.sparkle} stopOpacity="0.7" />
              <stop offset="100%" stopColor={style.halo} stopOpacity="0.3" />
            </linearGradient>

            <filter id="lumi-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Left Wing (Fluttering with Sine Wave) */}
          <motion.g
            animate={{
              rotate: isFlying ? [-16, 22, -16] : [-8, 14, -8],
              scaleY: isFlying ? [0.8, 1.2, 0.8] : [0.9, 1.1, 0.9],
            }}
            transition={{ duration: isFlying ? 0.6 : 1.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '28px', originY: '48px' }}
          >
            <path
              d="M 28 48 C 10 32, 2 46, 8 58 C 14 68, 25 58, 28 50 Z"
              fill={`url(#lumi-wing-${mood})`}
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="1"
            />
            {/* Wing Feather Detail */}
            <path d="M 12 50 C 18 48, 24 52, 28 50" stroke="rgba(255,255,255,0.6)" strokeWidth="0.6" fill="none" />
          </motion.g>

          {/* Right Wing (Fluttering with Sine Wave) */}
          <motion.g
            animate={{
              rotate: isFlying ? [16, -22, 16] : [8, -14, 8],
              scaleY: isFlying ? [0.8, 1.2, 0.8] : [0.9, 1.1, 0.9],
            }}
            transition={{ duration: isFlying ? 0.6 : 1.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '72px', originY: '48px' }}
          >
            <path
              d="M 72 48 C 90 32, 98 46, 92 58 C 86 68, 75 58, 72 50 Z"
              fill={`url(#lumi-wing-${mood})`}
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="1"
            />
            <path d="M 88 50 C 82 48, 76 52, 72 50" stroke="rgba(255,255,255,0.6)" strokeWidth="0.6" fill="none" />
          </motion.g>

          {/* Plump Glassy Star-Fairy Silhouette Body */}
          <path
            d="M 50 14 
               C 53 27, 62 31, 74 27 
               C 85 24, 90 36, 82 46 
               C 76 54, 78 64, 88 74 
               C 96 82, 86 92, 74 88 
               C 63 84, 55 90, 50 96 
               C 45 90, 37 84, 26 88 
               C 14 92, 4 82, 12 74 
               C 22 64, 24 54, 18 46 
               C 10 36, 15 24, 26 27 
               C 38 31, 47 27, 50 14 Z"
            fill={`url(#lumi-body-${mood})`}
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="1.6"
          />

          {/* Floating Star Halo / Celestial Tiara */}
          <motion.g
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ellipse
              cx="50"
              cy="10"
              rx="15"
              ry="4.5"
              fill="none"
              stroke={style.halo}
              strokeWidth="2"
              strokeDasharray="3 1.5"
              filter="url(#lumi-glow)"
            />
            {/* Halo Diamond Gem */}
            <polygon
              points="50,6 52,8 50,10 48,8"
              fill="#ffffff"
              stroke={style.halo}
              strokeWidth="0.8"
            />
          </motion.g>

          {/* Rosy Blush Cheeks */}
          <ellipse cx="30" cy="55" rx="5" ry="3" fill={style.cheek} opacity="0.65" />
          <ellipse cx="70" cy="55" rx="5" ry="3" fill={style.cheek} opacity="0.65" />

          {/* ================= FACIAL EXPRESSIONS ================= */}
          {/* Eyebrows */}
          {mood === 'curious' ? (
            <g stroke="#334155" strokeWidth="1.5" strokeLinecap="round" fill="none">
              <path d="M 33 39 Q 38 36 43 40" />
              <path d="M 57 41 Q 62 42 67 40" />
            </g>
          ) : mood === 'ache' ? (
            <g stroke="#475569" strokeWidth="1.4" strokeLinecap="round" fill="none">
              <path d="M 34 40 Q 39 42 44 39" />
              <path d="M 56 39 Q 61 42 66 40" />
            </g>
          ) : (
            <g stroke="#475569" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7">
              <path d="M 34 40 Q 39 37 44 40" />
              <path d="M 56 40 Q 61 37 66 40" />
            </g>
          )}

          {/* Eyes Group with Dynamic GSAP Pupillary Tracking */}
          {isBlinking || isSleeping || mood === 'sleepy' ? (
            // Sleeping / Blinking Peaceful Arcs (^ ^)
            <g stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" fill="none">
              <path d="M 33 50 Q 38 43 44 50" />
              <path d="M 56 50 Q 61 43 67 50" />
            </g>
          ) : mood === 'loving' ? (
            // Loving Heart Eyes with Shimmer
            <g>
              <g ref={eyeLeftRef}>
                <path
                  d="M 38 46 C 35 40, 29 42, 32 48 L 38 55 L 44 48 C 47 42, 41 40, 38 46 Z"
                  fill="#e11d48"
                  filter="url(#lumi-glow)"
                />
                <circle cx="36" cy="45" r="1.2" fill="#fff" />
              </g>
              <g ref={eyeRightRef}>
                <path
                  d="M 62 46 C 59 40, 53 42, 56 48 L 62 55 L 68 48 C 71 42, 65 40, 62 46 Z"
                  fill="#e11d48"
                  filter="url(#lumi-glow)"
                />
                <circle cx="60" cy="45" r="1.2" fill="#fff" />
              </g>
            </g>
          ) : mood === 'starry' ? (
            // Star Eyes with Celestial Wonder
            <g>
              <g ref={eyeLeftRef}>
                <path
                  d="M 38 43 L 40 48 L 45 49 L 41 52 L 42 57 L 38 54 L 34 57 L 35 52 L 31 49 L 36 48 Z"
                  fill="#0284c7"
                  filter="url(#lumi-glow)"
                />
                <circle cx="38" cy="49" r="1.5" fill="#ffffff" />
              </g>
              <g ref={eyeRightRef}>
                <path
                  d="M 62 43 L 64 48 L 69 49 L 65 52 L 66 57 L 62 54 L 58 57 L 59 52 L 55 49 L 60 48 Z"
                  fill="#0284c7"
                  filter="url(#lumi-glow)"
                />
                <circle cx="62" cy="49" r="1.5" fill="#ffffff" />
              </g>
            </g>
          ) : mood === 'playful' ? (
            // Winking Eye + Sparkly Star Eye
            <g>
              {/* Left Eye: Open Sparkly Anime Eye */}
              <g ref={eyeLeftRef}>
                <ellipse cx="38" cy="48" rx="4.5" ry="6" fill="#0f172a" />
                <ellipse cx="38" cy="48" rx="3.5" ry="4.8" fill="#1e293b" />
                <circle cx="36.5" cy="45.5" r="2" fill="#ffffff" />
                <circle cx="39.8" cy="51" r="1" fill="#ffffff" />
              </g>
              {/* Right Eye: Cute Wink Arc with Star Lash */}
              <path
                d="M 56 49 Q 62 42 67 49"
                stroke="#0f172a"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <line x1="68" y1="47" x2="71" y2="44" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />
            </g>
          ) : mood === 'giggle' ? (
            // Laughing Squeezed Closed Eyes (><)
            <g stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" fill="none">
              <path d="M 33 46 L 39 50 L 33 54" />
              <path d="M 67 46 L 61 50 L 67 54" />
            </g>
          ) : mood === 'ache' ? (
            // Deep Compassionate/Reflective Glistening Eyes with Teardrop
            <g>
              <g ref={eyeLeftRef}>
                <ellipse cx="38" cy="48" rx="4.5" ry="5.5" fill="#1e293b" />
                <circle cx="36.5" cy="45.5" r="2.2" fill="#ffffff" />
                <circle cx="39.5" cy="51" r="1" fill="#ffffff" />
              </g>
              <g ref={eyeRightRef}>
                <ellipse cx="62" cy="48" rx="4.5" ry="5.5" fill="#1e293b" />
                <circle cx="60.5" cy="45.5" r="2.2" fill="#ffffff" />
                <circle cx="63.5" cy="51" r="1" fill="#ffffff" />
              </g>
              {/* Glistening Starlight Teardrop */}
              <motion.path
                animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
                d="M 68 53 C 68 56, 66 58, 64 58 C 62 58, 61 56, 64 51 C 66 53, 68 53, 68 53 Z"
                fill="#38bdf8"
                filter="url(#lumi-glow)"
              />
            </g>
          ) : (
            // Default & Happy: Wide Sparkling Anime Pupils that Track Cursor
            <g>
              <g ref={eyeLeftRef}>
                <ellipse cx="38" cy="48" rx="4.8" ry="6.2" fill="#0f172a" />
                <ellipse cx="38" cy="48" rx="3.8" ry="5" fill="#1e293b" />
                <circle cx="36.2" cy="45.2" r="2.2" fill="#ffffff" />
                <circle cx="40.2" cy="51.2" r="1.1" fill="#ffffff" />
                <circle cx="36.2" cy="51.2" r="0.6" fill="#7dd3fc" />
              </g>
              <g ref={eyeRightRef}>
                <ellipse cx="62" cy="48" rx="4.8" ry="6.2" fill="#0f172a" />
                <ellipse cx="62" cy="48" rx="3.8" ry="5" fill="#1e293b" />
                <circle cx="60.2" cy="45.2" r="2.2" fill="#ffffff" />
                <circle cx="64.2" cy="51.2" r="1.1" fill="#ffffff" />
                <circle cx="60.2" cy="51.2" r="0.6" fill="#7dd3fc" />
              </g>
            </g>
          )}

          {/* ================= MOUTH EXPRESSIONS ================= */}
          {mood === 'loving' || mood === 'playful' ? (
            // Cute Cat W-Mouth (ω)
            <path
              d="M 43 55 Q 46.5 59 50 56 Q 53.5 59 57 55"
              stroke="#0f172a"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          ) : mood === 'giggle' ? (
            // Open Joyful Laugh Mouth
            <path
              d="M 44 54 Q 50 63 56 54 Z"
              fill="#f43f5e"
              stroke="#0f172a"
              strokeWidth="1.8"
            />
          ) : mood === 'starry' ? (
            // Surprised Small 'O' Mouth
            <ellipse cx="50" cy="57" rx="3" ry="4.2" fill="#e11d48" stroke="#0f172a" strokeWidth="1.4" />
          ) : mood === 'curious' ? (
            // Inquisitive Tiny Smirk
            <path
              d="M 47 56 Q 51 58 55 55"
              stroke="#0f172a"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          ) : mood === 'sleepy' ? (
            // Tiny Drowsy Smile
            <path
              d="M 46 56 Q 50 58 54 56"
              stroke="#0f172a"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            // Sweet Gentle Smile
            <path
              d="M 44 55 Q 50 60 56 55"
              stroke="#0f172a"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* Cute Starlight Wand with Animated Wave */}
          <motion.g
            animate={{
              rotate: [-8, 18, -8],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '76px', originY: '60px' }}
          >
            {/* Wand Handle */}
            <line
              x1="76"
              y1="60"
              x2="89"
              y2="40"
              stroke="#f59e0b"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            {/* Wand Star Tip with Glowing Aura */}
            <polygon
              points="89,36 91,40 95,41 92,43 93,47 89,45 85,47 86,43 83,41 87,40"
              fill="#fbbf24"
              stroke="#f59e0b"
              strokeWidth="0.8"
              filter="url(#lumi-glow)"
            />
            <circle cx="89" cy="42" r="1.5" fill="#ffffff" />
          </motion.g>
        </motion.svg>
      </div>
    </div>
  );
};

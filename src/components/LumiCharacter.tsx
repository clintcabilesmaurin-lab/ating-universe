import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { LumiMood } from './LumiCompanion';

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
  size = 88,
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

  // Smooth gaze tracking
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

  // Track global mouse position
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

      const eyeOffsetX = clampedX * 3.4;
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
        setTimeout(() => setIsBlinking(false), 170);
      }
    }, 3800 + Math.random() * 2500);

    return () => clearInterval(blinkInterval);
  }, [mood, isSleeping]);

  // GSAP 3D Spin Flip on bounce or tap
  useEffect(() => {
    if (isBouncing && characterRef.current) {
      setIsSpinning(true);

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

  const getMoodAesthetic = () => {
    switch (mood) {
      case 'loving':
        return {
          glow: 'rgba(251, 113, 133, 0.6)',
          bodyGrad: ['#ffffff', '#fff0f3', '#ffe4e8'],
          cheek: '#fb7185',
          sparkle: '#fda4af',
          halo: '#f43f5e',
        };
      case 'starry':
        return {
          glow: 'rgba(56, 189, 248, 0.6)',
          bodyGrad: ['#ffffff', '#f0f9ff', '#e0f2fe'],
          cheek: '#38bdf8',
          sparkle: '#7dd3fc',
          halo: '#0284c7',
        };
      case 'playful':
        return {
          glow: 'rgba(250, 204, 21, 0.6)',
          bodyGrad: ['#ffffff', '#fefce8', '#fef9c3'],
          cheek: '#f59e0b',
          sparkle: '#fde047',
          halo: '#eab308',
        };
      case 'tender':
        return {
          glow: 'rgba(192, 132, 252, 0.6)',
          bodyGrad: ['#ffffff', '#faf5ff', '#f3e8ff'],
          cheek: '#c084fc',
          sparkle: '#d8b4fe',
          halo: '#9333ea',
        };
      case 'ache':
        return {
          glow: 'rgba(96, 165, 250, 0.6)',
          bodyGrad: ['#ffffff', '#eff6ff', '#dbeafe'],
          cheek: '#93c5fd',
          sparkle: '#bfdbfe',
          halo: '#3b82f6',
        };
      case 'angry':
        return {
          glow: 'rgba(248, 113, 113, 0.6)',
          bodyGrad: ['#ffffff', '#fff1f2', '#ffe4e6'],
          cheek: '#dc2626',
          sparkle: '#fca5a5',
          halo: '#ef4444',
        };
      case 'sleepy':
        return {
          glow: 'rgba(148, 163, 184, 0.5)',
          bodyGrad: ['#ffffff', '#f8fafc', '#f1f5f9'],
          cheek: '#cbd5e1',
          sparkle: '#e2e8f0',
          halo: '#94a3b8',
        };
      default:
        return {
          glow: 'rgba(253, 224, 71, 0.6)',
          bodyGrad: ['#ffffff', '#fefce8', '#fef08a'],
          cheek: '#fb7185',
          sparkle: '#fde047',
          halo: '#fbbf24',
        };
    }
  };

  const aesthetic = getMoodAesthetic();

  return (
    <div
      ref={containerRef}
      id="cute-ghost-lumi-character"
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center select-none"
    >
      {/* Ethereal Glow */}
      <div
        className={`absolute inset-0 rounded-full blur-xl transition-all duration-300 pointer-events-none ${
          isHovered || isBouncing ? 'scale-125 opacity-90' : 'scale-100 opacity-60'
        }`}
        style={{ backgroundColor: aesthetic.glow }}
      />

      {/* Floating Ghost Body Container */}
      <motion.div
        ref={characterRef}
        animate={{
          y: isFlying ? [-6, 6, -6] : [-3, 3, -3],
          rotate: isFlying ? [-4, 4, -4] : [-2, 2, -2],
        }}
        transition={{
          duration: isFlying ? 2.2 : 3.0,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* SVG Vector Cute Ghost */}
        <svg
          viewBox="0 0 120 130"
          className="w-full h-full drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="ghostBodyGrad" x1="60" y1="15" x2="60" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={aesthetic.bodyGrad[0]} />
              <stop offset="60%" stopColor={aesthetic.bodyGrad[1]} />
              <stop offset="100%" stopColor={aesthetic.bodyGrad[2]} />
            </linearGradient>

            <filter id="ghostInnerGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={aesthetic.glow} floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Floating Star Halo Clip */}
          <g transform="translate(82, 14) rotate(18)">
            <path
              d="M0 -9 L2.5 -2.5 L9 0 L2.5 2.5 L0 9 L-2.5 2.5 L-9 0 L-2.5 -2.5 Z"
              fill={aesthetic.halo}
              filter="url(#ghostInnerGlow)"
            />
          </g>

          {/* Cute Stubby Ghost Arms (Left & Right) */}
          <g className="animate-pulse">
            {/* Left Arm */}
            <path
              d="M26 62 C16 60, 10 68, 16 76 C22 84, 28 78, 30 72 Z"
              fill="url(#ghostBodyGrad)"
              stroke="#ffffff"
              strokeWidth="1.2"
            />
            {/* Right Arm */}
            <path
              d="M94 62 C104 60, 110 68, 104 76 C98 84, 92 78, 90 72 Z"
              fill="url(#ghostBodyGrad)"
              stroke="#ffffff"
              strokeWidth="1.2"
            />
          </g>

          {/* Ghost Sheet Head & Wavy Ruffle Skirt */}
          <path
            d="M24 65 C24 30, 96 30, 96 65 C96 86, 96 102, 96 108 C90 102, 82 108, 76 114 C70 120, 64 112, 60 108 C56 112, 50 120, 44 114 C38 108, 30 102, 24 108 Z"
            fill="url(#ghostBodyGrad)"
            stroke="#ffffff"
            strokeWidth="1.5"
            filter="url(#ghostInnerGlow)"
          />

          {/* Rosy Blushing Cheeks */}
          <ellipse cx="38" cy="74" rx="6.5" ry="4" fill={aesthetic.cheek} opacity="0.85" />
          <ellipse cx="82" cy="74" rx="6.5" ry="4" fill={aesthetic.cheek} opacity="0.85" />

          {/* Expressive Anime Ghost Eyes */}
          {isBlinking || mood === 'sleepy' || isSleeping ? (
            <g stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round">
              <path d="M42 66 Q48 70 54 66" />
              <path d="M66 66 Q72 70 78 66" />
            </g>
          ) : mood === 'laugh' || mood === 'giggle' ? (
            <g stroke="#1e1b4b" strokeWidth="2.8" strokeLinecap="round">
              <path d="M42 68 Q48 60 54 68" />
              <path d="M66 68 Q72 60 78 68" />
            </g>
          ) : mood === 'loving' ? (
            <g fill="#f43f5e">
              <path d="M48 60 C44 56, 40 60, 44 65 L48 70 L52 65 C56 60, 52 56, 48 60 Z" />
              <path d="M72 60 C68 56, 64 60, 68 65 L72 70 L76 65 C80 60, 76 56, 72 60 Z" />
            </g>
          ) : mood === 'starry' ? (
            <g fill="#38bdf8">
              <path d="M48 57 L50 63 L56 65 L50 67 L48 73 L46 67 L40 65 L46 63 Z" />
              <path d="M72 57 L74 63 L80 65 L74 67 L72 73 L70 67 L64 65 L70 63 Z" />
            </g>
          ) : mood === 'playful' ? (
            <g>
              {/* Left Eye Open */}
              <g ref={eyeLeftRef}>
                <ellipse cx="48" cy="65" rx="6.5" ry="7.5" fill="#1e1b4b" />
                <circle cx="50" cy="63" r="2.4" fill="#ffffff" />
                <circle cx="46" cy="67" r="1.2" fill="#ffffff" />
              </g>
              {/* Right Eye Wink */}
              <path d="M66 66 Q72 71 78 66" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          ) : (
            <g>
              {/* Left Eye */}
              <g ref={eyeLeftRef}>
                <ellipse cx="48" cy="65" rx="6.5" ry="7.5" fill="#1e1b4b" />
                <circle cx="50" cy="63" r="2.4" fill="#ffffff" />
                <circle cx="46" cy="67" r="1.2" fill="#ffffff" />
              </g>
              {/* Right Eye */}
              <g ref={eyeRightRef}>
                <ellipse cx="72" cy="65" rx="6.5" ry="7.5" fill="#1e1b4b" />
                <circle cx="74" cy="63" r="2.4" fill="#ffffff" />
                <circle cx="70" cy="67" r="1.2" fill="#ffffff" />
              </g>
            </g>
          )}

          {/* Cute Ghost Mouth */}
          {mood === 'laugh' || mood === 'giggle' ? (
            <path d="M55 74 Q60 82 65 74 Z" fill="#e11d48" />
          ) : mood === 'loving' || mood === 'playful' ? (
            <path d="M54 74 Q57 77 60 74 Q63 77 66 74" stroke="#1e1b4b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          ) : mood === 'angry' ? (
            <ellipse cx="60" cy="75" rx="2.5" ry="3.5" fill="#1e1b4b" />
          ) : (
            <path d="M55 74 Q60 79 65 74" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" fill="none" />
          )}
        </svg>

        {/* Burst Particles */}
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
              animate={{ scale: 1, x: p.x, y: p.y, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                boxShadow: `0 0 8px ${p.color}`,
              }}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

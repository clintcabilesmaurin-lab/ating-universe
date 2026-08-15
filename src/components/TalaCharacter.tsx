import React from 'react';
import { motion } from 'motion/react';

export type TalaMood = 'happy' | 'loving' | 'starry' | 'playful' | 'tender' | 'ache';

interface TalaCharacterProps {
  mood: TalaMood;
  isBouncing?: boolean;
  isFlying?: boolean;
  isSleeping?: boolean;
  isHovered?: boolean;
  size?: number;
}

export const TalaCharacter: React.FC<TalaCharacterProps> = ({
  mood,
  isBouncing = false,
  isFlying = false,
  isSleeping = false,
  isHovered = false,
  size = 72,
}) => {
  // Theme highlights according to mood
  const getMoodColors = () => {
    switch (mood) {
      case 'loving':
        return {
          bodyGrad: ['#fff1f2', '#ffe4e6', '#fecdd3'],
          aura: 'rgba(251, 113, 133, 0.45)',
          cheek: '#fb7185',
          sparkle: '#fda4af',
          crown: '#f43f5e',
        };
      case 'starry':
        return {
          bodyGrad: ['#f0f9ff', '#e0f2fe', '#bae6fd'],
          aura: 'rgba(56, 189, 248, 0.45)',
          cheek: '#38bdf8',
          sparkle: '#7dd3fc',
          crown: '#0284c7',
        };
      case 'playful':
        return {
          bodyGrad: ['#fefce8', '#fef9c3', '#fef08a'],
          aura: 'rgba(250, 204, 21, 0.45)',
          cheek: '#f59e0b',
          sparkle: '#fde047',
          crown: '#eab308',
        };
      case 'tender':
        return {
          bodyGrad: ['#faf5ff', '#f3e8ff', '#e9d5ff'],
          aura: 'rgba(192, 132, 252, 0.45)',
          cheek: '#c084fc',
          sparkle: '#d8b4fe',
          crown: '#a855f7',
        };
      case 'ache':
        return {
          bodyGrad: ['#f5f3ff', '#ede9fe', '#ddd6fe'],
          aura: 'rgba(168, 85, 247, 0.45)',
          cheek: '#a78bfa',
          sparkle: '#c4b5fd',
          crown: '#7c3aed',
        };
      case 'happy':
      default:
        return {
          bodyGrad: ['#fffbeb', '#fef3c7', '#fde68a'],
          aura: 'rgba(244, 213, 141, 0.5)',
          cheek: '#fb923c',
          sparkle: '#fcd34d',
          crown: '#f59e0b',
        };
    }
  };

  const colors = getMoodColors();

  return (
    <div
      className="relative flex items-center justify-center select-none pointer-events-none"
      style={{ width: size, height: size }}
    >
      {/* Outer Dreamy Cosmic Ambient Glow */}
      <motion.div
        animate={{
          scale: isHovered ? [1.2, 1.45, 1.2] : [1, 1.25, 1],
          opacity: isHovered ? [0.6, 0.9, 0.6] : [0.35, 0.65, 0.35],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 rounded-full blur-xl"
        style={{ backgroundColor: colors.aura }}
      />

      {/* Orbiting Stardust Wandering Particles */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 flex items-start justify-center"
      >
        <div
          className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] -translate-y-1"
          style={{ backgroundColor: colors.sparkle, color: colors.sparkle }}
        />
      </motion.div>
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 flex items-end justify-center"
      >
        <div
          className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] translate-y-1"
          style={{ backgroundColor: colors.cheek, color: colors.cheek }}
        />
      </motion.div>

      {/* Main SVG Star Creature Character */}
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] overflow-visible"
        animate={{
          scale: isBouncing ? [1, 1.25, 0.9, 1.08, 1] : isHovered ? 1.08 : 1,
          rotate: isFlying ? [0, 6, -6, 0] : [0, 3, -3, 0],
        }}
        transition={{
          scale: { duration: 0.5 },
          rotate: { duration: isFlying ? 2.5 : 4, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <defs>
          <radialGradient id={`star-body-${mood}`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor={colors.bodyGrad[0]} />
            <stop offset="55%" stopColor={colors.bodyGrad[1]} />
            <stop offset="100%" stopColor={colors.bodyGrad[2]} />
          </radialGradient>

          <linearGradient id={`wing-grad-${mood}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="100%" stopColor={colors.sparkle} stopOpacity="0.4" />
          </linearGradient>

          <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Tiny Angelic Cosmic Wings (Flapping gently) */}
        <motion.g
          animate={{
            rotate: [-8, 12, -8],
            scaleY: [0.9, 1.1, 0.9],
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '28px', originY: '48px' }}
        >
          {/* Left Wing */}
          <path
            d="M 28 48 C 12 36, 4 48, 10 58 C 16 66, 26 56, 28 50 Z"
            fill={`url(#wing-grad-${mood})`}
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="0.8"
          />
        </motion.g>

        <motion.g
          animate={{
            rotate: [8, -12, 8],
            scaleY: [0.9, 1.1, 0.9],
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '72px', originY: '48px' }}
        >
          {/* Right Wing */}
          <path
            d="M 72 48 C 88 36, 96 48, 90 58 C 84 66, 74 56, 72 50 Z"
            fill={`url(#wing-grad-${mood})`}
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="0.8"
          />
        </motion.g>

        {/* Cute Plump Star Body */}
        {/* Five rounded star points forming a cuddly creature */}
        <path
          d="M 50 12 
             C 53 26, 61 31, 74 27 
             C 86 23, 91 35, 83 45 
             C 76 54, 78 64, 88 74 
             C 96 82, 86 92, 74 88 
             C 63 84, 55 90, 50 96 
             C 45 90, 37 84, 26 88 
             C 14 92, 4 82, 12 74 
             C 22 64, 24 54, 17 45 
             C 9 35, 14 23, 26 27 
             C 39 31, 47 26, 50 12 Z"
          fill={`url(#star-body-${mood})`}
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="1.8"
        />

        {/* Head Halo / Starlight Tiara */}
        <motion.g
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ellipse
            cx="50"
            cy="10"
            rx="14"
            ry="4"
            fill="none"
            stroke={colors.crown}
            strokeWidth="1.8"
            strokeDasharray="2 1"
          />
          {/* Sparkle on halo */}
          <circle cx="62" cy="9" r="1.5" fill="#fff" filter="url(#soft-glow)" />
        </motion.g>

        {/* Cute Expressive Eyes */}
        {mood === 'loving' ? (
          // Heart Eyes
          <g>
            <path
              d="M 39 46 C 36 41, 31 43, 33 48 L 39 54 L 45 48 C 47 43, 42 41, 39 46 Z"
              fill="#e11d48"
            />
            <path
              d="M 61 46 C 58 41, 53 43, 55 48 L 61 54 L 67 48 C 69 43, 64 41, 61 46 Z"
              fill="#e11d48"
            />
          </g>
        ) : mood === 'starry' ? (
          // Star Eyes
          <g>
            <path
              d="M 39 44 L 41 49 L 46 50 L 42 53 L 43 58 L 39 55 L 35 58 L 36 53 L 32 50 L 37 49 Z"
              fill="#0284c7"
            />
            <path
              d="M 61 44 L 63 49 L 68 50 L 64 53 L 65 58 L 61 55 L 57 58 L 58 53 L 54 50 L 59 49 Z"
              fill="#0284c7"
            />
          </g>
        ) : isSleeping ? (
          // Sleeping Eyes (^ ^)
          <g stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none">
            <path d="M 34 50 Q 39 45 44 50" />
            <path d="M 56 50 Q 61 45 66 50" />
          </g>
        ) : mood === 'playful' ? (
          // Wink & Happy Open Eye
          <g>
            {/* Left Eye: Open Sparkly Anime Eye */}
            <ellipse cx="38" cy="48" rx="4" ry="5.5" fill="#1e293b" />
            <circle cx="36.5" cy="46" r="1.8" fill="#ffffff" />
            <circle cx="39.5" cy="50.5" r="0.9" fill="#ffffff" />
            {/* Right Eye: Wink Arc */}
            <path
              d="M 56 50 Q 61 43 66 50"
              stroke="#1e293b"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        ) : mood === 'ache' ? (
          // Teary/Emotional Eyes
          <g>
            <ellipse cx="38" cy="48" rx="4" ry="5" fill="#1e293b" />
            <circle cx="37" cy="46" r="1.8" fill="#ffffff" />
            <ellipse cx="62" cy="48" rx="4" ry="5" fill="#1e293b" />
            <circle cx="61" cy="46" r="1.8" fill="#ffffff" />
            {/* Teardrop */}
            <path
              d="M 67 52 C 67 55, 65 57, 63 57 C 61 57, 60 55, 63 51 C 65 52, 67 52, 67 52 Z"
              fill="#38bdf8"
            />
          </g>
        ) : (
          // Default Happy Big Sparkly Eyes
          <g>
            <ellipse cx="38" cy="48" rx="4.5" ry="6" fill="#0f172a" />
            <circle cx="36.5" cy="45.5" r="2" fill="#ffffff" />
            <circle cx="40" cy="51" r="1" fill="#ffffff" />

            <ellipse cx="62" cy="48" rx="4.5" ry="6" fill="#0f172a" />
            <circle cx="60.5" cy="45.5" r="2" fill="#ffffff" />
            <circle cx="64" cy="51" r="1" fill="#ffffff" />
          </g>
        )}

        {/* Blush Cheeks */}
        <ellipse cx="30" cy="54" rx="4.5" ry="2.5" fill={colors.cheek} opacity="0.65" />
        <ellipse cx="70" cy="54" rx="4.5" ry="2.5" fill={colors.cheek} opacity="0.65" />

        {/* Cute Mouth */}
        {mood === 'playful' || mood === 'loving' ? (
          // Open Happy Cat/W-mouth
          <path
            d="M 44 54 Q 47 58 50 55 Q 53 58 56 54"
            stroke="#0f172a"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
        ) : mood === 'starry' ? (
          // Surprised small 'o' mouth
          <ellipse cx="50" cy="56" rx="2.5" ry="3.5" fill="#e11d48" stroke="#0f172a" strokeWidth="1.2" />
        ) : (
          // Sweet gentle smile
          <path
            d="M 45 54 Q 50 59 55 54"
            stroke="#0f172a"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Tiny Cute Wand in Hand / Star Wand */}
        <motion.g
          animate={{
            rotate: [-6, 15, -6],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '76px', originY: '60px' }}
        >
          {/* Wand Stick */}
          <line
            x1="76"
            y1="60"
            x2="88"
            y2="42"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Wand Star Tip */}
          <polygon
            points="88,38 90,42 94,43 91,45 92,49 88,47 84,49 85,45 82,43 86,42"
            fill="#fbbf24"
            stroke="#f59e0b"
            strokeWidth="0.6"
          />
        </motion.g>
      </motion.svg>
    </div>
  );
};

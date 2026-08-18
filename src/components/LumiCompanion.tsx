import React, { useState, useRef, useEffect, memo, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Lumi22ThreeBody } from './lumi22/Lumi22ThreeBody';
import { LumiMood, SoulEmotion, LumiFlareType, LumiBehaviorState } from './lumi22/types';
import { WeatherMoodId } from './CosmicWeather';
import { audioEngine } from '../utils/audioEngine';

export type { LumiMood, SoulEmotion, LumiFlareType, LumiBehaviorState };

interface ClickHeart {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

interface FloatingLoveHeart {
  id: number;
  x: number;
  y: number;
  size: number;
  driftX: number;
  driftY: number;
  rotation: number;
  color: string;
}

interface FloatingEmotionParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  driftX: number;
  driftY: number;
  rotation: number;
  symbol: string;
  color: string;
}

interface LumiCompanionProps {
  mood?: LumiMood | SoulEmotion;
  behavior?: LumiBehaviorState;
  weatherMood?: WeatherMoodId;
  flareTrigger?: number;
  flareType?: LumiFlareType;
  isBouncing?: boolean;
  isFlying?: boolean;
  isHovered?: boolean;
  showHalo?: boolean;
  size?: number;
  className?: string;
  onClick?: () => void;
  onIncrementInteraction?: () => void;
}

export const LumiCompanion: React.FC<LumiCompanionProps> = memo(({
  mood = 'idle',
  behavior = 'floating',
  weatherMood,
  flareTrigger = 0,
  flareType = 'heart',
  isBouncing = false,
  isFlying = false,
  isHovered: externalHovered = false,
  showHalo = true,
  size = 120,
  className = '',
  onClick,
  onIncrementInteraction,
}) => {
  const [internalHovered, setInternalHovered] = useState(false);
  const [isSpawned, setIsSpawned] = useState(false);
  const [clickHearts, setClickHearts] = useState<ClickHeart[]>([]);
  const [loveHearts, setLoveHearts] = useState<FloatingLoveHeart[]>([]);
  const [emotionParticles, setEmotionParticles] = useState<FloatingEmotionParticle[]>([]);

  const isHovered = externalHovered || internalHovered;
  const isLoveMode = mood === 'loving' || mood === 'inlove' || mood === 'heart-eyes';

  // Dynamic Aura Glow Color according to emotion
  const auraGlowColor = useMemo(() => {
    switch (mood) {
      case 'loving':
      case 'inlove':
      case 'heart-eyes':
        return '#f43f5e';
      case 'angry':
        return '#ef4444';
      case 'cry':
      case 'sad':
      case 'emotional':
        return '#3b82f6';
      case 'laugh':
      case 'giggle':
      case 'happy':
        return '#fbbf24';
      case 'excited':
      case 'starry':
        return '#c084fc';
      default:
        return '#38bdf8';
    }
  }, [mood]);

  // Audio feedback and particle trigger on mood change
  const prevMoodRef = useRef(mood);
  useEffect(() => {
    if (prevMoodRef.current !== mood) {
      if (mood === 'giggle') {
        audioEngine.playGiggleSound();
      } else if (mood === 'laugh') {
        audioEngine.playLaughSound();
      } else if (mood === 'cry') {
        audioEngine.playCrySound();
      } else if (mood === 'sad') {
        audioEngine.playSadSound();
      } else if (mood === 'angry') {
        audioEngine.playAngrySound();
      } else if (mood === 'inlove' || mood === 'heart-eyes') {
        audioEngine.playInLoveSound();
      }
      prevMoodRef.current = mood;
    }
  }, [mood]);

  // Spawn Materialization Aura on mount
  useEffect(() => {
    setIsSpawned(true);
  }, []);

  // Continuous Floating Love Heart Field in Love Mode
  useEffect(() => {
    if (!isLoveMode) {
      setLoveHearts([]);
      return;
    }

    const interval = setInterval(() => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 35;
      const newHeart: FloatingLoveHeart = {
        id: Date.now() + Math.random(),
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        size: 10 + Math.random() * 12,
        driftX: (Math.random() - 0.5) * 40,
        driftY: -40 - Math.random() * 30,
        rotation: (Math.random() - 0.5) * 60,
        color: ['#f43f5e', '#fb7185', '#fda4af', '#f472b6', '#e11d48'][Math.floor(Math.random() * 5)],
      };

      setLoveHearts((prev) => [...prev.slice(-12), newHeart]);
    }, 450);

    return () => clearInterval(interval);
  }, [isLoveMode]);

  // Continuous Emotion Particles (Cry Tears, Giggle/Laugh Sparkles, Angry Sparks)
  useEffect(() => {
    if (mood !== 'cry' && mood !== 'laugh' && mood !== 'giggle' && mood !== 'angry') {
      setEmotionParticles([]);
      return;
    }

    const interval = setInterval(() => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 24 + Math.random() * 30;
      let symbol = '✨';
      let color = '#fbbf24';
      let driftY = -35 - Math.random() * 25;

      if (mood === 'cry') {
        symbol = '💧';
        color = '#60a5fa';
        driftY = 40 + Math.random() * 30; // Tears falling downward
      } else if (mood === 'angry') {
        symbol = Math.random() > 0.5 ? '💢' : '🔥';
        color = '#ef4444';
        driftY = -45 - Math.random() * 20;
      } else if (mood === 'giggle') {
        symbol = Math.random() > 0.5 ? '✨' : '🌸';
        color = '#fb7185';
      } else if (mood === 'laugh') {
        symbol = Math.random() > 0.5 ? '⭐' : '✨';
        color = '#fbbf24';
      }

      const newParticle: FloatingEmotionParticle = {
        id: Date.now() + Math.random(),
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        size: 10 + Math.random() * 8,
        driftX: (Math.random() - 0.5) * 30,
        driftY,
        rotation: (Math.random() - 0.5) * 45,
        symbol,
        color,
      };

      setEmotionParticles((prev) => [...prev.slice(-10), newParticle]);
    }, 400);

    return () => clearInterval(interval);
  }, [mood]);

  // Spring physics for smooth pointer tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 180, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 180, damping: 20 });
  const rotateX = useTransform(springY, [-50, 50], [10, -10]);
  const rotateY = useTransform(springX, [-50, 50], [-10, 10]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    mouseX.set(x);
    mouseY.set(y);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setInternalHovered(false);
  };

  // 19. Clicking 22 Interactive Reaction & Particle Spawn
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const newHeart: ClickHeart = {
      id: Date.now(),
      x: clickX,
      y: clickY,
      color: ['#f43f5e', '#fb7185', '#38bdf8', '#fbbf24'][Math.floor(Math.random() * 4)],
      size: 16 + Math.random() * 10,
    };

    setClickHearts((prev) => [...prev.slice(-8), newHeart]);

    // Audio chime feedback
    audioEngine.playChime(580 + Math.random() * 180, 0.4);

    if (onIncrementInteraction) onIncrementInteraction();
    if (onClick) onClick();
  };

  return (
    <motion.div
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setInternalHovered(true)}
      onPointerLeave={handlePointerLeave}
      style={{
        width: size,
        height: size,
        rotateX,
        rotateY,
        perspective: 700,
      }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      className={`relative flex items-center justify-center cursor-pointer select-none ${className}`}
    >
      {/* 23. Spawn Materialization Celestial Aura */}
      {isSpawned && (
        <motion.div
          initial={{ scale: 0.4, opacity: 0.9, rotate: 0 }}
          animate={{ scale: [0.4, 2.2, 3.0], opacity: [0.9, 0.4, 0], rotate: 180 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400/50 via-pink-400/40 to-amber-300/40 blur-2xl pointer-events-none"
        />
      )}

      {/* Ambient Pearlescent & Soul Core Backlight Glow */}
      <motion.div
        animate={{
          scale: isHovered ? [1.1, 1.25, 1.1] : [1, 1.15, 1],
          opacity: isHovered ? [0.6, 0.8, 0.6] : [0.35, 0.55, 0.35],
        }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-2 rounded-full blur-xl pointer-events-none transition-colors duration-500"
        style={{
          backgroundColor: auraGlowColor,
        }}
      />

      {/* 3D React-Three-Fiber Canvas Stage */}
      <div className="w-full h-full pointer-events-auto">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 3.3], fov: 42 }}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        >
          {/* Balanced Luminous Celestial Lighting */}
          <ambientLight intensity={2.2} />
          <directionalLight position={[3, 5, 4]} intensity={2.4} color="#ffffff" />
          <directionalLight position={[-3, 2, -2]} intensity={1.5} color="#bae6fd" />
          <pointLight position={[0, -0.2, 1.8]} color="#fda4af" intensity={1.8} distance={5} />
          <pointLight position={[0, 1.2, 1.5]} color="#fef08a" intensity={1.2} distance={4} />

          {/* Natural Weightless Float */}
          <Float
            speed={isFlying ? 3.5 : behavior === 'dancing' ? 4.0 : behavior === 'sleeping' ? 0.75 : isHovered ? 2.5 : 1.8}
            rotationIntensity={behavior === 'dancing' ? 0.28 : behavior === 'sleeping' ? 0.05 : 0.15}
            floatIntensity={isFlying ? 0.65 : behavior === 'dancing' ? 0.55 : behavior === 'sleeping' ? 0.15 : 0.35}
            floatingRange={behavior === 'sleeping' ? [-0.02, 0.02] : [-0.05, 0.05]}
          >
            <Lumi22ThreeBody
              mood={mood}
              behavior={behavior}
              isBouncing={isBouncing}
              isFlying={isFlying}
              isHovered={isHovered}
              showHalo={showHalo}
            />
          </Float>
        </Canvas>
      </div>

      {/* 19. Interactive Click Heart Particles */}
      <AnimatePresence>
        {clickHearts.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{ scale: 0.2, x: heart.x - size / 2, y: heart.y - size / 2, opacity: 1 }}
            animate={{
              scale: [0.2, 1.4, 1.0],
              y: heart.y - size / 2 - 55,
              opacity: [1, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="absolute pointer-events-none z-20 text-lg flex items-center justify-center font-bold"
            style={{
              color: heart.color,
              filter: `drop-shadow(0 0 8px ${heart.color})`,
            }}
          >
            💖
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 20. Love Mode Floating Heart Field */}
      <AnimatePresence>
        {loveHearts.map((lh) => (
          <motion.div
            key={lh.id}
            initial={{ scale: 0, x: lh.x, y: lh.y, opacity: 0, rotate: 0 }}
            animate={{
              scale: [0, 1.2, 0.8],
              x: lh.x + lh.driftX,
              y: lh.y + lh.driftY,
              opacity: [0, 0.95, 0],
              rotate: lh.rotation,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            className="absolute pointer-events-none z-10 select-none text-sm"
            style={{
              filter: `drop-shadow(0 0 6px ${lh.color})`,
            }}
          >
            {mood === 'heart-eyes' ? '💘' : '💖'}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Dynamic Emotion Ambient Particles (Tears, Giggle Sparkles, Laugh Stars, Angry Flames) */}
      <AnimatePresence>
        {emotionParticles.map((ep) => (
          <motion.div
            key={ep.id}
            initial={{ scale: 0, x: ep.x, y: ep.y, opacity: 0, rotate: 0 }}
            animate={{
              scale: [0, 1.3, 0.9],
              x: ep.x + ep.driftX,
              y: ep.y + ep.driftY,
              opacity: [0, 0.95, 0],
              rotate: ep.rotation,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="absolute pointer-events-none z-10 select-none text-base"
            style={{
              filter: `drop-shadow(0 0 6px ${ep.color})`,
            }}
          >
            {ep.symbol}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
});

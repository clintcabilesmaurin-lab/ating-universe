import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mountain, Image as ImageIcon, Mail, Calendar, Compass, Globe, Star, Zap } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export interface PortalConfig {
  destinationTitle: string;
  destinationTagline?: string;
  color: string;
  glowColor?: string;
  iconName?: string;
  durationMs?: number;
}

interface PortalTransitionProps {
  portalConfig: PortalConfig | null;
  onPortalComplete: () => void;
}

export const PortalTransition: React.FC<PortalTransitionProps> = ({
  portalConfig,
  onPortalComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!portalConfig) return;

    // Trigger acoustic warp chime & resonant synth whoosh
    try {
      audioEngine.playPortalWarp();
    } catch (e) {
      console.warn('Audio portal sound error:', e);
    }

    const duration = portalConfig.durationMs || 1200;

    // High-speed Hyperspace Warp Canvas animation
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const width = (canvas.width = window.innerWidth);
      const height = (canvas.height = window.innerHeight);
      const centerX = width / 2;
      const centerY = height / 2;

      // Generate 120 warp stars
      const numStars = 140;
      const stars: Array<{
        x: number;
        y: number;
        z: number;
        pz: number;
        color: string;
      }> = [];

      const targetHex = portalConfig.color || '#f4d58d';
      const colors = ['#ffffff', '#ffffff', targetHex, targetHex, '#ffd166', '#a78bfa'];

      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: (Math.random() - 0.5) * width * 2,
          y: (Math.random() - 0.5) * height * 2,
          z: Math.random() * width,
          pz: width,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      let startTime = performance.now();

      const render = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(1, elapsed / duration);
        const speed = 18 + progress * 55;

        if (!ctx) return;

        ctx.fillStyle = 'rgba(2, 6, 23, 0.28)';
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < numStars; i++) {
          const star = stars[i];
          star.pz = star.z;
          star.z -= speed;

          if (star.z <= 0) {
            star.z = width;
            star.pz = width;
            star.x = (Math.random() - 0.5) * width * 2;
            star.y = (Math.random() - 0.5) * height * 2;
          }

          const k = 280 / star.z;
          const px = star.x * k + centerX;
          const py = star.y * k + centerY;

          const pk = 280 / star.pz;
          const prevPx = star.x * pk + centerX;
          const prevPy = star.y * pk + centerY;

          if (px >= 0 && px <= width && py >= 0 && py <= height) {
            const size = Math.max(1, (1 - star.z / width) * 4.5);
            ctx.beginPath();
            ctx.moveTo(prevPx, prevPy);
            ctx.lineTo(px, py);
            ctx.strokeStyle = star.color;
            ctx.lineWidth = size;
            ctx.lineCap = 'round';
            ctx.stroke();
          }
        }

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(render);
        }
      };

      animFrameRef.current = requestAnimationFrame(render);
    }

    const timer = setTimeout(() => {
      onPortalComplete();
    }, duration);

    return () => {
      clearTimeout(timer);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [portalConfig, onPortalComplete]);

  const renderIcon = (name?: string) => {
    const props = { className: 'w-12 h-12 sm:w-14 sm:h-14 text-white drop-shadow-[0_0_25px_rgba(255,255,255,1)]' };
    switch (name) {
      case 'Mountain':
        return <Mountain {...props} />;
      case 'Image':
        return <ImageIcon {...props} />;
      case 'Mail':
        return <Mail {...props} />;
      case 'Calendar':
        return <Calendar {...props} />;
      case 'Compass':
        return <Compass {...props} />;
      case 'Globe':
        return <Globe {...props} />;
      default:
        return <Sparkles {...props} />;
    }
  };

  return (
    <AnimatePresence>
      {portalConfig && (
        <motion.div
          id="celestial-portal-transition"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden select-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.96) 0%, rgba(2, 6, 23, 0.99) 75%, #000000 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Real-time Hyperspace Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
          />

          {/* Glowing Stargate Tunnel Nebular Halo */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{
              scale: [0.3, 1.6, 2.8],
              opacity: [0, 0.85, 0.1],
            }}
            transition={{
              duration: portalConfig.durationMs ? portalConfig.durationMs / 1000 : 1.2,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute w-[500px] h-[500px] rounded-full blur-[80px] pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${portalConfig.color}bb 0%, ${portalConfig.glowColor || portalConfig.color}55 50%, transparent 80%)`,
            }}
          />

          {/* Concentric Stargate Warp Rings */}
          {[0, 1, 2, 3].map((ringIdx) => (
            <motion.div
              key={`warp-ring-${ringIdx}`}
              initial={{ scale: 0.1, opacity: 0, rotate: 0 }}
              animate={{
                scale: [0.1, 1.3 + ringIdx * 0.5, 3.2],
                opacity: [0, 0.95, 0],
                rotate: ringIdx % 2 === 0 ? 240 : -240,
              }}
              transition={{
                duration: 1.15,
                delay: ringIdx * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute rounded-full border-2 border-dashed pointer-events-none"
              style={{
                width: `${260 + ringIdx * 80}px`,
                height: `${260 + ringIdx * 80}px`,
                borderColor: ringIdx % 2 === 0 ? portalConfig.color : '#ffffff',
                boxShadow: `0 0 50px ${portalConfig.color}88, inset 0 0 35px ${portalConfig.color}66`,
              }}
            />
          ))}

          {/* Center Singularity Portal & Destination Card */}
          <div className="relative z-30 flex flex-col items-center justify-center text-center px-6 max-w-lg">
            {/* Spinning Stardust Orb Core */}
            <motion.div
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{
                scale: [0, 1.3, 1],
                rotate: [0, 180, 360],
                opacity: [0, 1, 1],
              }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex items-center justify-center mb-6"
            >
              {/* Outer Pulsing Aura Ring */}
              <div
                className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-2 border-dashed animate-[spin_5s_linear_infinite]"
                style={{
                  borderColor: `${portalConfig.color}ee`,
                  boxShadow: `0 0 60px ${portalConfig.color}aa, inset 0 0 40px ${portalConfig.color}88`,
                }}
              />

              {/* Core Stargate Portal Disc */}
              <div
                className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-xl"
                style={{
                  background: `radial-gradient(circle, ${portalConfig.color}dd 0%, #020617 85%)`,
                  boxShadow: `0 0 70px ${portalConfig.color}, 0 0 120px ${portalConfig.color}99`,
                }}
              >
                <motion.div
                  animate={{ scale: [0.92, 1.12, 0.95], rotate: [0, 6, -6, 0] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                >
                  {renderIcon(portalConfig.iconName)}
                </motion.div>
              </div>

              {/* Orbiting Sparkles */}
              {[0, 72, 144, 216, 288].map((deg, i) => (
                <motion.div
                  key={`spark-${deg}`}
                  className="absolute"
                  style={{
                    transform: `rotate(${deg}deg) translate(72px) rotate(-${deg}deg)`,
                  }}
                  animate={{ scale: [0.5, 1.4, 0.5], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.7, delay: i * 0.12, repeat: Infinity }}
                >
                  <Star className="w-3.5 h-3.5 fill-current text-white drop-shadow-[0_0_10px_#ffffff]" />
                </motion.div>
              ))}
            </motion.div>

            {/* Subtitle & Destination Header */}
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-3"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/25 backdrop-blur-md text-xs font-sans uppercase tracking-[0.25em] text-amber-200 shadow-inner">
                <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Cosmic Portal Warping...</span>
              </div>

              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-white tracking-wide drop-shadow-[0_0_30px_rgba(255,255,255,0.9)]"
                style={{
                  textShadow: `0 0 25px ${portalConfig.color}dd, 0 0 50px ${portalConfig.color}88`,
                }}
              >
                {portalConfig.destinationTitle}
              </h2>

              {portalConfig.destinationTagline && (
                <p className="text-sm sm:text-base font-serif italic text-slate-200/95 max-w-md mx-auto leading-relaxed">
                  "{portalConfig.destinationTagline}"
                </p>
              )}

              {/* Warping Progress Line */}
              <div className="w-48 h-1 bg-white/20 rounded-full mx-auto overflow-hidden mt-4">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{
                    duration: portalConfig.durationMs ? portalConfig.durationMs / 1000 : 1.2,
                    ease: 'easeInOut',
                  }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: portalConfig.color }}
                />
              </div>
            </motion.div>
          </div>

          {/* Hyperdrive Final Starlight Flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0.85, 0] }}
            transition={{
              duration: portalConfig.durationMs ? portalConfig.durationMs / 1000 : 1.2,
              times: [0, 0.7, 0.9, 1],
              ease: 'easeOut',
            }}
            className="absolute inset-0 bg-white pointer-events-none mix-blend-screen"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

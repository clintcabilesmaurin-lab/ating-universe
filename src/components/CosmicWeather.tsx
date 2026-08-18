import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CloudRain, Sparkles, Heart, Snowflake, Flame, Flower2, ChevronRight } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { lumiSync } from '../utils/lumiSyncBus';

export type WeatherMoodId =
  | 'heart-rain'
  | 'soft-snow'
  | 'stardust-embers'
  | 'sakura-breeze'
  | 'aurora-mist';

export interface WeatherMood {
  id: WeatherMoodId;
  name: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  particleCount: number;
}

export const COSMIC_WEATHER_MOODS: WeatherMood[] = [
  {
    id: 'heart-rain',
    name: 'Ulan ng Pag-ibig',
    tagline: 'Banayad na patak ng pagmamahal mula sa mga bituin',
    icon: Heart,
    accentColor: '#fb7185',
    badgeBg: 'rgba(244, 63, 94, 0.15)',
    badgeBorder: 'rgba(251, 113, 133, 0.35)',
    particleCount: 38,
  },
  {
    id: 'soft-snow',
    name: 'Mahinahong Niyebe',
    tagline: 'Crystalline starlight flakes na marahang sumasayaw',
    icon: Snowflake,
    accentColor: '#93c5fd',
    badgeBg: 'rgba(59, 130, 246, 0.15)',
    badgeBorder: 'rgba(147, 197, 253, 0.35)',
    particleCount: 55,
  },
  {
    id: 'stardust-embers',
    name: 'Gintong Alitaptap',
    tagline: 'Kumukutitap na stardust embers at mga hiling',
    icon: Flame,
    accentColor: '#fbbf24',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    badgeBorder: 'rgba(251, 191, 36, 0.35)',
    particleCount: 42,
  },
  {
    id: 'sakura-breeze',
    name: 'Pangarap na Talulot',
    tagline: 'Mga talulot ng bituin na humahalimuyak sa simoy',
    icon: Flower2,
    accentColor: '#f472b6',
    badgeBg: 'rgba(236, 72, 153, 0.15)',
    badgeBorder: 'rgba(244, 114, 182, 0.35)',
    particleCount: 40,
  },
  {
    id: 'aurora-mist',
    name: 'Sayaw ng Aurora',
    tagline: 'Luminous cosmic mist at starlight shimmer',
    icon: Sparkles,
    accentColor: '#a78bfa',
    badgeBg: 'rgba(139, 92, 246, 0.15)',
    badgeBorder: 'rgba(167, 139, 250, 0.35)',
    particleCount: 48,
  },
];

// Determine daily deterministic mood based on calendar date
const getDailyMood = (): WeatherMoodId => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const moodIndex = Math.abs(dayOfYear) % COSMIC_WEATHER_MOODS.length;
  return COSMIC_WEATHER_MOODS[moodIndex].id;
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  wobbleSpeed: number;
  wobblePhase: number;
  alpha: number;
  baseAlpha: number;
  color: string;
  hueShift?: number;
}

interface CosmicWeatherProps {
  activeMoodId?: WeatherMoodId;
  onMoodChange?: (mood: WeatherMoodId) => void;
  onSpeakMood?: (text: string) => void;
}

export const CosmicWeather: React.FC<CosmicWeatherProps> = ({
  activeMoodId: activeMoodIdProp,
  onMoodChange,
  onSpeakMood,
}) => {
  const [internalMoodId, setInternalMoodId] = useState<WeatherMoodId>(() => {
    try {
      const saved = localStorage.getItem('cosmic_weather_mood');
      if (saved && COSMIC_WEATHER_MOODS.some((m) => m.id === saved)) {
        return saved as WeatherMoodId;
      }
    } catch {
      // fallback
    }
    return getDailyMood();
  });

  const currentMoodId = activeMoodIdProp || internalMoodId;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  const currentMood = useMemo(
    () => COSMIC_WEATHER_MOODS.find((m) => m.id === currentMoodId) || COSMIC_WEATHER_MOODS[0],
    [currentMoodId]
  );

  // Initialize and spawn particles when mood changes
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const count = currentMood.particleCount;
    const list: Particle[] = [];

    for (let i = 0; i < count; i++) {
      let vx = 0;
      let vy = 0;
      let size = 1;
      let rotSpeed = (Math.random() - 0.5) * 0.04;
      let wobbleSpeed = 0.8 + Math.random() * 1.5;
      let baseAlpha = 0.35 + Math.random() * 0.45;
      let color = currentMood.accentColor;

      switch (currentMood.id) {
        case 'heart-rain':
          vx = (Math.random() - 0.5) * 0.4;
          vy = 0.6 + Math.random() * 0.9;
          size = 7 + Math.random() * 9;
          color = Math.random() < 0.4 ? '#fb7185' : Math.random() < 0.7 ? '#fda4af' : '#f43f5e';
          break;

        case 'soft-snow':
          vx = (Math.random() - 0.5) * 0.35;
          vy = 0.4 + Math.random() * 0.75;
          size = 2 + Math.random() * 4.5;
          color = Math.random() < 0.3 ? '#ffffff' : Math.random() < 0.7 ? '#e0f2fe' : '#bae6fd';
          break;

        case 'stardust-embers':
          vx = (Math.random() - 0.5) * 0.5;
          vy = -(0.35 + Math.random() * 0.75); // float upward
          size = 2.5 + Math.random() * 4;
          color = Math.random() < 0.4 ? '#fde047' : Math.random() < 0.8 ? '#fbbf24' : '#f59e0b';
          break;

        case 'sakura-breeze':
          vx = 0.7 + Math.random() * 1.1; // drift across with wind
          vy = 0.4 + Math.random() * 0.8;
          size = 6 + Math.random() * 8;
          rotSpeed = (Math.random() - 0.5) * 0.06;
          color = Math.random() < 0.5 ? '#f472b6' : Math.random() < 0.8 ? '#fbcfe8' : '#fb7185';
          break;

        case 'aurora-mist':
          vx = (Math.random() - 0.5) * 0.6;
          vy = -(0.2 + Math.random() * 0.5);
          size = 3 + Math.random() * 6;
          color = Math.random() < 0.4 ? '#c084fc' : Math.random() < 0.7 ? '#a78bfa' : '#818cf8';
          break;
      }

      list.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx,
        vy,
        size,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed,
        wobbleSpeed,
        wobblePhase: Math.random() * Math.PI * 2,
        alpha: baseAlpha,
        baseAlpha,
        color,
      });
    }

    particlesRef.current = list;
  }, [currentMood]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const drawHeart = (c: CanvasRenderingContext2D, size: number, color: string, alpha: number) => {
      c.save();
      c.fillStyle = color;
      c.globalAlpha = alpha;
      c.beginPath();
      const topCurveHeight = size * 0.3;
      c.moveTo(0, topCurveHeight);
      // top left curve
      c.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
      // bottom left curve
      c.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, (size + topCurveHeight) / 1.4, 0, size);
      // bottom right curve
      c.bezierCurveTo(0, (size + topCurveHeight) / 1.4, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
      // top right curve
      c.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
      c.closePath();
      c.fill();

      // Soft glow
      c.shadowColor = color;
      c.shadowBlur = 8;
      c.fill();
      c.restore();
    };

    const drawSnowflake = (c: CanvasRenderingContext2D, size: number, color: string, alpha: number) => {
      c.save();
      c.fillStyle = color;
      c.globalAlpha = alpha;
      c.beginPath();
      c.arc(0, 0, size, 0, Math.PI * 2);
      c.fill();

      // Diamond halo cross
      c.strokeStyle = color;
      c.lineWidth = 0.8;
      c.globalAlpha = alpha * 0.8;
      c.beginPath();
      c.moveTo(-size * 1.6, 0);
      c.lineTo(size * 1.6, 0);
      c.moveTo(0, -size * 1.6);
      c.lineTo(0, size * 1.6);
      c.stroke();
      c.restore();
    };

    const drawEmber = (c: CanvasRenderingContext2D, size: number, color: string, alpha: number) => {
      c.save();
      c.globalAlpha = alpha;
      const grad = c.createRadialGradient(0, 0, 0, 0, 0, size * 2.2);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, color);
      grad.addColorStop(1, 'transparent');
      c.fillStyle = grad;
      c.beginPath();
      c.arc(0, 0, size * 2.2, 0, Math.PI * 2);
      c.fill();
      c.restore();
    };

    const drawPetal = (c: CanvasRenderingContext2D, size: number, color: string, alpha: number) => {
      c.save();
      c.fillStyle = color;
      c.globalAlpha = alpha;
      c.beginPath();
      c.moveTo(0, -size);
      c.quadraticCurveTo(size * 0.7, 0, 0, size);
      c.quadraticCurveTo(-size * 0.7, 0, 0, -size);
      c.closePath();
      c.fill();
      c.restore();
    };

    const drawAuroraMist = (c: CanvasRenderingContext2D, size: number, color: string, alpha: number) => {
      c.save();
      c.globalAlpha = alpha;
      const grad = c.createRadialGradient(0, 0, 0, 0, 0, size * 2.5);
      grad.addColorStop(0, color);
      grad.addColorStop(0.5, `${color}66`);
      grad.addColorStop(1, 'transparent');
      c.fillStyle = grad;
      c.beginPath();
      c.arc(0, 0, size * 2.5, 0, Math.PI * 2);
      c.fill();
      c.restore();
    };

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      const moodId = currentMood.id;
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update wobble & sway
        p.wobblePhase += p.wobbleSpeed * dt;
        const wobbleX = Math.sin(p.wobblePhase) * 18 * dt;

        p.x += p.vx * 60 * dt + wobbleX;
        p.y += p.vy * 60 * dt;
        p.rotation += p.rotSpeed;

        // Twinkle subtle alpha breathing
        p.alpha = p.baseAlpha * (0.8 + Math.sin(p.wobblePhase * 1.5) * 0.2);

        // Viewport wrap boundaries
        if (p.vy > 0 && p.y > height + 25) {
          p.y = -20;
          p.x = Math.random() * width;
        } else if (p.vy < 0 && p.y < -25) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }

        if (p.x > width + 30) {
          p.x = -25;
        } else if (p.x < -30) {
          p.x = width + 25;
        }

        // Draw particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        switch (moodId) {
          case 'heart-rain':
            drawHeart(ctx, p.size, p.color, p.alpha);
            break;
          case 'soft-snow':
            drawSnowflake(ctx, p.size, p.color, p.alpha);
            break;
          case 'stardust-embers':
            drawEmber(ctx, p.size, p.color, p.alpha);
            break;
          case 'sakura-breeze':
            drawPetal(ctx, p.size, p.color, p.alpha);
            break;
          case 'aurora-mist':
            drawAuroraMist(ctx, p.size, p.color, p.alpha);
            break;
        }

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [currentMood]);

  const handleSelectMood = (mood: WeatherMood) => {
    setInternalMoodId(mood.id);
    if (onMoodChange) {
      onMoodChange(mood.id);
    }
    lumiSync.notifyWeather(mood.id);
    setIsMenuOpen(false);
    try {
      localStorage.setItem('cosmic_weather_mood', mood.id);
    } catch {
      // ignore
    }
    audioEngine.playStarGazeChime();

    if (onSpeakMood) {
      onSpeakMood(`Kasalukuyang panahon sa ating uniberso: ${mood.name}. "${mood.tagline}" ✨`);
    }
  };

  const IconComp = currentMood.icon;

  return (
    <>
      {/* Background Animated Weather Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-[4] mix-blend-screen"
      />

      {/* Atmospheric Weather Mood Badge (Top-Left Pill in Sky) */}
      <div className="fixed top-3 left-3 sm:top-4 sm:left-4 z-40">
        <div className="relative">
          <motion.button
            id="btn-cosmic-weather-toggle"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border shadow-lg transition-all duration-300 text-xs font-sans tracking-wide select-none group"
            style={{
              backgroundColor: currentMood.badgeBg,
              borderColor: currentMood.badgeBorder,
              color: '#ffffff',
            }}
            title="Baguhin ang Panahon ng Ating Uniberso"
          >
            <span
              className="p-1 rounded-full flex items-center justify-center animate-pulse"
              style={{ backgroundColor: `${currentMood.accentColor}33` }}
            >
              <IconComp className="w-3.5 h-3.5" style={{ color: currentMood.accentColor }} />
            </span>
            <span className="font-serif italic font-medium hidden xs:inline text-slate-100">
              {currentMood.name}
            </span>
            <ChevronRight
              className={`w-3 h-3 text-slate-400 group-hover:text-white transition-transform duration-200 ${
                isMenuOpen ? 'rotate-90' : ''
              }`}
            />
          </motion.button>

          {/* Dropdown Menu to Choose Cosmic Weather */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute top-full left-0 mt-2 w-64 p-2 rounded-2xl bg-slate-950/90 border border-white/15 backdrop-blur-xl shadow-2xl z-50 space-y-1"
              >
                <div className="px-2.5 py-1.5 border-b border-white/10 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
                    Panahon Ngayong Araw
                  </span>
                  <span className="text-[10px] text-amber-300 font-sans">Araw-araw nagbabago</span>
                </div>

                {COSMIC_WEATHER_MOODS.map((mood) => {
                  const isSelected = mood.id === currentMood.id;
                  const ItemIcon = mood.icon;
                  return (
                    <button
                      key={mood.id}
                      onClick={() => handleSelectMood(mood)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-2.5 group ${
                        isSelected
                          ? 'bg-white/15 text-white font-medium border border-white/20'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${mood.accentColor}25` }}
                      >
                        <ItemIcon className="w-3.5 h-3.5" style={{ color: mood.accentColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="truncate">{mood.name}</span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-serif italic truncate">
                          {mood.tagline}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

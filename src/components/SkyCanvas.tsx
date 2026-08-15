import React, { useEffect, useRef, useState, useCallback } from 'react';
import { audioEngine } from '../utils/audioEngine';

interface Star {
  xFrac: number;
  yFrac: number;
  depth: number; // 0.2 (distant) to 1.0 (near) for 3D parallax
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  glow: boolean;
  color?: string;
}

interface Meteor {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  bornAt: number;
  lifeMs: number;
  trailLen: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

interface SkyCanvasProps {
  zoneShift?: number; // 0 to 1
  onMeteorClick?: () => void;
  isBuiltIn?: boolean;
}

const STAR_COUNT = 110;
const HORIZON_RIDGES = [
  { heightFrac: 0.50, jitter: 0.28, points: 24, spikeChance: 0.16, spikeBoost: 1.5, parallax: 0.08 },
  { heightFrac: 0.72, jitter: 0.38, points: 30, spikeChance: 0.22, spikeBoost: 1.7, parallax: 0.18 },
  { heightFrac: 1.00, jitter: 0.48, points: 38, spikeChance: 0.28, spikeBoost: 1.9, parallax: 0.32 },
];

export const SkyCanvas: React.FC<SkyCanvasProps> = ({
  zoneShift = 0.2,
  onMeteorClick,
  isBuiltIn = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const meteorRef = useRef<Meteor | null>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const horizonProfilesRef = useRef<{ xFrac: number; peak: number }[][]>([]);
  const lastMeteorCheckRef = useRef<number>(0);
  const meteorLingerStartRef = useRef<number>(Date.now());
  const [canCatchMeteor, setCanCatchMeteor] = useState(false);

  // Mouse & Scroll Parallax Coordinates (smoothed via lerp)
  const targetMouseRef = useRef({ x: 0, y: 0 });
  const currentMouseRef = useRef({ x: 0, y: 0 });

  // Initialize star field with 3D depth layer
  const initStars = useCallback(() => {
    const list: Star[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const isBand = i < STAR_COUNT * 0.35;
      let xFrac = Math.random();
      let yFrac = Math.random() * 0.85;

      if (isBand) {
        const t = Math.random();
        xFrac = Math.max(0, Math.min(1, 0.20 + Math.sin(t * Math.PI) * 0.15 + (Math.random() * 0.16 - 0.08)));
        yFrac = t;
      }

      const isFeature = Math.random() < 0.18;
      const depth = 0.25 + Math.random() * 0.75; // Depth multiplier for parallax

      list.push({
        xFrac,
        yFrac,
        depth,
        radius: isFeature ? 1.6 + Math.random() * 1.1 : 0.6 + Math.random() * 0.9,
        baseAlpha: 0.45 + Math.random() * 0.55,
        twinkleSpeed: 0.5 + Math.random() * 0.9,
        twinklePhase: Math.random() * Math.PI * 2,
        glow: isFeature,
        color: Math.random() > 0.8 ? '#f4d58d' : Math.random() > 0.85 ? '#c9a7eb' : '#ffffff',
      });
    }
    starsRef.current = list;
  }, []);

  // Initialize horizon profiles
  const initHorizon = useCallback(() => {
    horizonProfilesRef.current = HORIZON_RIDGES.map((ridge) => {
      const profile: { xFrac: number; peak: number }[] = [];
      for (let i = 0; i <= ridge.points; i++) {
        const xFrac = i / ridge.points;
        let peak = 0.4 + Math.random() * ridge.jitter;
        if (Math.random() < ridge.spikeChance) {
          peak *= ridge.spikeBoost;
        }
        profile.push({ xFrac, peak: Math.min(1.3, peak) });
      }
      return profile;
    });
  }, []);

  // Spawn a meteor
  const spawnMeteor = (width: number, height: number, now: number) => {
    const fromLeft = Math.random() < 0.5;
    const margin = 40;
    const startX = fromLeft ? -margin : width + margin;
    const startY = Math.random() * (height * 0.35);
    const angleDeg = fromLeft ? 22 + Math.random() * 20 : 158 + Math.random() * 20;
    const angle = (Math.PI / 180) * angleDeg;
    const speed = width * (1.1 + Math.random() * 0.45);

    meteorRef.current = {
      id: now,
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      bornAt: now,
      lifeMs: 700 + Math.random() * 300,
      trailLen: 110 + Math.random() * 50,
    };
    setCanCatchMeteor(true);
  };

  useEffect(() => {
    initStars();
    initHorizon();
    meteorLingerStartRef.current = Date.now();
  }, [initStars, initHorizon]);

  // Global mousemove listener for deep 3D parallax tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -1 to +1 from screen center
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      targetMouseRef.current = { x: nx, y: ny };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Main animation frame loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      const now = Date.now();

      // Smooth lerp mouse parallax offset
      currentMouseRef.current.x += (targetMouseRef.current.x - currentMouseRef.current.x) * 0.05;
      currentMouseRef.current.y += (targetMouseRef.current.y - currentMouseRef.current.y) * 0.05;
      const mouseOffset = currentMouseRef.current;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw atmospheric background gradient (Zone-shift warmth)
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#0a0818');
      grad.addColorStop(0.35, zoneShift > 0.5 ? '#26173d' : '#1c1333');
      grad.addColorStop(0.68, zoneShift > 0.5 ? '#703858' : '#572c47');
      grad.addColorStop(1, zoneShift > 0.5 ? '#d97448' : '#bf5f3b');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Milky Way diffuse glow with subtle parallax
      const milkySteps = 8;
      const bandBaseX = width * 0.22 + mouseOffset.x * 25;
      const bandBaseY = mouseOffset.y * 15;
      for (let i = 0; i < milkySteps; i++) {
        const t = i / (milkySteps - 1);
        const y = height * t + bandBaseY;
        const x = bandBaseX + Math.sin(t * Math.PI) * width * 0.14;
        const r = width * 0.24 * (0.6 + Math.sin(t * Math.PI) * 0.5);

        const mGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
        mGrad.addColorStop(0, 'rgba(215, 195, 240, 0.08)');
        mGrad.addColorStop(0.5, 'rgba(200, 175, 230, 0.03)');
        mGrad.addColorStop(1, 'rgba(200, 175, 230, 0)');

        ctx.fillStyle = mGrad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Draw Stars with Parallax Depth Offset
      if (isBuiltIn) {
        starsRef.current.forEach((star) => {
          // Calculate 3D parallax displacement based on individual star depth
          const parallaxX = mouseOffset.x * star.depth * 35;
          const parallaxY = mouseOffset.y * star.depth * 25;

          const x = star.xFrac * width + parallaxX;
          const y = star.yFrac * height + parallaxY;
          const elapsed = now / 1000;
          const twinkle = 0.75 + 0.25 * Math.sin(elapsed * star.twinkleSpeed + star.twinklePhase);
          const alpha = star.baseAlpha * twinkle;

          if (star.glow) {
            const glowR = star.radius * 3.8;
            const starGrad = ctx.createRadialGradient(x, y, 0, x, y, glowR);
            starGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
            starGrad.addColorStop(0.4, star.color === '#ffffff' ? `rgba(255, 255, 255, ${alpha * 0.4})` : star.color || 'rgba(244, 213, 141, 0.4)');
            starGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = starGrad;
            ctx.beginPath();
            ctx.arc(x, y, glowR, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, star.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 4. Draw Starlight Ripples
      ripplesRef.current.forEach((rip, idx) => {
        rip.radius += 1.8;
        rip.alpha -= 0.015;

        if (rip.alpha > 0) {
          ctx.strokeStyle = `rgba(244, 213, 141, ${rip.alpha * 0.6})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ripplesRef.current.splice(idx, 1);
        }
      });

      // 5. Draw Horizon Silhouette & Treeline with Parallax
      const bandHeight = height * 0.17;
      HORIZON_RIDGES.forEach((ridge, i) => {
        const profile = horizonProfilesRef.current[i];
        if (!profile) return;

        const horizonParallaxX = mouseOffset.x * ridge.parallax * 30;
        const horizonParallaxY = mouseOffset.y * ridge.parallax * 15;
        const peakHeight = bandHeight * ridge.heightFrac;
        const ridgeColor = i === 0 ? '#1f132b' : i === 1 ? '#150c1e' : '#0b0610';

        ctx.fillStyle = ridgeColor;
        ctx.beginPath();
        ctx.moveTo(-40, height);
        profile.forEach((p) => {
          ctx.lineTo(p.xFrac * width + horizonParallaxX, height - p.peak * peakHeight + horizonParallaxY);
        });
        ctx.lineTo(width + 40, height);
        ctx.closePath();
        ctx.fill();
      });

      // 6. Meteor Check & Rendering
      if (isBuiltIn) {
        if (!meteorRef.current && now - lastMeteorCheckRef.current > 4500) {
          lastMeteorCheckRef.current = now;
          const lingerSeconds = (now - meteorLingerStartRef.current) / 1000;
          const prob = Math.min(0.35, 0.08 + lingerSeconds * 0.003);
          if (Math.random() < prob) {
            spawnMeteor(width, height, now);
          }
        }

        if (meteorRef.current) {
          const m = meteorRef.current;
          const age = now - m.bornAt;

          if (age > m.lifeMs) {
            meteorRef.current = null;
            setCanCatchMeteor(false);
          } else {
            const dt = age / 1000;
            const headX = m.x + m.vx * dt;
            const headY = m.y + m.vy * dt;

            const lifeT = age / m.lifeMs;
            const fade = lifeT > 0.7 ? 1 - (lifeT - 0.7) / 0.3 : 1;

            const dirLen = Math.hypot(m.vx, m.vy) || 1;
            const tailX = headX - (m.vx / dirLen) * m.trailLen;
            const tailY = headY - (m.vy / dirLen) * m.trailLen;

            // Draw streak
            const trailGrad = ctx.createLinearGradient(tailX, tailY, headX, headY);
            trailGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            trailGrad.addColorStop(0.7, `rgba(244, 213, 141, ${0.45 * fade})`);
            trailGrad.addColorStop(1, `rgba(255, 255, 255, ${0.95 * fade})`);

            ctx.strokeStyle = trailGrad;
            ctx.lineWidth = 2.2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(headX, headY);
            ctx.stroke();

            // Head bright dot
            const headGrad = ctx.createRadialGradient(headX, headY, 0, headX, headY, 6);
            headGrad.addColorStop(0, `rgba(255, 255, 255, ${fade})`);
            headGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = headGrad;
            ctx.beginPath();
            ctx.arc(headX, headY, 6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [zoneShift, isBuiltIn]);

  // Touch/Click to make starlight ripples
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ripplesRef.current.push({
      x,
      y,
      radius: 4,
      maxRadius: 45,
      alpha: 0.7,
    });

    audioEngine.playStarGazeChime();

    // Check if clicked near active meteor
    if (meteorRef.current && onMeteorClick) {
      const now = Date.now();
      const m = meteorRef.current;
      const dt = (now - m.bornAt) / 1000;
      const headX = m.x + m.vx * dt;
      const headY = m.y + m.vy * dt;
      const dist = Math.hypot(x - headX, y - headY);

      if (dist < 80) {
        meteorRef.current = null;
        setCanCatchMeteor(false);
        onMeteorClick();
      }
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-auto z-0 overflow-hidden select-none">
      <canvas
        id="sky-canvas"
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        className="w-full h-full block cursor-crosshair"
      />
      {canCatchMeteor && (
        <div
          id="meteor-hint"
          onClick={onMeteorClick}
          className="fixed top-8 left-1/2 -translate-x-1/2 bg-amber-500/20 backdrop-blur-md border border-amber-300/40 text-amber-100 text-xs px-4 py-1.5 rounded-full animate-pulse z-20 cursor-pointer shadow-lg tracking-wide flex items-center gap-2"
        >
          <span>✨ May bulalakaw! Tap para humiling</span>
        </div>
      )}
    </div>
  );
};

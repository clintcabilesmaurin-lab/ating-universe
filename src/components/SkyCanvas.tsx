import React, { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import { audioEngine } from '../utils/audioEngine';
import {
  AtmosphereState,
  getAtmosphereSnapshot,
  TimeOfDayId,
  SeasonId,
} from '../utils/atmosphereEngine';
import { performanceManager } from '../utils/performanceManager';

type RgbTuple = [number, number, number];

interface Star {
  xFrac: number;
  yFrac: number;
  depth: number; // 0.2 (distant) to 1.0 (near) for 3D parallax
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  glow: boolean;
  coolRgb: RgbTuple;
  warmRgb: RgbTuple;
  saturationFactor: number;
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
  active: boolean;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

interface SeasonalParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  wobblePhase: number;
  wobbleSpeed: number;
  alpha: number;
  baseAlpha: number;
  type: 'sakura' | 'firefly' | 'amber-leaf' | 'snowflake';
  color: string;
}

interface SkyCanvasProps {
  zoneShift?: number; // 0 (deep indigo) to 1 (dusk purple)
  onMeteorClick?: () => void;
  isBuiltIn?: boolean;
  timeOfDayOverride?: TimeOfDayId;
  seasonOverride?: SeasonId;
}

interface MountainPoint {
  x: number;
  y: number;
}

interface MountainTierNatural {
  depth: number;
  parallax: number;
  heightFrac: number;
  points: MountainPoint[];
  litCool: RgbTuple;
  shadedCool: RgbTuple;
  litWarm: RgbTuple;
  shadedWarm: RgbTuple;
  rimCool: RgbTuple;
  rimWarm: RgbTuple;
  mistCool: RgbTuple;
  mistWarm: RgbTuple;
}

const BASE_STAR_COUNT = 145;
const BASE_SEASONAL_PARTICLE_COUNT = 32;
const MAX_RIPPLES = 16;

// Smooth Mountain Range Tiers
const NATURAL_MOUNTAIN_TIERS: MountainTierNatural[] = [
  {
    depth: 0.85,
    parallax: 0.05,
    heightFrac: 0.28,
    litCool: [46, 58, 92],
    shadedCool: [20, 26, 44],
    litWarm: [82, 42, 80],
    shadedWarm: [36, 16, 40],
    rimCool: [190, 220, 255],
    rimWarm: [255, 190, 150],
    mistCool: [28, 38, 64],
    mistWarm: [52, 22, 58],
    points: [
      { x: -0.10, y: 0.35 },
      { x: 0.05, y: 0.68 },
      { x: 0.16, y: 0.48 },
      { x: 0.26, y: 0.88 },
      { x: 0.38, y: 0.58 },
      { x: 0.50, y: 0.76 },
      { x: 0.62, y: 0.95 },
      { x: 0.74, y: 0.62 },
      { x: 0.85, y: 0.82 },
      { x: 0.96, y: 0.55 },
      { x: 1.12, y: 0.40 },
    ],
  },
  {
    depth: 0.50,
    parallax: 0.14,
    heightFrac: 0.23,
    litCool: [30, 40, 68],
    shadedCool: [14, 18, 32],
    litWarm: [58, 26, 56],
    shadedWarm: [24, 10, 26],
    rimCool: [150, 195, 250],
    rimWarm: [250, 160, 120],
    mistCool: [18, 26, 46],
    mistWarm: [38, 14, 42],
    points: [
      { x: -0.12, y: 0.28 },
      { x: 0.02, y: 0.55 },
      { x: 0.14, y: 0.42 },
      { x: 0.24, y: 0.75 },
      { x: 0.34, y: 0.98 }, // Mount Pangilatan Summit
      { x: 0.44, y: 0.68 },
      { x: 0.56, y: 0.84 },
      { x: 0.68, y: 0.52 },
      { x: 0.78, y: 0.78 },
      { x: 0.90, y: 0.60 },
      { x: 1.02, y: 0.72 },
      { x: 1.14, y: 0.32 },
    ],
  },
  {
    depth: 0.18,
    parallax: 0.26,
    heightFrac: 0.15,
    litCool: [18, 24, 40],
    shadedCool: [8, 10, 18],
    litWarm: [38, 16, 34],
    shadedWarm: [14, 6, 14],
    rimCool: [110, 160, 220],
    rimWarm: [220, 120, 90],
    mistCool: [12, 16, 28],
    mistWarm: [22, 8, 24],
    points: [
      { x: -0.15, y: 0.20 },
      { x: -0.02, y: 0.48 },
      { x: 0.10, y: 0.62 },
      { x: 0.22, y: 0.38 },
      { x: 0.35, y: 0.65 },
      { x: 0.48, y: 0.45 },
      { x: 0.60, y: 0.72 },
      { x: 0.72, y: 0.50 },
      { x: 0.84, y: 0.68 },
      { x: 0.98, y: 0.42 },
      { x: 1.15, y: 0.25 },
    ],
  },
];

// Color interpolation helpers
const interpolateRgb = (c1: RgbTuple, c2: RgbTuple, t: number): string => {
  const clampedT = Math.max(0, Math.min(1, t));
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * clampedT);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * clampedT);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * clampedT);
  return `rgb(${r}, ${g}, ${b})`;
};

const interpolateRgbTuple = (c1: RgbTuple, c2: RgbTuple, t: number): RgbTuple => {
  const clampedT = Math.max(0, Math.min(1, t));
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * clampedT);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * clampedT);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * clampedT);
  return [r, g, b];
};

const interpolateRgba = (c1: RgbTuple, c2: RgbTuple, t: number, alpha: number): string => {
  const clampedT = Math.max(0, Math.min(1, t));
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * clampedT);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * clampedT);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * clampedT);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
};

export const SkyCanvas: React.FC<SkyCanvasProps> = memo(({
  zoneShift = 0,
  onMeteorClick,
  isBuiltIn = true,
  timeOfDayOverride,
  seasonOverride,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const seasonalParticlesRef = useRef<SeasonalParticle[]>([]);
  const meteorRef = useRef<Meteor | null>(null);
  
  // Pre-allocated object pool for ripples (prevents garbage collection spikes)
  const ripplePoolRef = useRef<Ripple[]>(
    Array.from({ length: MAX_RIPPLES }, () => ({
      active: false,
      x: 0,
      y: 0,
      radius: 0,
      maxRadius: 45,
      alpha: 0,
    }))
  );
  
  const lastMeteorCheckRef = useRef<number>(0);
  const meteorLingerStartRef = useRef<number>(Date.now());
  const [canCatchMeteor, setCanCatchMeteor] = useState(false);

  // Parallax Coordinates
  const targetMouseRef = useRef({ x: 0, y: 0 });
  const currentMouseRef = useRef({ x: 0, y: 0 });

  // Get current atmosphere snapshot
  const atmosphere = useMemo(() => {
    return getAtmosphereSnapshot(undefined, timeOfDayOverride, seasonOverride);
  }, [timeOfDayOverride, seasonOverride]);

  // Initialize stars with performance multiplier
  const initStars = useCallback(() => {
    const list: Star[] = [];
    const multiplier = performanceManager.getParticleMultiplier();
    const starCount = Math.round(BASE_STAR_COUNT * multiplier);

    const colorPairings: { cool: RgbTuple; warm: RgbTuple }[] = [
      { cool: [255, 255, 255], warm: [255, 230, 160] },
      { cool: [210, 235, 255], warm: [255, 185, 95] },
      { cool: [195, 225, 255], warm: [255, 140, 180] },
      { cool: [225, 240, 255], warm: [225, 155, 255] },
      { cool: [180, 220, 255], warm: [248, 115, 215] },
      { cool: [240, 248, 255], warm: [255, 205, 130] },
    ];

    for (let i = 0; i < starCount; i++) {
      const isBand = i < starCount * 0.38;
      let xFrac = Math.random();
      let yFrac = Math.random() * 0.88;

      if (isBand) {
        const t = Math.random();
        xFrac = Math.max(0, Math.min(1, 0.20 + Math.sin(t * Math.PI) * 0.15 + (Math.random() * 0.16 - 0.08)));
        yFrac = t;
      }

      const isFeature = Math.random() < 0.22;
      const depth = 0.25 + Math.random() * 0.75;
      const pairing = colorPairings[Math.floor(Math.random() * colorPairings.length)];

      list.push({
        xFrac,
        yFrac,
        depth,
        radius: isFeature ? 1.6 + Math.random() * 1.2 : 0.6 + Math.random() * 0.9,
        baseAlpha: 0.48 + Math.random() * 0.52,
        twinkleSpeed: 0.6 + Math.random() * 1.1,
        twinklePhase: Math.random() * Math.PI * 2,
        glow: isFeature,
        coolRgb: pairing.cool,
        warmRgb: pairing.warm,
        saturationFactor: 0.8 + Math.random() * 0.6,
      });
    }
    starsRef.current = list;
  }, []);

  // Initialize seasonal floating particles with adaptive pooling
  const initSeasonalParticles = useCallback((seasonType: 'sakura' | 'firefly' | 'amber-leaf' | 'snowflake', color: string) => {
    const list: SeasonalParticle[] = [];
    const multiplier = performanceManager.getParticleMultiplier();
    const particleCount = Math.round(BASE_SEASONAL_PARTICLE_COUNT * multiplier);

    for (let i = 0; i < particleCount; i++) {
      list.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: seasonType === 'snowflake' ? (Math.random() - 0.5) * 0.4 : seasonType === 'firefly' ? (Math.random() - 0.5) * 0.8 : 0.6 + Math.random() * 0.8,
        vy: seasonType === 'snowflake' ? 0.8 + Math.random() * 0.9 : seasonType === 'firefly' ? (Math.random() - 0.5) * 0.7 : 0.4 + Math.random() * 0.6,
        size: seasonType === 'sakura' ? 6 + Math.random() * 5 : seasonType === 'amber-leaf' ? 8 + Math.random() * 6 : seasonType === 'firefly' ? 3 + Math.random() * 3 : 2.5 + Math.random() * 3.5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.8 + Math.random() * 1.2,
        alpha: 0.3 + Math.random() * 0.6,
        baseAlpha: 0.3 + Math.random() * 0.6,
        type: seasonType,
        color,
      });
    }
    seasonalParticlesRef.current = list;
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
    initSeasonalParticles(atmosphere.seasonalParticleType, atmosphere.seasonalParticleColor);
    meteorLingerStartRef.current = Date.now();

    // Re-tune particles if device tier changes
    const unsub = performanceManager.subscribe(() => {
      initStars();
      initSeasonalParticles(atmosphere.seasonalParticleType, atmosphere.seasonalParticleColor);
    });

    return () => unsub();
  }, [initStars, initSeasonalParticles, atmosphere.seasonalParticleType, atmosphere.seasonalParticleColor]);

  // Global mousemove parallax listener (passive)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
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
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    const render = () => {
      // Record FPS for adaptive quality adjustment
      performanceManager.recordFrame();

      // Pause/skip rendering if browser tab is backgrounded
      if (!performanceManager.getIsTabVisible()) {
        animId = requestAnimationFrame(render);
        return;
      }

      const now = Date.now();
      const clampedShift = Math.max(0, Math.min(1, zoneShift));

      currentMouseRef.current.x += (targetMouseRef.current.x - currentMouseRef.current.x) * 0.05;
      currentMouseRef.current.y += (targetMouseRef.current.y - currentMouseRef.current.y) * 0.05;
      const mouseOffset = currentMouseRef.current;

      // =====================================================================
      // 1. DYNAMIC ATMOSPHERE SKY GRADIENT (Day/Night + ZoneShift)
      // =====================================================================
      const grad = ctx.createLinearGradient(0, 0, 0, height);

      const zenithRgb = interpolateRgbTuple(atmosphere.skyZenithRgb, [12, 6, 30], clampedShift * 0.4);
      const upperRgb = interpolateRgbTuple(atmosphere.skyUpperRgb, [42, 18, 74], clampedShift * 0.4);
      const midRgb = interpolateRgbTuple(atmosphere.skyMidRgb, [116, 42, 92], clampedShift * 0.5);
      const horizonRgb = interpolateRgbTuple(atmosphere.skyHorizonRgb, [222, 108, 72], clampedShift * 0.6);

      grad.addColorStop(0, `rgb(${zenithRgb[0]}, ${zenithRgb[1]}, ${zenithRgb[2]})`);
      grad.addColorStop(0.35, `rgb(${upperRgb[0]}, ${upperRgb[1]}, ${upperRgb[2]})`);
      grad.addColorStop(0.68, `rgb(${midRgb[0]}, ${midRgb[1]}, ${midRgb[2]})`);
      grad.addColorStop(1, `rgb(${horizonRgb[0]}, ${horizonRgb[1]}, ${horizonRgb[2]})`);

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // =====================================================================
      // 2. CELESTIAL BODIES (Soft Volumetric Ambient Sun & Luminous Moon)
      // =====================================================================
      const isDayOrDuskOrDawn = atmosphere.timeOfDay !== 'night';
      const isNightOrDawnOrDusk = atmosphere.timeOfDay !== 'day';

      // A. VOLUMETRIC HORIZON AMBIENT BLOOM (Soft background warmth)
      if (isDayOrDuskOrDawn) {
        const horizonBloomHeight = height * 0.45;
        const horizonBloom = ctx.createLinearGradient(0, height - horizonBloomHeight, 0, height);
        if (atmosphere.timeOfDay === 'dusk') {
          horizonBloom.addColorStop(0, 'rgba(244, 63, 94, 0)');
          horizonBloom.addColorStop(0.5, 'rgba(251, 146, 60, 0.12)');
          horizonBloom.addColorStop(1, 'rgba(238, 112, 68, 0.28)');
        } else if (atmosphere.timeOfDay === 'dawn') {
          horizonBloom.addColorStop(0, 'rgba(254, 215, 170, 0)');
          horizonBloom.addColorStop(0.5, 'rgba(251, 146, 60, 0.10)');
          horizonBloom.addColorStop(1, 'rgba(252, 175, 120, 0.24)');
        } else {
          horizonBloom.addColorStop(0, 'rgba(125, 211, 252, 0)');
          horizonBloom.addColorStop(0.6, 'rgba(255, 224, 130, 0.09)');
          horizonBloom.addColorStop(1, 'rgba(255, 248, 231, 0.22)');
        }
        ctx.fillStyle = horizonBloom;
        ctx.fillRect(0, height - horizonBloomHeight, width, horizonBloomHeight);
      }

      // B. RENDER NATURAL VOLUMETRIC SUN (During Dawn, Day, or Dusk)
      if (isDayOrDuskOrDawn && atmosphere.sunAltitude > 0) {
        const sunX = width * atmosphere.sunAzimuth + mouseOffset.x * 20;
        const sunY = height * (1 - atmosphere.sunAltitude * 0.72) + mouseOffset.y * 15;
        
        // Multi-tier radii for soft ambient radial diffusion
        const coreRadius = atmosphere.timeOfDay === 'day' ? 44 : 52;
        const coronaRadius = coreRadius * 2.8;
        const atmosphericBloomRadius = coreRadius * 6.8;

        // Layer 1: Wide Volumetric Atmospheric Flare / Sky Bloom
        const wideSkyBloom = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, atmosphericBloomRadius);
        if (atmosphere.timeOfDay === 'dawn') {
          wideSkyBloom.addColorStop(0, 'rgba(254, 215, 170, 0.32)');
          wideSkyBloom.addColorStop(0.35, 'rgba(251, 146, 60, 0.16)');
          wideSkyBloom.addColorStop(0.7, 'rgba(244, 114, 182, 0.05)');
          wideSkyBloom.addColorStop(1, 'rgba(244, 114, 182, 0)');
        } else if (atmosphere.timeOfDay === 'dusk') {
          wideSkyBloom.addColorStop(0, 'rgba(251, 146, 60, 0.38)');
          wideSkyBloom.addColorStop(0.35, 'rgba(244, 63, 94, 0.18)');
          wideSkyBloom.addColorStop(0.7, 'rgba(168, 85, 247, 0.06)');
          wideSkyBloom.addColorStop(1, 'rgba(168, 85, 247, 0)');
        } else {
          wideSkyBloom.addColorStop(0, 'rgba(255, 248, 231, 0.30)');
          wideSkyBloom.addColorStop(0.35, 'rgba(255, 224, 130, 0.15)');
          wideSkyBloom.addColorStop(0.68, 'rgba(125, 211, 252, 0.06)');
          wideSkyBloom.addColorStop(1, 'rgba(125, 211, 252, 0)');
        }

        ctx.fillStyle = wideSkyBloom;
        ctx.beginPath();
        ctx.arc(sunX, sunY, atmosphericBloomRadius, 0, Math.PI * 2);
        ctx.fill();

        // Layer 2: Mid-tier Soft Ambient Corona Diffusion
        const coronaGlow = ctx.createRadialGradient(sunX, sunY, coreRadius * 0.25, sunX, sunY, coronaRadius);
        if (atmosphere.timeOfDay === 'dusk') {
          coronaGlow.addColorStop(0, 'rgba(255, 237, 213, 0.70)');
          coronaGlow.addColorStop(0.25, 'rgba(251, 146, 60, 0.42)');
          coronaGlow.addColorStop(0.6, 'rgba(244, 63, 94, 0.18)');
          coronaGlow.addColorStop(1, 'rgba(244, 63, 94, 0)');
        } else if (atmosphere.timeOfDay === 'dawn') {
          coronaGlow.addColorStop(0, 'rgba(255, 247, 237, 0.75)');
          coronaGlow.addColorStop(0.28, 'rgba(254, 215, 170, 0.48)');
          coronaGlow.addColorStop(0.62, 'rgba(251, 146, 60, 0.20)');
          coronaGlow.addColorStop(1, 'rgba(251, 146, 60, 0)');
        } else {
          coronaGlow.addColorStop(0, 'rgba(255, 255, 255, 0.82)');
          coronaGlow.addColorStop(0.22, 'rgba(255, 248, 231, 0.58)');
          coronaGlow.addColorStop(0.52, 'rgba(255, 224, 130, 0.28)');
          coronaGlow.addColorStop(0.82, 'rgba(255, 183, 77, 0.08)');
          coronaGlow.addColorStop(1, 'rgba(255, 183, 77, 0)');
        }

        ctx.fillStyle = coronaGlow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, coronaRadius, 0, Math.PI * 2);
        ctx.fill();

        // Layer 3: Organic Ambient Sun Core with Zero Hard Edges
        const coreGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, coreRadius);
        if (atmosphere.timeOfDay === 'dusk') {
          coreGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          coreGlow.addColorStop(0.3, 'rgba(254, 215, 170, 0.85)');
          coreGlow.addColorStop(0.65, 'rgba(251, 146, 60, 0.50)');
          coreGlow.addColorStop(1, 'rgba(244, 63, 94, 0)');
        } else if (atmosphere.timeOfDay === 'dawn') {
          coreGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          coreGlow.addColorStop(0.32, 'rgba(255, 248, 231, 0.85)');
          coreGlow.addColorStop(0.68, 'rgba(254, 215, 170, 0.50)');
          coreGlow.addColorStop(1, 'rgba(251, 146, 60, 0)');
        } else {
          coreGlow.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
          coreGlow.addColorStop(0.26, 'rgba(255, 248, 231, 0.88)');
          coreGlow.addColorStop(0.56, 'rgba(255, 224, 130, 0.58)');
          coreGlow.addColorStop(0.85, 'rgba(255, 183, 77, 0.22)');
          coreGlow.addColorStop(1, 'rgba(255, 183, 77, 0)');
        }

        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, coreRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // C. RENDER MOON (During Night, Dawn, or Dusk)
      if (isNightOrDawnOrDusk && atmosphere.moonAltitude > 0) {
        const moonX = width * atmosphere.moonAzimuth + mouseOffset.x * 25;
        const moonY = height * (1 - atmosphere.moonAltitude * 0.78) + mouseOffset.y * 18;
        const moonRadius = 32;

        // Lunar Halo Glow
        const moonHalo = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonRadius * 4.2);
        moonHalo.addColorStop(0, 'rgba(224, 242, 254, 0.35)');
        moonHalo.addColorStop(0.5, 'rgba(147, 197, 253, 0.15)');
        moonHalo.addColorStop(1, 'rgba(99, 102, 241, 0)');

        ctx.fillStyle = moonHalo;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius * 4.2, 0, Math.PI * 2);
        ctx.fill();

        // Moon Base Disc with soft organic rim
        const moonGrad = ctx.createRadialGradient(moonX - 6, moonY - 6, 2, moonX, moonY, moonRadius);
        moonGrad.addColorStop(0, '#ffffff');
        moonGrad.addColorStop(0.65, '#e0f2fe');
        moonGrad.addColorStop(0.9, '#bae6fd');
        moonGrad.addColorStop(1, 'rgba(186, 230, 253, 0.4)');

        ctx.fillStyle = moonGrad;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        ctx.fill();

        // Soft Lunar Craters
        const craters = [
          { dx: -6, dy: -6, r: 5, alpha: 0.12 },
          { dx: 7, dy: 4, r: 6.5, alpha: 0.10 },
          { dx: 2, dy: -8, r: 4, alpha: 0.09 },
          { dx: -8, dy: 6, r: 4.5, alpha: 0.11 },
          { dx: 4, dy: -2, r: 3, alpha: 0.08 },
        ];

        craters.forEach((c) => {
          ctx.fillStyle = `rgba(100, 140, 200, ${c.alpha})`;
          ctx.beginPath();
          ctx.arc(moonX + c.dx, moonY + c.dy, c.r, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // =====================================================================
      // 3. MILKY WAY DIFFUSE GLOW (Visible at night/dusk)
      // =====================================================================
      if (atmosphere.timeOfDay === 'night' || atmosphere.timeOfDay === 'dusk') {
        const milkySteps = 8;
        const bandBaseX = width * 0.22 + mouseOffset.x * 25;
        const bandBaseY = mouseOffset.y * 15;
        const coolMilkyRgb: RgbTuple = [185, 210, 255];
        const warmMilkyRgb: RgbTuple = [240, 145, 225];
        const milkyAlphaCore = 0.07 + clampedShift * 0.06;
        const milkyAlphaEdge = 0.02 + clampedShift * 0.03;

        for (let i = 0; i < milkySteps; i++) {
          const t = i / (milkySteps - 1);
          const y = height * t + bandBaseY;
          const x = bandBaseX + Math.sin(t * Math.PI) * width * 0.14;
          const r = width * 0.25 * (0.6 + Math.sin(t * Math.PI) * 0.5);

          const mGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
          mGrad.addColorStop(0, interpolateRgba(coolMilkyRgb, warmMilkyRgb, clampedShift, milkyAlphaCore));
          mGrad.addColorStop(0.5, interpolateRgba(coolMilkyRgb, warmMilkyRgb, clampedShift, milkyAlphaEdge));
          mGrad.addColorStop(1, interpolateRgba(coolMilkyRgb, warmMilkyRgb, clampedShift, 0));

          ctx.fillStyle = mGrad;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // =====================================================================
      // 4. STARS WITH REAL-TIME DAY/NIGHT BRIGHTNESS
      // =====================================================================
      if (isBuiltIn) {
        const elapsed = now / 1000;
        const dayStarAlphaMultiplier =
          atmosphere.timeOfDay === 'day' ? 0.25 : atmosphere.timeOfDay === 'dawn' ? 0.55 : atmosphere.timeOfDay === 'dusk' ? 0.85 : 1.0;

        starsRef.current.forEach((star) => {
          const parallaxX = mouseOffset.x * star.depth * 35;
          const parallaxY = mouseOffset.y * star.depth * 25;

          const x = star.xFrac * width + parallaxX;
          const y = star.yFrac * height + parallaxY;

          const twinkleAmp = 0.18 + clampedShift * 0.57;
          const speedMultiplier = 1.0 + clampedShift * 0.85;
          const harmonic = Math.sin(elapsed * star.twinkleSpeed * 2.2 * speedMultiplier + star.twinklePhase * 1.5) * (0.18 + clampedShift * 0.22);
          const primaryWave = Math.sin(elapsed * star.twinkleSpeed * speedMultiplier + star.twinklePhase);
          const twinkle = Math.max(0.06, 1 - twinkleAmp + twinkleAmp * (primaryWave * 0.75 + harmonic));
          
          const alpha = Math.min(1, star.baseAlpha * twinkle * (0.88 + clampedShift * 0.28) * dayStarAlphaMultiplier);
          const starColor = interpolateRgba(star.coolRgb, star.warmRgb, clampedShift, alpha);

          if (star.glow) {
            const glowR = star.radius * (2.8 + clampedShift * 3.4);
            const starGrad = ctx.createRadialGradient(x, y, 0, x, y, glowR);
            starGrad.addColorStop(0, interpolateRgba(star.coolRgb, star.warmRgb, clampedShift, alpha));
            starGrad.addColorStop(0.4, interpolateRgba(star.coolRgb, star.warmRgb, clampedShift, alpha * (0.35 + clampedShift * 0.25)));
            starGrad.addColorStop(1, interpolateRgba(star.coolRgb, star.warmRgb, clampedShift, 0));

            ctx.fillStyle = starGrad;
            ctx.beginPath();
            ctx.arc(x, y, glowR, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.fillStyle = starColor;
          ctx.beginPath();
          ctx.arc(x, y, star.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // =====================================================================
      // 5. SEASONAL ATMOSPHERIC PARTICLES (Sakura, Firefly, Leaves, Snow)
      // =====================================================================
      seasonalParticlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.wobblePhase += 0.03 * p.wobbleSpeed;

        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;
        if (p.y > height + 20) p.y = -20;
        if (p.y < -20) p.y = height + 20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation + Math.sin(p.wobblePhase) * 0.2);

        if (p.type === 'sakura') {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * 0.75;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'firefly') {
          const fireflyPulse = 0.5 + Math.sin(p.wobblePhase * 2.5) * 0.5;
          ctx.globalAlpha = p.alpha * fireflyPulse;
          const fireflyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 2.2);
          fireflyGrad.addColorStop(0, '#ffffff');
          fireflyGrad.addColorStop(0.4, p.color);
          fireflyGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
          ctx.fillStyle = fireflyGrad;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 2.2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'amber-leaf') {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * 0.8;
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.quadraticCurveTo(p.size * 0.8, 0, 0, p.size);
          ctx.quadraticCurveTo(-p.size * 0.8, 0, 0, -p.size);
          ctx.fill();
        } else {
          ctx.strokeStyle = '#ffffff';
          ctx.globalAlpha = p.alpha * 0.85;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(-p.size, 0);
          ctx.lineTo(p.size, 0);
          ctx.moveTo(0, -p.size);
          ctx.lineTo(0, p.size);
          ctx.stroke();
        }

        ctx.restore();
      });

      // =====================================================================
      // 6. STARLIGHT RIPPLES (Pooled Mutation)
      // =====================================================================
      const ripplePool = ripplePoolRef.current;
      for (let i = 0; i < ripplePool.length; i++) {
        const rip = ripplePool[i];
        if (!rip.active) continue;

        rip.radius += 1.8;
        rip.alpha -= 0.015;

        if (rip.alpha > 0) {
          ctx.strokeStyle = interpolateRgba([215, 235, 255], [255, 215, 140], clampedShift, rip.alpha * 0.7);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          rip.active = false;
        }
      }

      // =====================================================================
      // 7. SMOOTH MOUNTAIN RANGES
      // =====================================================================
      NATURAL_MOUNTAIN_TIERS.forEach((tier) => {
        const horizonParallaxX = mouseOffset.x * tier.parallax * 45;
        const horizonParallaxY = mouseOffset.y * tier.parallax * 20;
        const maxPeakHeight = height * tier.heightFrac;
        const baseY = height;

        // Atmospheric Valley Mist
        const mistAlpha = 0.20 + (1 - tier.depth) * 0.18 + clampedShift * 0.12;
        const mistGrad = ctx.createLinearGradient(0, baseY - maxPeakHeight * 0.85, 0, baseY);
        mistGrad.addColorStop(0, interpolateRgba(tier.mistCool, tier.mistWarm, clampedShift, 0));
        mistGrad.addColorStop(0.5, interpolateRgba(tier.mistCool, tier.mistWarm, clampedShift, mistAlpha * 0.6));
        mistGrad.addColorStop(1, interpolateRgba(tier.mistCool, tier.mistWarm, clampedShift, mistAlpha));

        ctx.fillStyle = mistGrad;
        ctx.fillRect(-30, baseY - maxPeakHeight * 0.95, width + 60, maxPeakHeight * 0.95 + 20);

        const screenPts = tier.points.map((pt) => ({
          x: pt.x * width + horizonParallaxX,
          y: baseY - pt.y * maxPeakHeight + horizonParallaxY,
        }));

        if (screenPts.length < 2) return;

        // Render Smooth Organic Mountain Body
        const mountainGrad = ctx.createLinearGradient(0, baseY - maxPeakHeight, 0, baseY);
        mountainGrad.addColorStop(0, interpolateRgb(tier.litCool, tier.litWarm, clampedShift));
        mountainGrad.addColorStop(0.45, interpolateRgb(tier.shadedCool, tier.shadedWarm, clampedShift));
        mountainGrad.addColorStop(
          1,
          interpolateRgb(
            [Math.round(tier.shadedCool[0] * 0.4), Math.round(tier.shadedCool[1] * 0.4), Math.round(tier.shadedCool[2] * 0.4)],
            [Math.round(tier.shadedWarm[0] * 0.4), Math.round(tier.shadedWarm[1] * 0.4), Math.round(tier.shadedWarm[2] * 0.4)],
            clampedShift
          )
        );

        ctx.fillStyle = mountainGrad;
        ctx.beginPath();
        ctx.moveTo(screenPts[0].x, screenPts[0].y);
        for (let i = 0; i < screenPts.length - 1; i++) {
          const xc = (screenPts[i].x + screenPts[i + 1].x) / 2;
          const yc = (screenPts[i].y + screenPts[i + 1].y) / 2;
          ctx.quadraticCurveTo(screenPts[i].x, screenPts[i].y, xc, yc);
        }
        const lastPt = screenPts[screenPts.length - 1];
        ctx.lineTo(lastPt.x, lastPt.y);
        ctx.lineTo(width + 80, baseY + 30);
        ctx.lineTo(-80, baseY + 30);
        ctx.closePath();
        ctx.fill();

        // Rim Highlight
        ctx.strokeStyle = interpolateRgba(
          tier.rimCool,
          tier.rimWarm,
          clampedShift,
          0.38 + (1 - tier.depth) * 0.32 + clampedShift * 0.18
        );
        ctx.lineWidth = Math.max(1, 1.8 * (1 - tier.depth * 0.45));
        ctx.beginPath();
        ctx.moveTo(screenPts[0].x, screenPts[0].y);
        for (let i = 0; i < screenPts.length - 1; i++) {
          const xc = (screenPts[i].x + screenPts[i + 1].x) / 2;
          const yc = (screenPts[i].y + screenPts[i + 1].y) / 2;
          ctx.quadraticCurveTo(screenPts[i].x, screenPts[i].y, xc, yc);
        }
        ctx.stroke();
      });

      // =====================================================================
      // 8. METEOR SYSTEM
      // =====================================================================
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

            const trailGrad = ctx.createLinearGradient(tailX, tailY, headX, headY);
            trailGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            trailGrad.addColorStop(0.7, interpolateRgba([200, 230, 255], [255, 215, 140], clampedShift, 0.45 * fade));
            trailGrad.addColorStop(1, `rgba(255, 255, 255, ${0.95 * fade})`);

            ctx.strokeStyle = trailGrad;
            ctx.lineWidth = 2.2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(headX, headY);
            ctx.stroke();

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
  }, [zoneShift, isBuiltIn, atmosphere]);

  // Pointer down ripple with pre-allocated pool assignment
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find available ripple from pre-allocated pool
    const pool = ripplePoolRef.current;
    let slot = pool.find((r) => !r.active);
    if (!slot) {
      slot = pool[0];
    }
    if (slot) {
      slot.active = true;
      slot.x = x;
      slot.y = y;
      slot.radius = 4;
      slot.maxRadius = 45;
      slot.alpha = 0.7;
    }

    audioEngine.playStarGazeChime();

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
  }, [onMeteorClick]);

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
});

SkyCanvas.displayName = 'SkyCanvas';

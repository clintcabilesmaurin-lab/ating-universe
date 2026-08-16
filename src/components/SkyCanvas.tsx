import React, { useEffect, useRef, useState, useCallback } from 'react';
import { audioEngine } from '../utils/audioEngine';

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
  coolRgb: RgbTuple; // Crystalline ice-blue / diamond white at zenith indigo
  warmRgb: RgbTuple; // Deeply saturated gold / rose / violet / amber at dusk purple
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
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

interface SkyCanvasProps {
  zoneShift?: number; // 0 (deep indigo) to 1 (dusk purple)
  onMeteorClick?: () => void;
  isBuiltIn?: boolean;
}

interface MountainPoint {
  x: number; // 0 to 1 fraction across screen width
  y: number; // 0 to 1 normalized height fraction of tier band
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

const STAR_COUNT = 125;

// Defined Natural Smooth Mountain Range Tiers (Distant Cordillera, Mount Pangilatan Massif, Gentle Rolling Foothills)
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
    // Featuring natural rounded Mount Pangilatan peak around x=0.34
    points: [
      { x: -0.12, y: 0.28 },
      { x: 0.02, y: 0.55 },
      { x: 0.14, y: 0.42 },
      { x: 0.24, y: 0.75 },
      { x: 0.34, y: 0.98 }, // Mount Pangilatan Smooth Summit
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
    // Gentle rolling front hills
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

const interpolateRgba = (c1: RgbTuple, c2: RgbTuple, t: number, alpha: number): string => {
  const clampedT = Math.max(0, Math.min(1, t));
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * clampedT);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * clampedT);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * clampedT);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
};

export const SkyCanvas: React.FC<SkyCanvasProps> = ({
  zoneShift = 0,
  onMeteorClick,
  isBuiltIn = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const meteorRef = useRef<Meteor | null>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const lastMeteorCheckRef = useRef<number>(0);
  const meteorLingerStartRef = useRef<number>(Date.now());
  const [canCatchMeteor, setCanCatchMeteor] = useState(false);

  // Mouse & Scroll Parallax Coordinates (smoothed via lerp)
  const targetMouseRef = useRef({ x: 0, y: 0 });
  const currentMouseRef = useRef({ x: 0, y: 0 });

  // Initialize star field with chromatic palettes for zoneShift
  const initStars = useCallback(() => {
    const list: Star[] = [];

    // Distinct cool & warm color pairings for deep indigo -> dusk purple
    const colorPairings: { cool: RgbTuple; warm: RgbTuple }[] = [
      { cool: [255, 255, 255], warm: [255, 230, 160] }, // Pure Diamond -> Celestial Gold
      { cool: [210, 235, 255], warm: [255, 185, 95] },  // Ice Azure -> Solar Amber
      { cool: [195, 225, 255], warm: [255, 140, 180] }, // Crystalline Blue -> Romantic Rose
      { cool: [225, 240, 255], warm: [225, 155, 255] }, // Starlight White -> Cosmic Lavender
      { cool: [180, 220, 255], warm: [248, 115, 215] }, // Deep Cyan -> Radiant Magenta
      { cool: [240, 248, 255], warm: [255, 205, 130] }, // Stellar Pearl -> Warm Topaz
    ];

    for (let i = 0; i < STAR_COUNT; i++) {
      const isBand = i < STAR_COUNT * 0.38;
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
    meteorLingerStartRef.current = Date.now();
  }, [initStars]);

  // Global mousemove listener for 3D parallax tracking
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
      const clampedShift = Math.max(0, Math.min(1, zoneShift));

      // Smooth lerp mouse parallax offset
      currentMouseRef.current.x += (targetMouseRef.current.x - currentMouseRef.current.x) * 0.05;
      currentMouseRef.current.y += (targetMouseRef.current.y - currentMouseRef.current.y) * 0.05;
      const mouseOffset = currentMouseRef.current;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw atmospheric background gradient (Continuous smooth transition from deep indigo to dusk purple)
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      
      // Zenith Top
      grad.addColorStop(0, interpolateRgb([6, 8, 22], [12, 6, 30], clampedShift));
      
      // Upper Atmosphere
      grad.addColorStop(0.35, interpolateRgb([18, 26, 62], [42, 18, 74], clampedShift));
      
      // Mid Horizon Glow
      grad.addColorStop(0.68, interpolateRgb([36, 48, 96], [116, 42, 92], clampedShift));
      
      // Horizon Base Ember
      grad.addColorStop(1, interpolateRgb([60, 74, 126], [222, 108, 72], clampedShift));

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Milky Way diffuse glow with zoneShift tinting & saturation
      const milkySteps = 8;
      const bandBaseX = width * 0.22 + mouseOffset.x * 25;
      const bandBaseY = mouseOffset.y * 15;
      
      // Milky Way shifts from cool celestial cyan-violet to warm saturated magenta-lavender
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

      // 3. Draw Stars with Parallax Depth, Dynamic Twinkle Intensity, and Color Saturation Shift
      if (isBuiltIn) {
        const elapsed = now / 1000;

        starsRef.current.forEach((star) => {
          // 3D parallax displacement based on depth
          const parallaxX = mouseOffset.x * star.depth * 35;
          const parallaxY = mouseOffset.y * star.depth * 25;

          const x = star.xFrac * width + parallaxX;
          const y = star.yFrac * height + parallaxY;

          // Expand twinkle intensity: Deep Indigo is crisp and calm (0.18 amp), Dusk Purple twinkles vibrantly (0.75 amp)
          const twinkleAmp = 0.18 + clampedShift * 0.57;
          const speedMultiplier = 1.0 + clampedShift * 0.85;
          const harmonic = Math.sin(elapsed * star.twinkleSpeed * 2.2 * speedMultiplier + star.twinklePhase * 1.5) * (0.18 + clampedShift * 0.22);
          const primaryWave = Math.sin(elapsed * star.twinkleSpeed * speedMultiplier + star.twinklePhase);
          const twinkle = Math.max(0.06, 1 - twinkleAmp + twinkleAmp * (primaryWave * 0.75 + harmonic));
          
          // Alpha scales gently with atmospheric depth
          const alpha = Math.min(1, star.baseAlpha * twinkle * (0.88 + clampedShift * 0.28));

          // Interpolated chromatic star color (from ice/diamond to rich saturated jewel tones)
          const starColor = interpolateRgba(star.coolRgb, star.warmRgb, clampedShift, alpha);

          // Corona / Atmospheric Bloom Halo
          if (star.glow) {
            // Glow radius blooms wider and warmer as zoneShift increases toward dusk purple
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

          // Star Core Disc
          ctx.fillStyle = starColor;
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
          ctx.strokeStyle = interpolateRgba([215, 235, 255], [255, 215, 140], clampedShift, rip.alpha * 0.7);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ripplesRef.current.splice(idx, 1);
        }
      });

      // 5. Draw Natural Smooth Mountain Ranges with Organic Curvature, Parallax & Atmosphere Shifting
      NATURAL_MOUNTAIN_TIERS.forEach((tier) => {
        const horizonParallaxX = mouseOffset.x * tier.parallax * 45;
        const horizonParallaxY = mouseOffset.y * tier.parallax * 20;
        const maxPeakHeight = height * tier.heightFrac;
        const baseY = height;

        // A. Atmospheric Valley Mist behind each natural tier
        const mistAlpha = 0.20 + (1 - tier.depth) * 0.18 + clampedShift * 0.12;
        const mistGrad = ctx.createLinearGradient(0, baseY - maxPeakHeight * 0.85, 0, baseY);
        mistGrad.addColorStop(
          0,
          interpolateRgba(tier.mistCool, tier.mistWarm, clampedShift, 0)
        );
        mistGrad.addColorStop(
          0.5,
          interpolateRgba(tier.mistCool, tier.mistWarm, clampedShift, mistAlpha * 0.6)
        );
        mistGrad.addColorStop(
          1,
          interpolateRgba(tier.mistCool, tier.mistWarm, clampedShift, mistAlpha)
        );

        ctx.fillStyle = mistGrad;
        ctx.fillRect(-30, baseY - maxPeakHeight * 0.95, width + 60, maxPeakHeight * 0.95 + 20);

        // Compute screen coordinates for smooth curved mountain profile
        const screenPts = tier.points.map((pt) => ({
          x: pt.x * width + horizonParallaxX,
          y: baseY - pt.y * maxPeakHeight + horizonParallaxY,
        }));

        if (screenPts.length < 2) return;

        // B. Render Smooth Organic Mountain Body
        const mountainGrad = ctx.createLinearGradient(0, baseY - maxPeakHeight, 0, baseY);
        mountainGrad.addColorStop(
          0,
          interpolateRgb(tier.litCool, tier.litWarm, clampedShift)
        );
        mountainGrad.addColorStop(
          0.45,
          interpolateRgb(tier.shadedCool, tier.shadedWarm, clampedShift)
        );
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

        // C. Soft Natural Ridge Volume Accent (Subtle undulating inner slope layer)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(screenPts[0].x, screenPts[0].y);
        for (let i = 0; i < screenPts.length - 1; i++) {
          const xc = (screenPts[i].x + screenPts[i + 1].x) / 2;
          const yc = (screenPts[i].y + screenPts[i + 1].y) / 2;
          ctx.quadraticCurveTo(screenPts[i].x, screenPts[i].y, xc, yc);
        }
        ctx.lineTo(lastPt.x, lastPt.y);
        ctx.lineTo(width + 80, baseY + 30);
        ctx.lineTo(-80, baseY + 30);
        ctx.closePath();
        ctx.clip();

        // Soft diagonal natural starlight slope illumination
        const slopeGrad = ctx.createLinearGradient(
          width * 0.2,
          baseY - maxPeakHeight * 1.2,
          width * 0.8,
          baseY
        );
        slopeGrad.addColorStop(
          0,
          interpolateRgba(tier.rimCool, tier.rimWarm, clampedShift, 0.16)
        );
        slopeGrad.addColorStop(
          0.5,
          interpolateRgba(tier.litCool, tier.litWarm, clampedShift, 0.08)
        );
        slopeGrad.addColorStop(
          1,
          interpolateRgba(tier.shadedCool, tier.shadedWarm, clampedShift, 0)
        );
        ctx.fillStyle = slopeGrad;
        ctx.fillRect(-30, baseY - maxPeakHeight * 1.1, width + 60, maxPeakHeight * 1.1 + 30);
        ctx.restore();

        // D. Ethereal Mountain Crest Rim Highlight (Smooth, soft starlight edge)
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

            // Draw streak with atmospheric tint
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

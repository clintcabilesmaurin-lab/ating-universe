import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WORLDS, PANGILATAN_LINES } from '../data/universeData';
import { WorldStar } from '../types';
import { Sparkles, Heart, Compass, Image as ImageIcon, Mail, Lock, ExternalLink, Globe } from 'lucide-react';
import { World3DIcon } from './World3DIcon';
import { audioEngine } from '../utils/audioEngine';

interface ConstellationLayerProps {
  onSelectWorld: (world: WorldStar) => void;
  onSpeak: (line: string, isAche?: boolean) => void;
  onOpenPangilatan: (line: string) => void;
  previewedIds: Set<string>;
}

interface NodePos {
  x: number;
  y: number;
}

interface PangilatanSafeZone {
  id: string;
  name: string;
  side: 'left' | 'right';
  minTop: number;
  maxTop: number;
  minOffsetPercent: number;
  maxOffsetPercent: number;
}

// Certified safe, non-overlapping celestial coordinates for Pangilatan on refresh
const PANGILATAN_SAFE_ZONES: PangilatanSafeZone[] = [
  {
    id: 'zone-upper-right',
    name: 'Silangang Kalangitan',
    side: 'right',
    minTop: 90,
    maxTop: 240,
    minOffsetPercent: 3,
    maxOffsetPercent: 12,
  },
  {
    id: 'zone-gap-0-1-right',
    name: 'Itaas na Pagitan ng mga Bituin',
    side: 'right',
    minTop: 420,
    maxTop: 500,
    minOffsetPercent: 4,
    maxOffsetPercent: 14,
  },
  {
    id: 'zone-mid-left',
    name: 'Kanlurang Tagpuan ng Ulap',
    side: 'left',
    minTop: 680,
    maxTop: 830,
    minOffsetPercent: 3,
    maxOffsetPercent: 12,
  },
  {
    id: 'zone-gap-1-2-left',
    name: 'Gitnang Pagitan ng Alaala',
    side: 'left',
    minTop: 980,
    maxTop: 1060,
    minOffsetPercent: 4,
    maxOffsetPercent: 14,
  },
  {
    id: 'zone-mid-right',
    name: 'Silangang Tuktok ng Liham',
    side: 'right',
    minTop: 1240,
    maxTop: 1390,
    minOffsetPercent: 3,
    maxOffsetPercent: 12,
  },
  {
    id: 'zone-gap-2-3-right',
    name: 'Ibaba na Pagitan ng Pangarap',
    side: 'right',
    minTop: 1540,
    maxTop: 1620,
    minOffsetPercent: 4,
    maxOffsetPercent: 14,
  },
  {
    id: 'zone-lower-left',
    name: 'Katimugang Horizon ng Pangilatan',
    side: 'left',
    minTop: 1800,
    maxTop: 1950,
    minOffsetPercent: 3,
    maxOffsetPercent: 12,
  },
];

const getRandomPangilatanPosition = () => {
  const zone = PANGILATAN_SAFE_ZONES[Math.floor(Math.random() * PANGILATAN_SAFE_ZONES.length)];
  const randomTop = Math.floor(zone.minTop + Math.random() * (zone.maxTop - zone.minTop));
  const randomOffset = Math.floor(
    zone.minOffsetPercent + Math.random() * (zone.maxOffsetPercent - zone.minOffsetPercent)
  );
  return {
    side: zone.side,
    top: randomTop,
    offsetPercent: randomOffset,
    zoneName: zone.name,
    zoneId: zone.id,
  };
};

const CONSTELLATION_LINKS = [
  { id: 'link-1-2', from: 'our-first-year', to: 'memory-gallery', label: 'Unang Taon • Galeriya', color1: '#f4d58d', color2: '#c084fc', curve: 0.12 },
  { id: 'link-2-3', from: 'memory-gallery', to: 'letters', label: 'Galeriya • Liham', color1: '#c084fc', color2: '#fb7185', curve: -0.13 },
  { id: 'link-3-4', from: 'letters', to: 'travel-world', label: 'Liham • Pangarap', color1: '#fb7185', color2: '#38bdf8', curve: 0.1 },
  { id: 'link-1-pangilatan', from: 'our-first-year', to: 'pangilatan', label: 'Panimula • Pangilatan', color1: '#f4d58d', color2: '#9dbf9a', curve: -0.09 },
  { id: 'link-2-pangilatan', from: 'memory-gallery', to: 'pangilatan', label: 'Alaala • Pangilatan', color1: '#c084fc', color2: '#9dbf9a', curve: 0.08 },
];

export const ConstellationLayer: React.FC<ConstellationLayerProps> = ({
  onSelectWorld,
  onSpeak,
  onOpenPangilatan,
  previewedIds,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [nodePositions, setNodePositions] = useState<Record<string, NodePos>>({});
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isLayerHovered, setIsLayerHovered] = useState(false);
  const [activeTappedId, setActiveTappedId] = useState<string | null>(null);
  const tapTimerRef = useRef<number | null>(null);

  // Mouse Parallax Offset for foreground 3D depth floating
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 });

  const [selectedMountainLine] = useState(() => {
    return PANGILATAN_LINES[Math.floor(Math.random() * PANGILATAN_LINES.length)];
  });

  // Random safe, non-overlapping position generated per refresh
  const [pangilatanPos] = useState(() => getRandomPangilatanPosition());

  // Track mouse coordinates for foreground constellation parallax
  useEffect(() => {
    let animFrame: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const updateLoop = () => {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      setMouseParallax({ x: currentX, y: currentY });
      animFrame = requestAnimationFrame(updateLoop);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animFrame = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  // Calculate pixel positions of all constellation star nodes relative to container
  const updatePositions = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const positions: Record<string, NodePos> = {};

    Object.entries(nodeRefs.current).forEach(([id, el]) => {
      const nodeEl = el as HTMLDivElement | null;
      if (nodeEl) {
        const rect = nodeEl.getBoundingClientRect();
        positions[id] = {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
        };
      }
    });

    if (Object.keys(positions).length > 0) {
      setNodePositions(positions);
    }
  };

  useEffect(() => {
    updatePositions();

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updatePositions);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener('resize', updatePositions);

    const t1 = window.setTimeout(updatePositions, 100);
    const t2 = window.setTimeout(updatePositions, 600);
    const t3 = window.setTimeout(updatePositions, 1200);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updatePositions);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

  const triggerTapGlow = (id: string) => {
    setActiveTappedId(id);
    if (tapTimerRef.current) {
      window.clearTimeout(tapTimerRef.current);
    }
    tapTimerRef.current = window.setTimeout(() => {
      setActiveTappedId(null);
    }, 2800);
  };

  const handleStarClick = (world: WorldStar) => {
    audioEngine.playStarGazeChime();
    triggerTapGlow(world.id);
    onSpeak(world.previewLine);
    if (world.acheLine) {
      window.setTimeout(() => {
        onSpeak(world.acheLine!, true);
      }, 4200);
    }
    onSelectWorld(world);
  };

  const handleMountainClick = () => {
    audioEngine.playStarGazeChime();
    triggerTapGlow('pangilatan');
    onOpenPangilatan(selectedMountainLine);
  };

  // Generate smooth celestial quadratic curve between two points
  const generateCurvedPath = (p1: NodePos, p2: NodePos, curveFactor = 0.12) => {
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const cx = mx - dy * curveFactor;
    const cy = my + dx * curveFactor;
    return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  };

  const isAnyInteractiveHover = Boolean(hoveredNodeId || isLayerHovered || activeTappedId);

  return (
    <div
      ref={containerRef}
      id="constellation-container"
      onMouseEnter={() => setIsLayerHovered(true)}
      onMouseLeave={() => {
        setIsLayerHovered(false);
        setHoveredNodeId(null);
      }}
      className="relative w-full max-w-4xl mx-auto py-24 px-4 min-h-[2200px] select-none"
    >
      {/* Dynamic SVG Glowing Constellation Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
        style={{ filter: 'drop-shadow(0 0 10px rgba(244, 213, 141, 0.2))' }}
      >
        <defs>
          <filter id="constellation-blur-heavy" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="constellation-blur-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradients for each interconnected memory link */}
          {CONSTELLATION_LINKS.map((link) => (
            <linearGradient
              key={`grad-${link.id}`}
              id={`grad-${link.id}`}
              gradientUnits="userSpaceOnUse"
              x1={nodePositions[link.from]?.x ?? 0}
              y1={nodePositions[link.from]?.y ?? 0}
              x2={nodePositions[link.to]?.x ?? 100}
              y2={nodePositions[link.to]?.y ?? 100}
            >
              <stop offset="0%" stopColor={link.color1} stopOpacity="0.95" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="100%" stopColor={link.color2} stopOpacity="0.95" />
            </linearGradient>
          ))}
        </defs>

        {/* Render Connection Lines between Star Nodes */}
        {CONSTELLATION_LINKS.map((link) => {
          const p1 = nodePositions[link.from];
          const p2 = nodePositions[link.to];
          if (!p1 || !p2) return null;

          const isDirectlyConnected =
            hoveredNodeId === link.from ||
            hoveredNodeId === link.to ||
            activeTappedId === link.from ||
            activeTappedId === link.to;

          const pathD = generateCurvedPath(p1, p2, link.curve);

          return (
            <g key={link.id} className="transition-opacity duration-700">
              {/* Outer Radiant Glowing Aura Stroke */}
              <motion.path
                d={pathD}
                fill="none"
                stroke={`url(#grad-${link.id})`}
                strokeWidth={isDirectlyConnected ? 12 : 7}
                strokeLinecap="round"
                filter="url(#constellation-blur-heavy)"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: isDirectlyConnected ? 0.75 : isAnyInteractiveHover ? 0.35 : 0,
                }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />

              {/* Medium Glowing Vibrant Beam */}
              <motion.path
                d={pathD}
                fill="none"
                stroke={`url(#grad-${link.id})`}
                strokeWidth={isDirectlyConnected ? 3.5 : 2}
                strokeLinecap="round"
                strokeDasharray={isDirectlyConnected ? 'none' : '4 6'}
                filter="url(#constellation-blur-soft)"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: isDirectlyConnected ? 0.95 : isAnyInteractiveHover ? 0.5 : 0,
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />

              {/* Crisp Core Filament Line */}
              <motion.path
                d={pathD}
                fill="none"
                stroke="#ffffff"
                strokeWidth={isDirectlyConnected ? 1.5 : 1}
                strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: isDirectlyConnected ? 0.9 : isAnyInteractiveHover ? 0.4 : 0,
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />

              {/* Traveling Pulse Photon along active connection */}
              {isDirectlyConnected && (
                <motion.circle
                  r="3.5"
                  fill="#ffffff"
                  filter="url(#constellation-blur-soft)"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    scale: [0.8, 1.4, 0.8],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <animateMotion
                    path={pathD}
                    dur="2.4s"
                    repeatCount="indefinite"
                    rotate="auto"
                  />
                </motion.circle>
              )}
            </g>
          );
        })}
      </svg>

      {/* Decorative vertical glowing constellation guide */}
      <div className="absolute left-1/2 -translate-x-1/2 top-32 bottom-48 w-0.5 bg-gradient-to-b from-amber-200/20 via-purple-300/30 to-sky-300/10 pointer-events-none" />

      {/* Intro Header with 3D Parallax */}
      <div
        className="text-center pt-8 pb-16 relative z-10 transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${mouseParallax.x * -12}px, ${mouseParallax.y * -8}px, 0)`,
        }}
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="text-xs uppercase tracking-[0.35em] text-amber-200/60 mb-2 font-sans"
        >
          Ating Universe &bull; Cl &amp; Maica
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.2 }}
          className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-amber-100 tracking-wide"
        >
          Ang Ating Kalawakan
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.4 }}
          className="text-sm text-slate-300/70 max-w-md mx-auto mt-3 italic font-serif leading-relaxed"
        >
          Mag-scroll pababa para balikan ang ating kwento mula sa unang taon hanggang sa mga pangarap na darating.
        </motion.p>
      </div>

      {/* World Stars Sequence */}
      <div className="relative space-y-64 pt-8 pb-32 z-10">
        {WORLDS.map((world, index) => {
          const isEven = index % 2 === 0;
          const isPreviewed = previewedIds.has(world.id);
          const isHovered = hoveredNodeId === world.id || activeTappedId === world.id;

          // Parallax depth multiplier per node to enhance 3D spatial separation
          const nodeParallaxFactor = (index % 2 === 0 ? 1.2 : 0.85) * -18;

          return (
            <motion.div
              key={world.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setHoveredNodeId(world.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              style={{
                transform: `translate3d(${mouseParallax.x * nodeParallaxFactor}px, ${mouseParallax.y * (nodeParallaxFactor * 0.7)}px, 0)`,
              }}
              className={`relative flex flex-col items-center transition-transform duration-300 ease-out ${
                isEven ? 'md:items-start md:pl-16' : 'md:items-end md:pr-16'
              }`}
            >
              {/* Star Node Interactive Element */}
              <div
                ref={(el) => {
                  nodeRefs.current[world.id] = el;
                }}
                className="group relative cursor-pointer"
                onClick={() => handleStarClick(world)}
              >
                {/* Star Halo & Ambient Glow */}
                <div
                  className={`absolute -inset-8 rounded-full blur-2xl transition-all duration-700 pointer-events-none ${
                    isHovered
                      ? 'scale-150 opacity-95'
                      : 'opacity-35 group-hover:opacity-85 group-hover:scale-130'
                  }`}
                  style={{
                    backgroundColor: world.active ? world.starColor : '#64748b',
                  }}
                />

                {/* Core Star Body with 3D Three.js Interactive Mesh & Glowing Orbit */}
                <div
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all duration-500 ease-out backdrop-blur-md ${
                    isHovered
                      ? 'scale-115 z-20'
                      : 'group-hover:scale-110'
                  } ${
                    world.active
                      ? 'bg-black/75 border-amber-200/70'
                      : 'bg-slate-900/75 border-slate-600/50 opacity-75'
                  }`}
                  style={{
                    borderColor: world.active ? world.starColor : '#64748b',
                    boxShadow: isHovered
                      ? `0 0 30px ${world.active ? world.starColor : '#64748b'}95, 0 0 60px ${world.active ? world.starColor : '#64748b'}45, inset 0 0 15px rgba(255, 255, 255, 0.3)`
                      : world.active
                      ? `0 0 18px ${world.starColor}45`
                      : 'none',
                  }}
                >
                  {/* 3D Three.js Animated Celestial Display */}
                  <World3DIcon
                    worldId={world.id}
                    color={world.starColor}
                    isActive={world.active}
                    isHovered={isHovered}
                    size={72}
                  />

                  {/* Pulsing Star Orbit Ring */}
                  {world.active && (
                    <span
                      className={`absolute -inset-2 rounded-full border border-amber-200/40 animate-ping opacity-30 transition-opacity duration-300 ${
                        isHovered ? 'opacity-60 border-amber-200/70' : ''
                      }`}
                      style={{ animationDuration: `${3 + index}s` }}
                    />
                  )}
                </div>

                {/* Star Order Badge */}
                <div
                  className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-black text-[10px] font-bold flex items-center justify-center shadow-md transition-all duration-300 z-20 ${
                    isHovered
                      ? 'bg-amber-300 scale-110 shadow-[0_0_10px_rgba(253,230,138,0.8)]'
                      : 'bg-amber-500/80'
                  }`}
                >
                  {world.order}
                </div>
              </div>

              {/* Persistent World Label Card */}
              <div
                className={`mt-4 max-w-xs text-center md:text-left bg-black/45 backdrop-blur-md p-4 rounded-2xl border transition-all duration-300 ${
                  isEven ? 'md:text-left' : 'md:text-right'
                } ${
                  isHovered
                    ? 'border-amber-200/60 shadow-[0_0_25px_rgba(244,213,141,0.25)] bg-black/65 scale-[1.02]'
                    : world.active
                    ? 'border-white/15 hover:border-amber-200/40'
                    : 'border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                  <h3
                    className="text-xl font-serif tracking-wide font-medium"
                    style={{ color: world.starColor }}
                  >
                    {world.name}
                  </h3>
                  {!world.active && (
                    <span className="flex items-center gap-1 text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                      <Lock className="w-2.5 h-2.5" /> Soon
                    </span>
                  )}
                </div>

                <p className="text-xs text-amber-100/70 font-sans tracking-wide mb-2">
                  {world.tagline}
                </p>

                <p className="text-xs text-slate-300/80 leading-relaxed font-serif italic line-clamp-2">
                  {world.description}
                </p>

                {/* Action Buttons */}
                <div className="mt-3 flex flex-wrap items-center gap-2 justify-center md:justify-start">
                  <button
                    id={`btn-open-${world.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStarClick(world);
                    }}
                    className="text-xs px-3.5 py-1.5 rounded-full font-sans tracking-wider transition-all flex items-center gap-1.5 bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-300/40 hover:border-amber-200 active:scale-95"
                  >
                    <span>Buksan • Pumasok</span>
                  </button>

                  {world.id === 'memory-gallery' && (
                    <a
                      href={world.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      id="card-btn-gallery-walk"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs px-3 py-1.5 rounded-full font-sans tracking-wider bg-purple-500/25 hover:bg-purple-500/45 text-purple-200 border border-purple-400/40 hover:border-purple-300 transition-all flex items-center gap-1 shadow-sm hover:scale-105"
                    >
                      <Globe className="w-3 h-3 text-purple-300" />
                      <span>3D Walk</span>
                      <ExternalLink className="w-3 h-3 text-purple-300 ml-0.5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Standalone Pangilatan Mountain Signature Star (Randomized Non-Overlapping Safe Position with Parallax) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          onMouseEnter={() => setHoveredNodeId('pangilatan')}
          onMouseLeave={() => setHoveredNodeId(null)}
          style={{
            top: `${pangilatanPos.top}px`,
            ...(pangilatanPos.side === 'left'
              ? { left: `${pangilatanPos.offsetPercent}%` }
              : { right: `${pangilatanPos.offsetPercent}%` }),
            transform: `translate3d(${mouseParallax.x * -24}px, ${mouseParallax.y * -16}px, 0)`,
          }}
          className="absolute z-20 transition-transform duration-300 ease-out"
        >
          <div
            ref={(el) => {
              nodeRefs.current['pangilatan'] = el;
            }}
            id="pangilatan-star"
            onClick={handleMountainClick}
            className="group relative cursor-pointer flex flex-col items-center"
          >
            {/* Emerald/Sage Ambient Glow */}
            <div
              className={`absolute -inset-6 rounded-full bg-[#9dbf9a]/30 blur-2xl transition-all duration-700 pointer-events-none ${
                hoveredNodeId === 'pangilatan' || activeTappedId === 'pangilatan'
                  ? 'scale-160 opacity-95'
                  : 'group-hover:scale-135 opacity-40 group-hover:opacity-85'
              }`}
            />

            {/* 4-Pointed Sparkle Star with scale-up and glowing shadow */}
            <div
              className={`relative w-14 h-14 flex items-center justify-center transition-all duration-500 ease-out animate-spin-slow ${
                hoveredNodeId === 'pangilatan' || activeTappedId === 'pangilatan'
                  ? 'scale-120'
                  : 'group-hover:scale-110'
              }`}
            >
              <svg
                viewBox="0 0 100 100"
                className={`w-11 h-11 transition-all duration-500 ${
                  hoveredNodeId === 'pangilatan' || activeTappedId === 'pangilatan'
                    ? 'drop-shadow-[0_0_20px_#9dbf9a] drop-shadow-[0_0_40px_rgba(157,191,154,0.6)]'
                    : 'drop-shadow-[0_0_12px_#9dbf9a]'
                }`}
              >
                <path
                  d="M 50 0 L 60 40 L 100 50 L 60 60 L 50 100 L 40 60 L 0 50 L 40 40 Z"
                  fill="#9dbf9a"
                  className="group-hover:fill-emerald-300 transition-colors"
                />
              </svg>
            </div>

            {/* Tag / Tooltip */}
            <div
              className={`mt-2 bg-emerald-950/85 border px-3 py-1 rounded-full text-[11px] font-serif tracking-wider shadow-lg flex items-center gap-1.5 backdrop-blur-md transition-all duration-300 ${
                hoveredNodeId === 'pangilatan' || activeTappedId === 'pangilatan'
                  ? 'border-emerald-400 text-emerald-100 shadow-[0_0_15px_rgba(157,191,154,0.4)] scale-105'
                  : 'border-emerald-500/30 text-emerald-200 group-hover:border-emerald-400/60'
              }`}
            >
              <span>⛰️ Pangilatan Mountain</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Closing Moment Anchor */}
      <div className="text-center pt-24 pb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6 }}
          className="inline-block p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 max-w-md text-center"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300/60 mb-2 font-sans">
            Wakas at Bagong Simula
          </p>
          <p className="text-base sm:text-lg font-serif italic text-amber-100/90 leading-relaxed">
            "Maraming pang mundo ang malilikha, sooner, heheh."
          </p>
          <p className="text-xs text-slate-400 mt-2 font-sans">
            Para sa ating dalawa, magpakailanman &bull; Clint &amp; Maica
          </p>
        </motion.div>
      </div>
    </div>
  );
};

import React, { useRef, useMemo, useEffect, useState, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { WeatherMoodId } from './CosmicWeather';

export type LumiMood =
  | 'happy'
  | 'loving'
  | 'starry'
  | 'playful'
  | 'giggle'
  | 'laugh'
  | 'tender'
  | 'ache'
  | 'angry'
  | 'curious'
  | 'sleepy';

export type LumiFlareType = 'star' | 'heart' | 'wonder' | 'sparkle' | 'fire';

interface LumiCompanionProps {
  mood?: LumiMood;
  weatherMood?: WeatherMoodId;
  flareTrigger?: number;
  flareType?: LumiFlareType;
  isBouncing?: boolean;
  isFlying?: boolean;
  isHovered?: boolean;
  size?: number;
  className?: string;
  onClick?: () => void;
}

interface MochiPalette {
  bodyColor: string;
  emissiveColor: string;
  glowColor: string;
  blushColor: string;
  eyeColor: string;
  highlightColor: string;
  earNubColor: string;
  particleColor: string;
  emissiveIntensity: number;
  swaySpeed: number;
  squashFactor: number;
}

const MOCHI_PALETTES: Record<LumiMood, MochiPalette> = {
  happy: {
    bodyColor: '#fffef2',
    emissiveColor: '#fef08a',
    glowColor: '#fde047',
    blushColor: '#fb7185',
    eyeColor: '#1e1b4b',
    highlightColor: '#ffffff',
    earNubColor: '#fef9c3',
    particleColor: '#fde047',
    emissiveIntensity: 0.45,
    swaySpeed: 1.0,
    squashFactor: 1.0,
  },
  loving: {
    bodyColor: '#fff5f7',
    emissiveColor: '#fbcfe8',
    glowColor: '#f472b6',
    blushColor: '#f43f5e',
    eyeColor: '#4c0519',
    highlightColor: '#ffffff',
    earNubColor: '#fce7f3',
    particleColor: '#fb7185',
    emissiveIntensity: 0.55,
    swaySpeed: 1.1,
    squashFactor: 1.05,
  },
  laugh: {
    bodyColor: '#fffef0',
    emissiveColor: '#fef08a',
    glowColor: '#facc15',
    blushColor: '#f97316',
    eyeColor: '#1e1b4b',
    highlightColor: '#ffffff',
    earNubColor: '#fef3c7',
    particleColor: '#fde047',
    emissiveIntensity: 0.6,
    swaySpeed: 1.45,
    squashFactor: 1.12,
  },
  giggle: {
    bodyColor: '#fffbf5',
    emissiveColor: '#fed7aa',
    glowColor: '#fb923c',
    blushColor: '#fb7185',
    eyeColor: '#27272a',
    highlightColor: '#ffffff',
    earNubColor: '#ffedd5',
    particleColor: '#fdba74',
    emissiveIntensity: 0.52,
    swaySpeed: 1.35,
    squashFactor: 1.08,
  },
  starry: {
    bodyColor: '#f0fdfa',
    emissiveColor: '#99f6e4',
    glowColor: '#38bdf8',
    blushColor: '#2dd4bf',
    eyeColor: '#0f172a',
    highlightColor: '#ffffff',
    earNubColor: '#ccfbf1',
    particleColor: '#7dd3fc',
    emissiveIntensity: 0.58,
    swaySpeed: 1.15,
    squashFactor: 1.02,
  },
  playful: {
    bodyColor: '#fffbeb',
    emissiveColor: '#fef08a',
    glowColor: '#f59e0b',
    blushColor: '#fb7185',
    eyeColor: '#1e1b4b',
    highlightColor: '#ffffff',
    earNubColor: '#fef3c7',
    particleColor: '#fbbf24',
    emissiveIntensity: 0.48,
    swaySpeed: 1.25,
    squashFactor: 1.06,
  },
  curious: {
    bodyColor: '#f8fafc',
    emissiveColor: '#e2e8f0',
    glowColor: '#94a3b8',
    blushColor: '#f472b6',
    eyeColor: '#0f172a',
    highlightColor: '#ffffff',
    earNubColor: '#f1f5f9',
    particleColor: '#cbd5e1',
    emissiveIntensity: 0.4,
    swaySpeed: 0.95,
    squashFactor: 1.0,
  },
  angry: {
    bodyColor: '#fff1f2',
    emissiveColor: '#fca5a5',
    glowColor: '#f87171',
    blushColor: '#dc2626',
    eyeColor: '#450a0a',
    highlightColor: '#ffffff',
    earNubColor: '#fee2e2',
    particleColor: '#ef4444',
    emissiveIntensity: 0.65,
    swaySpeed: 1.55,
    squashFactor: 1.15,
  },
  tender: {
    bodyColor: '#faf5ff',
    emissiveColor: '#e9d5ff',
    glowColor: '#c084fc',
    blushColor: '#d8b4fe',
    eyeColor: '#3b0764',
    highlightColor: '#ffffff',
    earNubColor: '#f3e8ff',
    particleColor: '#c084fc',
    emissiveIntensity: 0.42,
    swaySpeed: 0.8,
    squashFactor: 0.96,
  },
  ache: {
    bodyColor: '#f0f9ff',
    emissiveColor: '#bae6fd',
    glowColor: '#60a5fa',
    blushColor: '#93c5fd',
    eyeColor: '#172554',
    highlightColor: '#ffffff',
    earNubColor: '#e0f2fe',
    particleColor: '#93c5fd',
    emissiveIntensity: 0.38,
    swaySpeed: 0.72,
    squashFactor: 0.92,
  },
  sleepy: {
    bodyColor: '#fafaf9',
    emissiveColor: '#f5f5f4',
    glowColor: '#e7e5e4',
    blushColor: '#fbcfe8',
    eyeColor: '#292524',
    highlightColor: '#ffffff',
    earNubColor: '#f5f5f4',
    particleColor: '#fde047',
    emissiveIntensity: 0.3,
    swaySpeed: 0.55,
    squashFactor: 0.94,
  },
};

// ==========================================
// 1. PROCEDURAL 3D SHAPES & GEOMETRIES
// ==========================================

// Cute 4-point sparkle star geometry for glints and eyes
function createSparkleStarGeo(size = 0.045) {
  const shape = new THREE.Shape();
  const points = 4;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? size : size * 0.3;
    const a = (i * Math.PI) / points;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { depth: 0.015, bevelEnabled: false });
}

// Heart shape pupil geometry
function createHeartGeometry(size = 0.09) {
  const shape = new THREE.Shape();
  const x = 0, y = 0;
  shape.moveTo(x + 0.25 * size, y + 0.25 * size);
  shape.bezierCurveTo(x + 0.25 * size, y + 0.25 * size, x + 0.2 * size, y, x, y);
  shape.bezierCurveTo(x - 0.3 * size, y, x - 0.3 * size, y + 0.35 * size, x - 0.3 * size, y + 0.35 * size);
  shape.bezierCurveTo(x - 0.3 * size, y + 0.55 * size, x - 0.1 * size, y + 0.77 * size, x + 0.25 * size, y + 0.95 * size);
  shape.bezierCurveTo(x + 0.6 * size, y + 0.77 * size, x + 0.8 * size, y + 0.55 * size, x + 0.8 * size, y + 0.35 * size);
  shape.bezierCurveTo(x + 0.8 * size, y + 0.35 * size, x + 0.8 * size, y, x + 0.5 * size, y);
  shape.bezierCurveTo(x + 0.35 * size, y, x + 0.25 * size, y + 0.25 * size, x + 0.25 * size, y + 0.25 * size);

  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.018,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelSize: 0.006,
    bevelThickness: 0.006,
  });
}

// Gentle curved eyebrow arc
function createEyebrowGeo(width = 0.14, arch = 0.04, thickness = 0.024) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0);
  shape.quadraticCurveTo(0, arch, width / 2, 0);
  shape.quadraticCurveTo(0, arch - thickness, -width / 2, 0);
  shape.closePath();

  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.015,
    bevelEnabled: false,
  });
}

// ==========================================
// 2. CUTE 3D FACIAL EXPRESSIONS SYSTEM
// ==========================================
const MochiFace = memo<{
  mood: LumiMood;
  palette: MochiPalette;
  mousePos: THREE.Vector2;
  isHovered?: boolean;
}>(({ mood, palette, mousePos, isHovered = false }) => {
  const eyesGroupRef = useRef<THREE.Group>(null);
  const browsGroupRef = useRef<THREE.Group>(null);
  const [isBlinking, setIsBlinking] = useState(false);

  // Natural lively blinking rhythm
  useEffect(() => {
    let timer: number;
    const loopBlink = () => {
      const delay = 2400 + Math.random() * 3200;
      timer = window.setTimeout(() => {
        setIsBlinking(true);
        window.setTimeout(() => {
          setIsBlinking(false);
          loopBlink();
        }, 150);
      }, delay);
    };
    loopBlink();
    return () => window.clearTimeout(timer);
  }, []);

  const starGlintGeo = useMemo(() => createSparkleStarGeo(0.038), []);
  const heartPupilGeo = useMemo(() => createHeartGeometry(0.1), []);
  const browGeo = useMemo(() => createEyebrowGeo(0.14, 0.04, 0.024), []);

  useFrame(() => {
    if (eyesGroupRef.current) {
      const tx = mousePos.x * 0.09;
      const ty = mousePos.y * 0.06;
      eyesGroupRef.current.position.x += (tx - eyesGroupRef.current.position.x) * 0.14;
      eyesGroupRef.current.position.y += (ty - eyesGroupRef.current.position.y) * 0.14;
    }
  });

  return (
    <group position={[0, 0.02, 0.72]}>
      {/* 1. Chubby Rosy Blushing Cheek Orbs */}
      <mesh position={[-0.34, -0.12, 0.02]} scale={[1.2, 0.85, 0.6]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshBasicMaterial color={palette.blushColor} transparent opacity={isHovered ? 0.9 : 0.7} />
      </mesh>
      <mesh position={[0.34, -0.12, 0.02]} scale={[1.2, 0.85, 0.6]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshBasicMaterial color={palette.blushColor} transparent opacity={isHovered ? 0.9 : 0.7} />
      </mesh>

      {/* 2. Expressive Animated Eyebrows */}
      <group ref={browsGroupRef} position={[0, 0.18, 0.02]}>
        {mood === 'angry' ? (
          <>
            {/* Cute furrowed angry brows > < */}
            <mesh geometry={browGeo} position={[-0.2, 0.02, 0.02]} rotation={[0, 0, -0.36]}>
              <meshBasicMaterial color={palette.eyeColor} />
            </mesh>
            <mesh geometry={browGeo} position={[0.2, 0.02, 0.02]} rotation={[0, 0, 0.36]}>
              <meshBasicMaterial color={palette.eyeColor} />
            </mesh>
          </>
        ) : mood === 'curious' ? (
          <>
            {/* One raised brow, one neutral */}
            <mesh geometry={browGeo} position={[-0.2, 0.07, 0.02]} rotation={[0, 0, 0.28]}>
              <meshBasicMaterial color={palette.eyeColor} />
            </mesh>
            <mesh geometry={browGeo} position={[0.2, -0.01, 0.02]} rotation={[0, 0, 0.05]}>
              <meshBasicMaterial color={palette.eyeColor} />
            </mesh>
          </>
        ) : mood === 'ache' ? (
          <>
            {/* Sad / worried upward angled brows */}
            <mesh geometry={browGeo} position={[-0.2, 0.03, 0.02]} rotation={[0, 0, 0.32]}>
              <meshBasicMaterial color={palette.eyeColor} />
            </mesh>
            <mesh geometry={browGeo} position={[0.2, 0.03, 0.02]} rotation={[0, 0, -0.32]}>
              <meshBasicMaterial color={palette.eyeColor} />
            </mesh>
          </>
        ) : mood === 'sleepy' ? (
          <>
            {/* Relaxed low brows */}
            <mesh geometry={browGeo} position={[-0.2, -0.03, 0.02]} rotation={[0, 0, 0]}>
              <meshBasicMaterial color={palette.eyeColor} />
            </mesh>
            <mesh geometry={browGeo} position={[0.2, -0.03, 0.02]} rotation={[0, 0, 0]}>
              <meshBasicMaterial color={palette.eyeColor} />
            </mesh>
          </>
        ) : (
          <>
            {/* Happy soft lifted brows */}
            <mesh geometry={browGeo} position={[-0.2, 0.03, 0.02]} rotation={[0, 0, 0.1]}>
              <meshBasicMaterial color={palette.eyeColor} />
            </mesh>
            <mesh geometry={browGeo} position={[0.2, 0.03, 0.02]} rotation={[0, 0, -0.1]}>
              <meshBasicMaterial color={palette.eyeColor} />
            </mesh>
          </>
        )}
      </group>

      {/* 3. High-Expression Glossy 3D Eyes */}
      <group ref={eyesGroupRef}>
        {isBlinking || mood === 'sleepy' ? (
          <>
            {/* Sleeping / Blinking closed cute curves */}
            <mesh position={[-0.2, 0.04, 0.04]} rotation={[0, 0, 0]}>
              <torusGeometry args={[0.08, 0.02, 8, 16, Math.PI]} />
              <meshBasicMaterial color={palette.eyeColor} />
            </mesh>
            <mesh position={[0.2, 0.04, 0.04]} rotation={[0, 0, 0]}>
              <torusGeometry args={[0.08, 0.02, 8, 16, Math.PI]} />
              <meshBasicMaterial color={palette.eyeColor} />
            </mesh>
          </>
        ) : mood === 'laugh' || mood === 'giggle' ? (
          <>
            {/* Laughing closed crescents ( ^ ‿ ^ ) */}
            <mesh position={[-0.2, 0.05, 0.04]} rotation={[0, 0, Math.PI * 0.5]}>
              <torusGeometry args={[0.09, 0.024, 8, 16, Math.PI * 0.85]} />
              <meshBasicMaterial color={palette.eyeColor} />
            </mesh>
            <mesh position={[0.2, 0.05, 0.04]} rotation={[0, 0, -Math.PI * 0.5]}>
              <torusGeometry args={[0.09, 0.024, 8, 16, Math.PI * 0.85]} />
              <meshBasicMaterial color={palette.eyeColor} />
            </mesh>
          </>
        ) : mood === 'loving' ? (
          <>
            {/* Big Heart-Shaped Pupils */}
            <group position={[-0.2, 0.04, 0.03]}>
              <mesh scale={[1, 1, 0.35]}>
                <sphereGeometry args={[0.095, 20, 20]} />
                <meshBasicMaterial color={palette.eyeColor} />
              </mesh>
              <mesh geometry={heartPupilGeo} position={[-0.01, -0.05, 0.04]} rotation={[0, 0, Math.PI]}>
                <meshStandardMaterial color="#f43f5e" emissive="#fb7185" emissiveIntensity={1.4} />
              </mesh>
            </group>
            <group position={[0.2, 0.04, 0.03]}>
              <mesh scale={[1, 1, 0.35]}>
                <sphereGeometry args={[0.095, 20, 20]} />
                <meshBasicMaterial color={palette.eyeColor} />
              </mesh>
              <mesh geometry={heartPupilGeo} position={[-0.01, -0.05, 0.04]} rotation={[0, 0, Math.PI]}>
                <meshStandardMaterial color="#f43f5e" emissive="#fb7185" emissiveIntensity={1.4} />
              </mesh>
            </group>
          </>
        ) : mood === 'starry' ? (
          <>
            {/* Sparkle Star Eyes */}
            <group position={[-0.2, 0.04, 0.03]}>
              <mesh scale={[1, 1, 0.35]}>
                <sphereGeometry args={[0.095, 20, 20]} />
                <meshBasicMaterial color={palette.eyeColor} />
              </mesh>
              <mesh geometry={starGlintGeo} position={[0, 0, 0.04]}>
                <meshStandardMaterial color="#38bdf8" emissive="#7dd3fc" emissiveIntensity={1.5} />
              </mesh>
            </group>
            <group position={[0.2, 0.04, 0.03]}>
              <mesh scale={[1, 1, 0.35]}>
                <sphereGeometry args={[0.095, 20, 20]} />
                <meshBasicMaterial color={palette.eyeColor} />
              </mesh>
              <mesh geometry={starGlintGeo} position={[0, 0, 0.04]}>
                <meshStandardMaterial color="#38bdf8" emissive="#7dd3fc" emissiveIntensity={1.5} />
              </mesh>
            </group>
          </>
        ) : mood === 'playful' ? (
          <>
            {/* Open Left Eye, Winking Right Eye */}
            <group position={[-0.2, 0.04, 0.03]}>
              <mesh scale={[1, 1, 0.35]}>
                <sphereGeometry args={[0.095, 20, 20]} />
                <meshStandardMaterial color={palette.eyeColor} roughness={0.1} />
              </mesh>
              {/* Double Specular Highlights */}
              <mesh position={[0.03, 0.03, 0.06]}>
                <sphereGeometry args={[0.028, 12, 12]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              <mesh position={[-0.025, -0.025, 0.05]}>
                <sphereGeometry args={[0.014, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>

            {/* Right eye wink */}
            <mesh position={[0.2, 0.04, 0.04]} rotation={[0, 0, 0]}>
              <torusGeometry args={[0.08, 0.022, 8, 16, Math.PI]} />
              <meshBasicMaterial color={palette.eyeColor} />
            </mesh>
          </>
        ) : (
          <>
            {/* Big Glossy Eyes (Happy / Curious / Tender / Ache) */}
            {/* LEFT EYE */}
            <group position={[-0.2, 0.04, 0.03]}>
              <mesh scale={[1, 1, 0.35]}>
                <sphereGeometry args={[0.095, 20, 20]} />
                <meshStandardMaterial color={palette.eyeColor} roughness={0.1} />
              </mesh>
              {/* Primary Glint */}
              <mesh position={[0.028, 0.03, 0.06]}>
                <sphereGeometry args={[0.028, 12, 12]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              {/* Secondary Glint */}
              <mesh position={[-0.024, -0.024, 0.05]}>
                <sphereGeometry args={[0.014, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>

            {/* RIGHT EYE */}
            <group position={[0.2, 0.04, 0.03]}>
              <mesh scale={[1, 1, 0.35]}>
                <sphereGeometry args={[0.095, 20, 20]} />
                <meshStandardMaterial color={palette.eyeColor} roughness={0.1} />
              </mesh>
              {/* Primary Glint */}
              <mesh position={[0.022, 0.03, 0.06]}>
                <sphereGeometry args={[0.028, 12, 12]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              {/* Secondary Glint */}
              <mesh position={[-0.024, -0.024, 0.05]}>
                <sphereGeometry args={[0.014, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          </>
        )}

        {/* Sad / Crying Teardrop Crystal */}
        {mood === 'ache' && (
          <mesh position={[0.28, -0.06, 0.08]} rotation={[0, 0, 0.2]}>
            <octahedronGeometry args={[0.042, 0]} />
            <meshStandardMaterial
              color="#93c5fd"
              emissive="#3b82f6"
              emissiveIntensity={0.8}
              transparent
              opacity={0.85}
            />
          </mesh>
        )}
      </group>

      {/* 4. Expressive Mouth Shapes */}
      {mood === 'laugh' || mood === 'giggle' ? (
        // Open joyous laughing mouth ( ▽ )
        <mesh position={[0, -0.14, 0.06]}>
          <sphereGeometry args={[0.065, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshBasicMaterial color="#e11d48" />
        </mesh>
      ) : mood === 'loving' || mood === 'playful' ? (
        // Playful kitten smile :3
        <group position={[0, -0.14, 0.06]}>
          <mesh position={[-0.036, 0, 0]}>
            <torusGeometry args={[0.036, 0.013, 8, 16, Math.PI]} />
            <meshBasicMaterial color={palette.eyeColor} />
          </mesh>
          <mesh position={[0.036, 0, 0]}>
            <torusGeometry args={[0.036, 0.013, 8, 16, Math.PI]} />
            <meshBasicMaterial color={palette.eyeColor} />
          </mesh>
        </group>
      ) : mood === 'angry' ? (
        // Pouty little mouth > 3 <
        <mesh position={[0, -0.14, 0.06]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.045, 0.014, 8, 16, Math.PI * 0.65]} />
          <meshBasicMaterial color={palette.eyeColor} />
        </mesh>
      ) : mood === 'ache' ? (
        // Gentle sad downturned curve
        <mesh position={[0, -0.15, 0.06]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.048, 0.013, 8, 16, Math.PI * 0.6]} />
          <meshBasicMaterial color={palette.eyeColor} />
        </mesh>
      ) : (
        // Sweet happy smile ‿
        <mesh position={[0, -0.13, 0.06]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.062, 0.014, 8, 16, Math.PI * 0.78]} />
          <meshBasicMaterial color={palette.eyeColor} />
        </mesh>
      )}
    </group>
  );
});

// ==========================================
// 3. COMPLETE ROUND & SMOOTH MOCHI SPIRIT
// ==========================================
const MochiBody = memo<{
  mood: LumiMood;
  isBouncing?: boolean;
  isFlying?: boolean;
  isHovered?: boolean;
  flareTrigger?: number;
  flareType?: LumiFlareType;
}>(({ mood, isBouncing = false, isFlying = false, isHovered = false, flareTrigger = 0, flareType = 'star' }) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const bodyMeshRef = useRef<THREE.Mesh>(null);
  const leftEarRef = useRef<THREE.Group>(null);
  const rightEarRef = useRef<THREE.Group>(null);
  const leftHandRef = useRef<THREE.Group>(null);
  const rightHandRef = useRef<THREE.Group>(null);
  const flareGroupRef = useRef<THREE.Group>(null);
  const mousePos = useRef(new THREE.Vector2(0, 0));

  const palette = MOCHI_PALETTES[mood] || MOCHI_PALETTES.happy;

  // Track global mouse coordinates for smooth head & body orientation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      mousePos.current.set(nx, ny);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // GSAP 360° Joyful Cartwheel Flip on Click / Bounce
  useEffect(() => {
    if (isBouncing && rootGroupRef.current) {
      gsap.timeline()
        .to(rootGroupRef.current.rotation, {
          y: '+=6.28318',
          duration: 0.72,
          ease: 'back.out(2.0)',
        })
        .to(
          rootGroupRef.current.scale,
          {
            x: 1.28,
            y: 0.85,
            z: 1.28,
            duration: 0.18,
            yoyo: true,
            repeat: 1,
            ease: 'power2.out',
          },
          0
        );
    }
  }, [isBouncing]);

  // GSAP Giggling Jiggle on Laugh / Giggle Mood
  useEffect(() => {
    if ((mood === 'laugh' || mood === 'giggle') && rootGroupRef.current) {
      gsap.to(rootGroupRef.current.position, {
        y: '+=0.08',
        duration: 0.12,
        yoyo: true,
        repeat: 5,
        ease: 'power1.inOut',
      });
    } else if (mood === 'angry' && rootGroupRef.current) {
      // Cute angry stomp shake
      gsap.to(rootGroupRef.current.rotation, {
        z: 0.08,
        duration: 0.08,
        yoyo: true,
        repeat: 5,
        ease: 'power1.inOut',
      });
    }
  }, [mood]);

  // Reactive Particle Shockwave Expansion
  useEffect(() => {
    if (flareTrigger > 0 && flareGroupRef.current) {
      gsap.fromTo(
        flareGroupRef.current.scale,
        { x: 0.2, y: 0.2, z: 0.2 },
        { x: 2.2, y: 2.2, z: 2.2, duration: 0.75, ease: 'power2.out' }
      );
      gsap.fromTo(
        flareGroupRef.current.rotation,
        { z: 0 },
        { z: Math.PI * 2, duration: 0.75, ease: 'power1.out' }
      );
    }
  }, [flareTrigger]);

  // Smooth frame loop: rhythmic organic sway, ear wiggles, hand gestures, and breathing
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!rootGroupRef.current) return;

    const speed = (isHovered ? 1.6 : 1.0) * palette.swaySpeed;

    // Smooth head-tilt towards mouse cursor
    const targetRotY = mousePos.current.x * 0.38;
    const targetRotX = -mousePos.current.y * 0.24;
    rootGroupRef.current.rotation.y += (targetRotY - rootGroupRef.current.rotation.y) * 0.08;
    rootGroupRef.current.rotation.x += (targetRotX - rootGroupRef.current.rotation.x) * 0.08;

    // Harmonic floating side-to-side weightless sway
    rootGroupRef.current.rotation.z = Math.sin(t * 2.0 * speed) * 0.06;
    rootGroupRef.current.position.y = Math.sin(t * 2.8 * speed) * 0.04;

    // Squash & stretch breathing
    const breathY = 1 + Math.sin(t * 3.0 * speed) * 0.035 * palette.squashFactor;
    const breathXZ = 1 - Math.sin(t * 3.0 * speed) * 0.02 * palette.squashFactor;
    if (bodyMeshRef.current) {
      bodyMeshRef.current.scale.set(breathXZ, breathY, breathXZ);
    }

    // Ear / nub wiggles
    if (leftEarRef.current && rightEarRef.current) {
      leftEarRef.current.rotation.z = 0.3 + Math.sin(t * 3.6 * speed) * 0.08;
      rightEarRef.current.rotation.z = -0.3 - Math.sin(t * 3.6 * speed + 0.5) * 0.08;
    }

    // Hand gestures (clapping/dancing for happy, waving, resting on cheeks)
    if (leftHandRef.current && rightHandRef.current) {
      if (mood === 'loving') {
        // Hands held close to heart/cheeks
        leftHandRef.current.position.set(-0.28, -0.16, 0.62);
        rightHandRef.current.position.set(0.28, -0.16, 0.62);
        leftHandRef.current.rotation.z = 0.4 + Math.sin(t * 4) * 0.05;
        rightHandRef.current.rotation.z = -0.4 - Math.sin(t * 4) * 0.05;
      } else if (mood === 'laugh' || mood === 'giggle') {
        // Happy clapping little hands
        const clap = Math.sin(t * 12 * speed) * 0.08;
        leftHandRef.current.position.set(-0.35 + clap, -0.15, 0.55);
        rightHandRef.current.position.set(0.35 - clap, -0.15, 0.55);
      } else if (mood === 'angry') {
        // Hands on hips
        leftHandRef.current.position.set(-0.52, -0.18, 0.25);
        rightHandRef.current.position.set(0.52, -0.18, 0.25);
        leftHandRef.current.rotation.z = 0.8;
        rightHandRef.current.rotation.z = -0.8;
      } else {
        // Gentle floating arms
        leftHandRef.current.position.set(-0.5, -0.12 + Math.sin(t * 2.5 * speed) * 0.04, 0.2);
        rightHandRef.current.position.set(0.5, -0.12 + Math.cos(t * 2.5 * speed) * 0.04, 0.2);
        leftHandRef.current.rotation.z = 0.35 + Math.sin(t * 2.5 * speed) * 0.1;
        rightHandRef.current.rotation.z = -0.35 - Math.cos(t * 2.5 * speed) * 0.1;
      }
    }
  });

  return (
    <group ref={rootGroupRef}>
      {/* 1. Main Smooth Rounded Chubby Mochi Body */}
      <mesh ref={bodyMeshRef} castShadow receiveShadow>
        <sphereGeometry args={[0.72, 36, 36]} />
        <meshPhysicalMaterial
          color={palette.bodyColor}
          emissive={palette.emissiveColor}
          emissiveIntensity={palette.emissiveIntensity}
          roughness={0.22}
          metalness={0.04}
          clearcoat={0.3}
          clearcoatRoughness={0.2}
          transmission={0.12}
          thickness={0.5}
        />
      </mesh>

      {/* 2. Soft Squishy Ear Nubs (Top Left & Top Right) */}
      <group ref={leftEarRef} position={[-0.38, 0.52, 0.05]} rotation={[0, 0, 0.3]}>
        <mesh scale={[1, 1.25, 0.9]}>
          <sphereGeometry args={[0.18, 20, 20]} />
          <meshStandardMaterial
            color={palette.earNubColor}
            emissive={palette.emissiveColor}
            emissiveIntensity={palette.emissiveIntensity * 0.8}
            roughness={0.28}
          />
        </mesh>
      </group>
      <group ref={rightEarRef} position={[0.38, 0.52, 0.05]} rotation={[0, 0, -0.3]}>
        <mesh scale={[1, 1.25, 0.9]}>
          <sphereGeometry args={[0.18, 20, 20]} />
          <meshStandardMaterial
            color={palette.earNubColor}
            emissive={palette.emissiveColor}
            emissiveIntensity={palette.emissiveIntensity * 0.8}
            roughness={0.28}
          />
        </mesh>
      </group>

      {/* 3. Cute Stubby Hands */}
      <group ref={leftHandRef} position={[-0.5, -0.12, 0.2]}>
        <mesh scale={[1.2, 0.9, 0.9]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color={palette.earNubColor} roughness={0.3} />
        </mesh>
      </group>
      <group ref={rightHandRef} position={[0.5, -0.12, 0.2]}>
        <mesh scale={[1.2, 0.9, 0.9]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color={palette.earNubColor} roughness={0.3} />
        </mesh>
      </group>

      {/* 4. Little Rounded Feet */}
      <mesh position={[-0.22, -0.68, 0.12]} scale={[1, 0.65, 1.3]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color={palette.earNubColor} roughness={0.35} />
      </mesh>
      <mesh position={[0.22, -0.68, 0.12]} scale={[1, 0.65, 1.3]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color={palette.earNubColor} roughness={0.35} />
      </mesh>

      {/* 5. Cute & Expressive 3D Facial Features */}
      <MochiFace mood={mood} palette={palette} mousePos={mousePos.current} isHovered={isHovered} />

      {/* 6. Reactive Flare Particle Ring */}
      {flareTrigger > 0 && (
        <group ref={flareGroupRef}>
          {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4, (3 * Math.PI) / 2, (7 * Math.PI) / 4].map(
            (angle, i) => (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.95, Math.sin(angle) * 0.95, 0]}
                rotation={[0, 0, angle]}
              >
                <coneGeometry args={[0.06, 0.22, 8]} />
                <meshStandardMaterial
                  color={flareType === 'heart' ? '#f43f5e' : palette.glowColor}
                  emissive={flareType === 'heart' ? '#fda4af' : palette.particleColor}
                  emissiveIntensity={1.8}
                />
              </mesh>
            )
          )}
        </group>
      )}

      {/* 7. Surrounding Bioluminescent Sparkles */}
      <Sparkles
        count={24}
        scale={2.5}
        size={2.2}
        speed={isHovered ? 2.2 : 1.0}
        color={palette.particleColor}
        opacity={0.8}
      />
    </group>
  );
});

// ==========================================
// 4. MAIN LUMI COMPANION COMPONENT
// ==========================================
export const LumiCompanion: React.FC<LumiCompanionProps> = ({
  mood = 'happy',
  flareTrigger = 0,
  flareType = 'star',
  isBouncing = false,
  isFlying = false,
  isHovered = false,
  size = 112,
  className = '',
  onClick,
}) => {
  const palette = MOCHI_PALETTES[mood] || MOCHI_PALETTES.happy;

  // Spring physics for smooth pointer tracking head-tilt (Framer Motion)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 180, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 180, damping: 20 });
  const rotateX = useTransform(springY, [-50, 50], [12, -12]);
  const rotateY = useTransform(springX, [-50, 50], [-12, 12]);

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
  };

  return (
    <motion.div
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        width: size,
        height: size,
        rotateX,
        rotateY,
        perspective: 600,
      }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      className={`relative flex items-center justify-center cursor-pointer select-none ${className}`}
    >
      {/* Soft Ambient Spirit Aura Glow (Framer Motion) */}
      <motion.div
        animate={{
          scale: isHovered ? [1.1, 1.35, 1.1] : [1, 1.2, 1],
          opacity: isHovered ? [0.6, 0.85, 0.6] : [0.35, 0.6, 0.35],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
        style={{ backgroundColor: palette.glowColor }}
      />

      {/* 3D React-Three-Fiber Canvas Stage */}
      <div className="w-full h-full pointer-events-auto">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 3.2], fov: 45 }}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        >
          {/* Balanced Studio Lighting */}
          <ambientLight intensity={1.4} />
          <directionalLight position={[3, 5, 4]} intensity={1.6} />
          <pointLight
            position={[0, 0.2, 1.6]}
            color={palette.glowColor}
            intensity={palette.emissiveIntensity * 2.2}
            distance={4}
          />
          <pointLight position={[-2, -2, -2]} color="#ffffff" intensity={0.5} />

          {/* Natural Weightless Float */}
          <Float
            speed={isFlying ? 3.6 : isHovered ? 2.6 : 2.0}
            rotationIntensity={0.2}
            floatIntensity={isFlying ? 0.7 : 0.4}
            floatingRange={[-0.06, 0.06]}
          >
            <MochiBody
              mood={mood}
              isBouncing={isBouncing}
              isFlying={isFlying}
              isHovered={isHovered}
              flareTrigger={flareTrigger}
              flareType={flareType}
            />
          </Float>
        </Canvas>
      </div>
    </motion.div>
  );
};

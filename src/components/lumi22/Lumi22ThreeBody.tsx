import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { SoulEmotion, LumiMood, LumiBehaviorState } from './types';
import { ProceduralFaceTextureCache } from './faceRenderer';
import { createGhostBodyGeometry } from './ghostGeometry';
import { createCurvedFaceGeometry } from './curvedFaceGeometry';

interface Lumi22ThreeBodyProps {
  mood?: LumiMood | SoulEmotion;
  behavior?: LumiBehaviorState;
  isBouncing?: boolean;
  isFlying?: boolean;
  isHovered?: boolean;
  showHalo?: boolean;
  onCharacterClick?: () => void;
}

// Starlight Colors for Orbiting Stars
const STAR_COLORS = ['#fbbf24', '#38bdf8', '#fb7185', '#fef08a', '#ffffff', '#c084fc', '#67e8f9'];

// Star Geometry Generator
function createMiniStarGeo(r = 0.042) {
  const shape = new THREE.Shape();
  const points = 4;
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? r : r * 0.32;
    const a = (i * Math.PI) / points;
    const x = Math.cos(a) * radius;
    const y = Math.sin(a) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { depth: 0.012, bevelEnabled: false });
}

export const Lumi22ThreeBody: React.FC<Lumi22ThreeBodyProps> = ({
  mood = 'idle',
  behavior = 'floating',
  isBouncing = false,
  isFlying = false,
  isHovered = false,
  showHalo = true,
  onCharacterClick,
}) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const bodyMeshRef = useRef<THREE.Mesh>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);
  const faceMeshRef = useRef<THREE.Mesh>(null);
  const leftHandRef = useRef<THREE.Group>(null);
  const rightHandRef = useRef<THREE.Group>(null);
  const haloGroupRef = useRef<THREE.Group>(null);
  const starsGroupRef = useRef<THREE.Group>(null);

  // Mouse tracking spring state
  const mousePos = useRef({ x: 0, y: 0 });
  const currentRot = useRef({ x: 0, y: 0 });

  // Map mood and behavior to SoulEmotion
  const activeEmotion: SoulEmotion = useMemo(() => {
    if (behavior === 'sleeping') return 'blinking';
    if (behavior === 'pouting') return 'angry';
    if (behavior === 'dancing') return 'inlove';
    if (behavior === 'cheering') return 'excited';
    if (behavior === 'waking') return 'giggle';

    switch (mood) {
      case 'loving':
      case 'inlove':
        return 'inlove';
      case 'laugh':
        return 'laugh';
      case 'giggle':
        return 'giggle';
      case 'playful':
        return 'winking';
      case 'starry':
      case 'excited':
        return 'excited';
      case 'tender':
        return 'gentle';
      case 'ache':
      case 'cry':
        return 'cry';
      case 'sad':
        return 'sad';
      case 'angry':
        return 'angry';
      case 'curious':
        return 'thinking';
      case 'sleepy':
        return 'blinking';
      case 'happy':
        return 'happy';
      default:
        return (mood as SoulEmotion) || 'idle';
    }
  }, [mood, behavior]);

  // Texture Cache & Blinking State
  const textureCache = useMemo(() => new ProceduralFaceTextureCache(), []);
  const [currentFaceEmotion, setCurrentFaceEmotion] = useState<SoulEmotion>(activeEmotion);

  // Sync emotion change
  useEffect(() => {
    setCurrentFaceEmotion(activeEmotion);
  }, [activeEmotion]);

  // Clean up cache
  useEffect(() => {
    return () => textureCache.dispose();
  }, [textureCache]);

  // Procedural Blink System (every 4.2-6.2s for ~160ms)
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const scheduleBlink = () => {
      const delay = 4200 + Math.random() * 2000;
      blinkTimeout = setTimeout(() => {
        if (activeEmotion !== 'cry' && activeEmotion !== 'laugh' && activeEmotion !== 'giggle') {
          setCurrentFaceEmotion('blinking');
          setTimeout(() => {
            setCurrentFaceEmotion(activeEmotion);
            scheduleBlink();
          }, 160);
        } else {
          scheduleBlink();
        }
      }, delay);
    };

    scheduleBlink();
    return () => clearTimeout(blinkTimeout);
  }, [activeEmotion]);

  // Track global mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      mousePos.current = { x: nx, y: ny };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 1. Cute Ghost Body Geometry (Dome head + wavy skirt hem)
  const ghostGeo = useMemo(() => createGhostBodyGeometry(0.82, 0.96, 1.55, 48, 36, 6, 0.12), []);
  const baseGeometryPositions = useMemo(() => {
    return new Float32Array(ghostGeo.attributes.position.array);
  }, [ghostGeo]);

  // 2. Curved Face Geometry for the front head dome
  const curvedFaceGeo = useMemo(() => createCurvedFaceGeometry(1.05, 0.95, 0.85), []);
  const starJewelGeo = useMemo(() => createMiniStarGeo(0.045), []);

  // 10 Orbiting Celestial Stars Metadata
  const starOrbits = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => ({
      radius: 1.35 + (i % 3) * 0.18,
      speed: 0.45 + (i % 4) * 0.15,
      angleOffset: (i * Math.PI * 2) / 10,
      yOffset: Math.sin(i * 1.6) * 0.35,
      yFreq: 1.2 + (i % 3) * 0.5,
      scale: 0.75 + (i % 3) * 0.3,
      color: STAR_COLORS[i % STAR_COLORS.length],
    }));
  }, []);

  // Emotional Motion Language via GSAP
  useEffect(() => {
    if (!rootGroupRef.current) return;

    if (activeEmotion === 'laugh') {
      gsap.timeline()
        .to(rootGroupRef.current.position, { y: '+=0.28', duration: 0.18, ease: 'power2.out' })
        .to(rootGroupRef.current.scale, { x: 1.16, y: 0.86, z: 1.16, duration: 0.13, yoyo: true, repeat: 4 })
        .to(rootGroupRef.current.position, { y: '-=0.28', duration: 0.25, ease: 'elastic.out(1.2, 0.4)' })
        .to(rootGroupRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.18 });
    } else if (activeEmotion === 'giggle') {
      gsap.timeline()
        .to(rootGroupRef.current.rotation, { z: 0.12, duration: 0.08, yoyo: true, repeat: 5, ease: 'sine.inOut' })
        .to(rootGroupRef.current.scale, { x: 1.1, y: 0.92, z: 1.1, duration: 0.1, yoyo: true, repeat: 2 });
    } else if (activeEmotion === 'inlove' || activeEmotion === 'heart-eyes') {
      gsap.timeline()
        .to(rootGroupRef.current.rotation, { z: 0.1, duration: 0.32, ease: 'sine.inOut' })
        .to(rootGroupRef.current.scale, { x: 1.12, y: 1.08, z: 1.12, duration: 0.26, yoyo: true, repeat: 2, ease: 'power1.inOut' });
    } else if (activeEmotion === 'angry') {
      gsap.timeline()
        .to(rootGroupRef.current.scale, { x: 1.18, y: 0.9, z: 1.18, duration: 0.12, ease: 'power2.out' })
        .to(rootGroupRef.current.rotation, {
          z: 0.14,
          duration: 0.05,
          yoyo: true,
          repeat: 9,
          ease: 'power1.inOut',
        })
        .to(rootGroupRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.2 });
    } else if (activeEmotion === 'cry') {
      gsap.timeline()
        .to(rootGroupRef.current.position, { y: '-=0.14', duration: 0.4, ease: 'power2.out' })
        .to(rootGroupRef.current.rotation, { x: 0.12, duration: 0.35 })
        .to(rootGroupRef.current.position, { y: '+=0.03', duration: 0.15, yoyo: true, repeat: 3, ease: 'sine.inOut' });
    } else if (activeEmotion === 'sad') {
      gsap.to(rootGroupRef.current.position, { y: '-=0.1', duration: 0.5, ease: 'power2.out' });
      gsap.to(rootGroupRef.current.rotation, { z: -0.08, duration: 0.5 });
    } else if (activeEmotion === 'happy' || activeEmotion === 'excited') {
      gsap.timeline()
        .to(rootGroupRef.current.position, { y: '+=0.18', duration: 0.22, ease: 'power2.out' })
        .to(rootGroupRef.current.rotation, { y: '+=3.14', duration: 0.45, ease: 'power2.inOut' })
        .to(rootGroupRef.current.position, { y: '-=0.18', duration: 0.22, ease: 'bounce.out' });
    }
  }, [activeEmotion]);

  // Click / Bounce Spin
  useEffect(() => {
    if (isBouncing && rootGroupRef.current) {
      gsap.timeline()
        .to(rootGroupRef.current.rotation, {
          y: '+=6.28318',
          duration: 0.68,
          ease: 'back.out(2.0)',
        })
        .to(
          rootGroupRef.current.scale,
          { x: 1.18, y: 0.88, z: 1.18, duration: 0.16, yoyo: true, repeat: 1, ease: 'power2.out' },
          0
        );
    }
  }, [isBouncing]);

  // Frame Loop: Fluttering Skirt Wavy Ripples, Harmonic Figure-8 Sway, Spring Mouse Gaze, Real-Time Music Dance & Behavior Synced Kinematics
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!rootGroupRef.current) return;

    let emotionSpeedMul = 1.0;
    let swayAmpZ = 0.05;
    let floatAmpY = 0.07;
    let swayAmpX = 0.04;

    if (behavior === 'dancing') {
      emotionSpeedMul = 1.9;
      floatAmpY = 0.14;
      swayAmpZ = 0.12;
      swayAmpX = 0.08;
    } else if (behavior === 'sleeping') {
      emotionSpeedMul = 0.38;
      floatAmpY = 0.025;
      swayAmpZ = 0.02;
      swayAmpX = 0.015;
    } else if (activeEmotion === 'laugh') {
      emotionSpeedMul = 1.8;
      floatAmpY = 0.12;
      swayAmpZ = 0.08;
    } else if (activeEmotion === 'giggle') {
      emotionSpeedMul = 1.6;
      swayAmpZ = 0.09;
      floatAmpY = 0.06;
    } else if (activeEmotion === 'angry') {
      emotionSpeedMul = 2.2;
      swayAmpZ = 0.11;
      floatAmpY = 0.04;
    } else if (activeEmotion === 'cry' || activeEmotion === 'sad') {
      emotionSpeedMul = 0.65;
      floatAmpY = 0.035;
      swayAmpZ = 0.03;
    } else if (activeEmotion === 'inlove' || activeEmotion === 'heart-eyes') {
      emotionSpeedMul = 1.15;
      swayAmpZ = 0.07;
      floatAmpY = 0.08;
    }

    const speed = (isHovered ? 1.35 : 1.0) * (isFlying || behavior === 'following' ? 1.7 : 1.0) * emotionSpeedMul;

    // Spring Mouse Gaze Tracking (or gentle head tilt when sleeping / dancing)
    let targetRotY = mousePos.current.x * 0.32;
    let targetRotX = -mousePos.current.y * 0.2;

    if (behavior === 'sleeping') {
      targetRotY = 0.05;
      targetRotX = 0.18; // Head resting slightly downward
    } else if (behavior === 'dancing') {
      targetRotY += Math.sin(t * 4) * 0.15;
    }

    currentRot.current.y += (targetRotY - currentRot.current.y) * 0.08;
    currentRot.current.x += (targetRotX - currentRot.current.x) * 0.08;

    rootGroupRef.current.rotation.y = currentRot.current.y;
    rootGroupRef.current.rotation.x = currentRot.current.x;

    // Harmonic Figure-8 Celestial Floating Sway & Rhythmic Music Dance Pulse
    let figure8X = Math.sin(t * 1.3 * speed) * swayAmpX;
    let figure8Y = Math.sin(t * 2.2 * speed) * floatAmpY + Math.cos(t * 1.1 * speed) * 0.02;
    let figure8Z = Math.sin(t * 1.8 * speed) * swayAmpZ + (activeEmotion === 'giggle' ? Math.sin(t * 14) * 0.03 : 0);

    if (behavior === 'dancing') {
      figure8Y += Math.abs(Math.sin(t * 7.5)) * 0.08; // Rhythmic bounce to the music beat
      figure8Z += Math.sin(t * 3.75) * 0.07;
    }

    rootGroupRef.current.position.x = figure8X;
    rootGroupRef.current.position.y = figure8Y;
    rootGroupRef.current.rotation.z = figure8Z;

    // Fluttering ghost skirt hem wave deformer
    if (bodyMeshRef.current) {
      const posAttr = ghostGeo.attributes.position;
      const count = posAttr.count;
      const jiggle = isHovered ? 0.038 : 0.022;
      const waveFreq = activeEmotion === 'angry' ? 5.5 : activeEmotion === 'laugh' || activeEmotion === 'giggle' ? 4.2 : activeEmotion === 'cry' ? 1.8 : 3.2;

      for (let i = 0; i < count; i++) {
        const bx = baseGeometryPositions[i * 3];
        const by = baseGeometryPositions[i * 3 + 1];
        const bz = baseGeometryPositions[i * 3 + 2];

        // Bottom hem ripples smoothly like a floating ghost sheet
        if (by < -0.2) {
          const hemWave = Math.sin(t * waveFreq * speed + bx * 3 + bz * 3) * (jiggle * 2.0);
          posAttr.setXYZ(i, bx * (1 + hemWave), by + hemWave * 0.5, bz * (1 + hemWave));
        } else {
          const bodyBreath = Math.sin(t * 2.4 * speed) * (jiggle * 0.45);
          posAttr.setXYZ(i, bx * (1 + bodyBreath), by, bz * (1 + bodyBreath));
        }
      }
      posAttr.needsUpdate = true;
      ghostGeo.computeVertexNormals();
    }

    // Glowing Inner Heart Core Pulse
    if (innerCoreRef.current) {
      const pulseRate = activeEmotion === 'inlove' || activeEmotion === 'heart-eyes' ? 5.8 : activeEmotion === 'angry' ? 6.5 : 3.0;
      const coreScale = 0.42 * (1 + Math.sin(t * pulseRate) * 0.1);
      innerCoreRef.current.scale.set(coreScale, coreScale, coreScale);
    }

    // Golden Halo Bobbing & Rotation
    if (haloGroupRef.current) {
      haloGroupRef.current.rotation.y = t * 0.75;
      haloGroupRef.current.rotation.z = Math.sin(t * 1.8) * 0.06;
      haloGroupRef.current.position.y = 1.05 + Math.sin(t * 2.5) * 0.04;
    }

    // Floating Ghost Hands / Paws with Emotion-Aware Gestures
    if (leftHandRef.current && rightHandRef.current) {
      if (activeEmotion === 'inlove' || activeEmotion === 'heart-eyes') {
        // Hands clutching heart in front of core
        leftHandRef.current.position.set(-0.32, 0.04 + Math.sin(t * 3.2) * 0.02, 0.78);
        rightHandRef.current.position.set(0.32, 0.04 + Math.sin(t * 3.2 + 0.3) * 0.02, 0.78);
      } else if (activeEmotion === 'laugh') {
        // Rapid happy hand clapping
        const clap = Math.sin(t * 14) * 0.08;
        leftHandRef.current.position.set(-0.58 + clap, 0.32 + Math.sin(t * 6) * 0.04, 0.56);
        rightHandRef.current.position.set(0.58 - clap, 0.32 + Math.sin(t * 6) * 0.04, 0.56);
      } else if (activeEmotion === 'giggle') {
        // Paws covering blushing cheeks / mouth
        leftHandRef.current.position.set(-0.36, 0.18 + Math.sin(t * 10) * 0.03, 0.72);
        rightHandRef.current.position.set(0.36, 0.18 + Math.sin(t * 10 + 0.5) * 0.03, 0.72);
      } else if (activeEmotion === 'cry') {
        // Paws rubbing / wiping eyes
        const sobWobble = Math.sin(t * 8) * 0.02;
        leftHandRef.current.position.set(-0.38 + sobWobble, 0.24, 0.74);
        rightHandRef.current.position.set(0.38 - sobWobble, 0.24, 0.74);
      } else if (activeEmotion === 'sad') {
        // Hands hanging low, feeling down
        leftHandRef.current.position.set(-0.48, -0.38 + Math.sin(t * 1.5) * 0.02, 0.55);
        rightHandRef.current.position.set(0.48, -0.38 + Math.cos(t * 1.5) * 0.02, 0.55);
      } else if (activeEmotion === 'angry') {
        // Paws firmly on sides / cute stomping posture
        const angerShake = Math.sin(t * 16) * 0.02;
        leftHandRef.current.position.set(-0.76 + angerShake, -0.12, 0.42);
        rightHandRef.current.position.set(0.76 - angerShake, -0.12, 0.42);
      } else {
        // Neutral sweet hovering paws
        leftHandRef.current.position.set(-0.64, -0.08 + Math.sin(t * 2.2 * speed) * 0.04, 0.46);
        rightHandRef.current.position.set(0.64, -0.08 + Math.cos(t * 2.2 * speed) * 0.04, 0.46);
      }
    }

    // 10 Orbiting Stars
    if (starsGroupRef.current) {
      starsGroupRef.current.rotation.y = t * (activeEmotion === 'laugh' || activeEmotion === 'excited' ? 0.45 : 0.22);
      starsGroupRef.current.children.forEach((starMesh, idx) => {
        const meta = starOrbits[idx];
        if (!meta) return;
        const currentAngle = meta.angleOffset + t * meta.speed;
        const x = Math.cos(currentAngle) * meta.radius;
        const z = Math.sin(currentAngle) * meta.radius;
        const y = meta.yOffset + Math.sin(t * meta.yFreq) * 0.15;

        starMesh.position.set(x, y, z);
        starMesh.rotation.z = t * 1.4 + idx;
        const pulse = meta.scale * (1 + Math.sin(t * 2.8 + idx) * 0.22);
        starMesh.scale.set(pulse, pulse, pulse);
      });
    }
  });

  const activeFaceTexture = useMemo(() => {
    return textureCache.getTexture(currentFaceEmotion);
  }, [textureCache, currentFaceEmotion]);

  return (
    <group ref={rootGroupRef} onClick={onCharacterClick}>
      {/* 1. Main Cute Ghost Body (Bright, Luminous Pearlescent White) */}
      <mesh ref={bodyMeshRef} geometry={ghostGeo} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#ffffff"
          emissive="#e0f2fe"
          emissiveIntensity={isHovered ? 0.45 : 0.32}
          roughness={0.16}
          metalness={0.02}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
          sheen={1.0}
          sheenColor="#fbcfe8"
          transparent
          opacity={0.97}
        />
      </mesh>

      {/* 2. Glowing Inner Heart Core (Warm Rose/Pink) */}
      <mesh ref={innerCoreRef} position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshStandardMaterial
          color="#f43f5e"
          emissive="#f43f5e"
          emissiveIntensity={activeEmotion === 'inlove' ? 2.6 : 1.8}
          roughness={0.2}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* 3. Curved 2D Procedural Face Decal on Ghost Head Dome */}
      <mesh ref={faceMeshRef} geometry={curvedFaceGeo} position={[0, 0.12, 0.83]}>
        <meshBasicMaterial map={activeFaceTexture} transparent opacity={1.0} depthWrite={false} />
      </mesh>

      {/* 4. Independent Floating Ghost Paws (Hands) */}
      <group ref={leftHandRef} position={[-0.64, -0.08, 0.46]}>
        <mesh>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshPhysicalMaterial
            color="#ffffff"
            emissive="#bae6fd"
            emissiveIntensity={0.28}
            roughness={0.18}
            sheen={0.8}
            sheenColor="#fbcfe8"
            transparent
            opacity={0.95}
          />
        </mesh>
      </group>
      <group ref={rightHandRef} position={[0.64, -0.08, 0.46]}>
        <mesh>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshPhysicalMaterial
            color="#ffffff"
            emissive="#bae6fd"
            emissiveIntensity={0.28}
            roughness={0.18}
            sheen={0.8}
            sheenColor="#fbcfe8"
            transparent
            opacity={0.95}
          />
        </mesh>
      </group>

      {/* 5. Golden Celestial Halo */}
      {showHalo && (
        <group ref={haloGroupRef} position={[0, 1.05, 0]} rotation={[0.2, 0, 0]}>
          <mesh>
            <torusGeometry args={[0.42, 0.038, 16, 32]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#fde047"
              emissiveIntensity={0.7}
              metalness={0.85}
              roughness={0.15}
            />
          </mesh>
          {/* 3 Star Jewels on the Halo ring */}
          {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, i) => (
            <mesh
              key={i}
              geometry={starJewelGeo}
              position={[Math.cos(angle) * 0.42, 0.02, Math.sin(angle) * 0.42]}
              rotation={[0, angle, 0]}
            >
              <meshStandardMaterial
                color="#ffffff"
                emissive="#fef08a"
                emissiveIntensity={1.8}
                roughness={0.1}
              />
            </mesh>
          ))}
          <pointLight color="#fde047" intensity={1.1} distance={2.0} />
        </group>
      )}

      {/* 6. 10 Orbiting Celestial Stars */}
      <group ref={starsGroupRef}>
        {starOrbits.map((star, idx) => (
          <mesh key={idx} geometry={starJewelGeo}>
            <meshStandardMaterial
              color={star.color}
              emissive={star.color}
              emissiveIntensity={1.7}
              roughness={0.1}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

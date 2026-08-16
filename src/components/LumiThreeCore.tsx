import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type LumiMood =
  | 'happy'
  | 'loving'
  | 'starry'
  | 'playful'
  | 'tender'
  | 'ache'
  | 'curious'
  | 'sleepy'
  | 'giggle';

interface LumiThreeCoreProps {
  mood: LumiMood;
  isHovered?: boolean;
  isSpinning?: boolean;
  size?: number;
  interactiveX?: number; // Normalized -1 to 1 from mouse position
  interactiveY?: number; // Normalized -1 to 1 from mouse position
}

const MOOD_COLOR_PALETTES: Record<
  LumiMood,
  { core: number; rim: number; particles: number; light: number; speed: number }
> = {
  happy: {
    core: 0xffe89e,
    rim: 0xfbbf24,
    particles: 0xfef08a,
    light: 0xffedd5,
    speed: 1.0,
  },
  loving: {
    core: 0xffa8ba,
    rim: 0xf43f5e,
    particles: 0xfecdd3,
    light: 0xffe4e6,
    speed: 1.2,
  },
  starry: {
    core: 0x7dd3fc,
    rim: 0x0284c7,
    particles: 0xe0f2fe,
    light: 0x38bdf8,
    speed: 1.4,
  },
  playful: {
    core: 0xfde047,
    rim: 0xf59e0b,
    particles: 0xfef9c3,
    light: 0xfef08a,
    speed: 1.6,
  },
  tender: {
    core: 0xd8b4fe,
    rim: 0x9333ea,
    particles: 0xf3e8ff,
    light: 0xe9d5ff,
    speed: 0.8,
  },
  ache: {
    core: 0xa5b4fc,
    rim: 0x6366f1,
    particles: 0xc7d2fe,
    light: 0x818cf8,
    speed: 0.7,
  },
  curious: {
    core: 0x6ee7b7,
    rim: 0x059669,
    particles: 0xd1fae5,
    light: 0xa7f3d0,
    speed: 1.1,
  },
  sleepy: {
    core: 0x94a3b8,
    rim: 0x475569,
    particles: 0xcbd5e1,
    light: 0x64748b,
    speed: 0.4,
  },
  giggle: {
    core: 0xf472b6,
    rim: 0xdb2777,
    particles: 0xfce7f3,
    light: 0xfbcfe8,
    speed: 1.8,
  },
};

export const LumiThreeCore: React.FC<LumiThreeCoreProps> = ({
  mood,
  isHovered = false,
  isSpinning = false,
  size = 90,
  interactiveX = 0,
  interactiveY = 0,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const coreMeshRef = useRef<THREE.Mesh | null>(null);
  const outerSphereRef = useRef<THREE.Mesh | null>(null);
  const particlePointsRef = useRef<THREE.Points | null>(null);
  const ringPointsRef = useRef<THREE.Points | null>(null);
  const pointLightRef = useRef<THREE.PointLight | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const targetRotationRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(MOOD_COLOR_PALETTES[mood].light, 4, 10);
    pointLight.position.set(2, 2, 3);
    scene.add(pointLight);
    pointLightRef.current = pointLight;

    const fillLight = new THREE.PointLight(0xffffff, 1.5, 8);
    fillLight.position.set(-2, -1, 2);
    scene.add(fillLight);

    // 3. Central Iridescent Crystal Core Geometry
    const coreGeo = new THREE.IcosahedronGeometry(0.95, 2);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: MOOD_COLOR_PALETTES[mood].core,
      emissive: MOOD_COLOR_PALETTES[mood].rim,
      emissiveIntensity: 0.45,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.65,
      thickness: 1.2,
      ior: 1.45,
      transparent: true,
      opacity: 0.88,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);
    coreMeshRef.current = coreMesh;

    // 4. Outer Soft Wireframe Hologram Aura
    const outerGeo = new THREE.IcosahedronGeometry(1.28, 1);
    const outerMat = new THREE.MeshBasicMaterial({
      color: MOOD_COLOR_PALETTES[mood].rim,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const outerSphere = new THREE.Mesh(outerGeo, outerMat);
    scene.add(outerSphere);
    outerSphereRef.current = outerSphere;

    // 5. Orbiting Swarm of Stardust Particles (Inner cloud)
    const particleCount = 42;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 1.1 + Math.random() * 0.7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: MOOD_COLOR_PALETTES[mood].particles,
      size: 0.12,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    scene.add(particlePoints);
    particlePointsRef.current = particlePoints;

    // 6. Orbital Stardust Ring
    const ringCount = 28;
    const ringPositions = new Float32Array(ringCount * 3);
    for (let i = 0; i < ringCount; i++) {
      const angle = (i / ringCount) * Math.PI * 2;
      const r = 1.45 + (Math.random() - 0.5) * 0.15;
      ringPositions[i * 3] = Math.cos(angle) * r;
      ringPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
      ringPositions[i * 3 + 2] = Math.sin(angle) * r;
    }
    const ringGeo = new THREE.BufferGeometry();
    ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
    const ringMat = new THREE.PointsMaterial({
      color: MOOD_COLOR_PALETTES[mood].rim,
      size: 0.14,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const ringPoints = new THREE.Points(ringGeo, ringMat);
    ringPoints.rotation.x = Math.PI * 0.25;
    scene.add(ringPoints);
    ringPointsRef.current = ringPoints;

    // 7. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      const palette = MOOD_COLOR_PALETTES[mood];
      const speedMult = (palette?.speed || 1) * (isHovered ? 1.8 : 1) * (isSpinning ? 3.5 : 1);

      if (coreMeshRef.current) {
        coreMeshRef.current.rotation.y = elapsedTime * 0.45 * speedMult;
        coreMeshRef.current.rotation.x = Math.sin(elapsedTime * 0.3 * speedMult) * 0.3;

        // Interactive mouse tilt interpolation
        coreMeshRef.current.rotation.x += (targetRotationRef.current.x - coreMeshRef.current.rotation.x) * 0.08;
        coreMeshRef.current.rotation.y += (targetRotationRef.current.y - coreMeshRef.current.rotation.y) * 0.08;

        // Subtle breathing scale
        const pulse = 1 + Math.sin(elapsedTime * 2.2 * speedMult) * 0.06;
        coreMeshRef.current.scale.set(pulse, pulse, pulse);
      }

      if (outerSphereRef.current) {
        outerSphereRef.current.rotation.y = -elapsedTime * 0.35 * speedMult;
        outerSphereRef.current.rotation.z = Math.cos(elapsedTime * 0.25) * 0.2;
      }

      if (particlePointsRef.current) {
        particlePointsRef.current.rotation.y = elapsedTime * 0.25 * speedMult;
        particlePointsRef.current.rotation.x = Math.sin(elapsedTime * 0.2) * 0.15;
      }

      if (ringPointsRef.current) {
        ringPointsRef.current.rotation.z = elapsedTime * 0.5 * speedMult;
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      coreGeo.dispose();
      coreMat.dispose();
      outerGeo.dispose();
      outerMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
    };
  }, [size]);

  // Update Three.js materials dynamically when mood changes
  useEffect(() => {
    const palette = MOOD_COLOR_PALETTES[mood] || MOOD_COLOR_PALETTES.happy;

    if (coreMeshRef.current) {
      const mat = coreMeshRef.current.material as THREE.MeshPhysicalMaterial;
      mat.color.setHex(palette.core);
      mat.emissive.setHex(palette.rim);
    }
    if (outerSphereRef.current) {
      const mat = outerSphereRef.current.material as THREE.MeshBasicMaterial;
      mat.color.setHex(palette.rim);
    }
    if (particlePointsRef.current) {
      const mat = particlePointsRef.current.material as THREE.PointsMaterial;
      mat.color.setHex(palette.particles);
    }
    if (ringPointsRef.current) {
      const mat = ringPointsRef.current.material as THREE.PointsMaterial;
      mat.color.setHex(palette.rim);
    }
    if (pointLightRef.current) {
      pointLightRef.current.color.setHex(palette.light);
    }
  }, [mood]);

  // Mouse tilt tracking
  useEffect(() => {
    targetRotationRef.current = {
      x: -interactiveY * 0.5,
      y: interactiveX * 0.7,
    };
  }, [interactiveX, interactiveY]);

  return (
    <div
      ref={mountRef}
      className="relative flex items-center justify-center pointer-events-none select-none drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]"
      style={{ width: size, height: size }}
    />
  );
};

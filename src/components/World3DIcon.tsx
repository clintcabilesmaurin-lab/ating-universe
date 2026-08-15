import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface World3DIconProps {
  worldId: string;
  color: string;
  isActive?: boolean;
  isHovered?: boolean;
  size?: number;
}

export const World3DIcon: React.FC<World3DIconProps> = ({
  worldId,
  color,
  isActive = true,
  isHovered = false,
  size = 68,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(isHovered);
  isHoveredRef.current = isHovered;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 4.2;

    // 2. WebGL Renderer with Alpha transparency & antialiasing
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(new THREE.Color(color), 3.5, 12);
    pointLight1.position.set(2, 2, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 2.0, 10);
    pointLight2.position.set(-2, -1, 2);
    scene.add(pointLight2);

    // 4. Custom Distinctive 3D Celestial Geometries per World
    const group = new THREE.Group();
    scene.add(group);

    const baseColor = new THREE.Color(color);
    const darkBaseColor = new THREE.Color(isActive ? color : '#64748b');

    let coreMesh: THREE.Mesh | null = null;
    let ringMesh: THREE.Mesh | null = null;
    let innerParticleGroup: THREE.Group | null = null;

    if (worldId === 'our-first-year' || worldId === 'world-1') {
      // World 1: Cosmic Sparkle Star / Diamond Icosahedron with floating starlight cage
      const icosaGeo = new THREE.IcosahedronGeometry(1.05, 0);
      const icosaMat = new THREE.MeshStandardMaterial({
        color: darkBaseColor,
        emissive: baseColor,
        emissiveIntensity: 0.35,
        roughness: 0.2,
        metalness: 0.8,
        flatShading: true,
      });
      coreMesh = new THREE.Mesh(icosaGeo, icosaMat);
      group.add(coreMesh);

      // Wireframe overlay cage
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.6,
      });
      const wireMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 0), wireMat);
      group.add(wireMesh);

      // Orbiting Sparkle satellites
      const ringGeo = new THREE.TorusGeometry(1.5, 0.04, 16, 48);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: baseColor,
        emissiveIntensity: 0.6,
        roughness: 0.1,
      });
      ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 3;
      group.add(ringMesh);
    } else if (worldId === 'memory-gallery' || worldId === 'world-2') {
      // World 2: Galeriya ng Alaala - Torus Knot Crystal with Floating Frame Rings
      const knotGeo = new THREE.TorusKnotGeometry(0.7, 0.24, 64, 16);
      const knotMat = new THREE.MeshStandardMaterial({
        color: darkBaseColor,
        emissive: baseColor,
        emissiveIntensity: 0.4,
        roughness: 0.25,
        metalness: 0.75,
      });
      coreMesh = new THREE.Mesh(knotGeo, knotMat);
      group.add(coreMesh);

      // Outer Halo Ring
      const ringGeo = new THREE.TorusGeometry(1.45, 0.045, 16, 48);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: baseColor,
        emissiveIntensity: 0.7,
      });
      ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 4;
      ringMesh.rotation.y = Math.PI / 6;
      group.add(ringMesh);
    } else if (worldId === 'letters' || worldId === 'world-3') {
      // World 3: Liham ng Pag-ibig - Octahedron Love Gem / Prismatic Heart Crystal
      const octaGeo = new THREE.OctahedronGeometry(1.1, 0);
      const octaMat = new THREE.MeshStandardMaterial({
        color: darkBaseColor,
        emissive: baseColor,
        emissiveIntensity: 0.45,
        roughness: 0.15,
        metalness: 0.85,
        flatShading: true,
      });
      coreMesh = new THREE.Mesh(octaGeo, octaMat);
      group.add(coreMesh);

      // Nested Dodecahedron Shroud
      const dMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
      });
      const dMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(1.35, 0), dMat);
      group.add(dMesh);

      // Pulsing Celestial Ring
      const ringGeo = new THREE.TorusGeometry(1.6, 0.035, 16, 48);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xffa0b5,
        emissive: baseColor,
        emissiveIntensity: 0.8,
      });
      ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2.5;
      group.add(ringMesh);
    } else {
      // World 4 & others: Celestial Planet Sphere with Gyroscope Rings
      const sphereGeo = new THREE.SphereGeometry(0.85, 32, 32);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: darkBaseColor,
        emissive: baseColor,
        emissiveIntensity: 0.35,
        roughness: 0.3,
        metalness: 0.6,
      });
      coreMesh = new THREE.Mesh(sphereGeo, sphereMat);
      group.add(coreMesh);

      // Outer Dual Gyro Rings
      const ring1Geo = new THREE.TorusGeometry(1.35, 0.04, 16, 48);
      const ringMat1 = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: baseColor,
        emissiveIntensity: 0.6,
      });
      ringMesh = new THREE.Mesh(ring1Geo, ringMat1);
      ringMesh.rotation.x = Math.PI / 3;
      group.add(ringMesh);

      const ring2Geo = new THREE.TorusGeometry(1.5, 0.03, 16, 48);
      const ring2Mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.4,
      });
      const ring2Mesh = new THREE.Mesh(ring2Geo, ring22Mat(ring2Mat));
      ring2Mesh.rotation.y = Math.PI / 3;
      group.add(ring2Mesh);
    }

    function ring22Mat(m: THREE.Material) {
      return m;
    }

    // 5. Orbiting Stardust Particles inside group
    innerParticleGroup = new THREE.Group();
    const pGeo = new THREE.BufferGeometry();
    const pCount = 18;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 1.35 + Math.random() * 0.4;
      pPos[i] = r * Math.sin(phi) * Math.cos(theta);
      pPos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPos[i + 2] = r * Math.cos(phi);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.07,
      transparent: true,
      opacity: 0.85,
    });
    const particles = new THREE.Points(pGeo, pMat);
    innerParticleGroup.add(particles);
    group.add(innerParticleGroup);

    // 6. Animation Loop with standard timestamp delta
    let animId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      const speedMultiplier = isHoveredRef.current ? 2.5 : 1.0;

      // Rotate group and elements smoothly
      group.rotation.y += delta * 0.65 * speedMultiplier;
      group.rotation.x += delta * 0.35 * speedMultiplier;

      if (ringMesh) {
        ringMesh.rotation.z += delta * 0.8 * speedMultiplier;
      }
      if (innerParticleGroup) {
        innerParticleGroup.rotation.y -= delta * 0.45 * speedMultiplier;
      }

      // Breathing scale on hover
      const targetScale = isHoveredRef.current ? 1.18 : 1.0;
      group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [worldId, color, isActive, size]);

  return (
    <div
      ref={mountRef}
      className="relative flex items-center justify-center pointer-events-none select-none drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
      style={{ width: size, height: size }}
    />
  );
};

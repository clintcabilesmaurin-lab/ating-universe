import * as THREE from 'three';

/**
 * Generates a cute 3D Ghost Body geometry with a rounded dome head,
 * smooth bell skirt, and scalloped wavy ripples at the hem.
 */
export function createGhostBodyGeometry(
  radiusTop = 0.82,
  radiusBottom = 0.96,
  height = 1.6,
  radialSegments = 48,
  heightSegments = 36,
  waves = 6,
  waveAmplitude = 0.12
): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Generate vertices row by row from top pole (y = +height/2) to bottom hem (y = -height/2)
  for (let yIndex = 0; yIndex <= heightSegments; yIndex++) {
    const v = yIndex / heightSegments; // 0 (top) to 1 (bottom)
    let y = 0;
    let r = 0;

    if (v <= 0.45) {
      // Top hemisphere dome
      const domeV = v / 0.45; // 0 to 1
      const theta = domeV * (Math.PI / 2); // 0 (top pole) to PI/2 (equator)
      y = (height / 2) - (1 - Math.cos(theta)) * radiusTop;
      r = Math.sin(theta) * radiusTop;
    } else {
      // Flaring ghost skirt with bottom wavy scallops
      const skirtV = (v - 0.45) / 0.55; // 0 to 1
      y = (height / 2) - radiusTop - skirtV * (height - radiusTop);
      const baseR = THREE.MathUtils.lerp(radiusTop, radiusBottom, skirtV);
      r = baseR;
    }

    for (let xIndex = 0; xIndex <= radialSegments; xIndex++) {
      const u = xIndex / radialSegments;
      const phi = u * Math.PI * 2;

      // Add wavy scallops at the bottom hem
      let finalR = r;
      let finalY = y;
      if (v > 0.65) {
        const waveFactor = (v - 0.65) / 0.35;
        const wave = Math.sin(phi * waves);
        finalR += wave * waveAmplitude * waveFactor;
        finalY += Math.cos(phi * waves) * (waveAmplitude * 0.6) * waveFactor;
      }

      const x = Math.sin(phi) * finalR;
      const z = Math.cos(phi) * finalR;

      positions.push(x, finalY, z);
      uvs.push(u, 1 - v);
    }
  }

  // Generate face indices
  for (let yIndex = 0; yIndex < heightSegments; yIndex++) {
    for (let xIndex = 0; xIndex < radialSegments; xIndex++) {
      const first = yIndex * (radialSegments + 1) + xIndex;
      const second = first + radialSegments + 1;

      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  return geo;
}

import * as THREE from 'three';

/**
 * Generates a curved plane geometry that wraps smoothly over the front of the ghost head.
 * Prevents Z-fighting while maintaining the 3D contour for the 2D facial decal.
 */
export function createCurvedFaceGeometry(
  width = 1.05,
  height = 0.95,
  sphereRadius = 0.85,
  widthSegments = 32,
  heightSegments = 32
): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
  const posAttr = geo.attributes.position;
  const count = posAttr.count;

  for (let i = 0; i < count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const rSq = x * x + y * y;

    if (rSq < sphereRadius * sphereRadius) {
      // Spherical curvature offset: curve backwards from apex
      const zCurvature = Math.sqrt(sphereRadius * sphereRadius - rSq) - sphereRadius;
      posAttr.setZ(i, zCurvature);
    } else {
      posAttr.setZ(i, -0.22);
    }
  }

  geo.computeVertexNormals();
  return geo;
}

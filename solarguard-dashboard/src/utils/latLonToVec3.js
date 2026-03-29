import * as THREE from 'three'

export function latLonToVec3(lat, lon, radius = 1.0) {
  // Convert latitude to phi (0 at North Pole, PI at South Pole)
  const phi = (90 - lat) * (Math.PI / 180);
  
  // Convert longitude to radians
  const theta = lon * (Math.PI / 180);

  // Empirically derived Native Mapping for earth-blue-marble.jpg on ThreeJS SphereGeometry:
  // visually, Prime Meridian (0°) is baked at +X. East (+90°) is baked at -Z.
  // This absolute coordinate mapping enforces pixel-perfect alignment globally.
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const z = -radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  
  return new THREE.Vector3(x, y, z);
}

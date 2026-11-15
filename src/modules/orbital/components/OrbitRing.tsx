import { useMemo } from 'react';
import * as THREE from 'three';
import { orbitalPosition } from '../../../lib/orbitalMath';

interface OrbitRingProps {
  altitudeKm: number;
  inclinationDeg: number;
  color?: string;
}

export function OrbitRing({ altitudeKm, inclinationDeg, color = '#2c5f7a' }: OrbitRingProps) {
  const geometry = useMemo(() => {
    const point = { x: 0, y: 0, z: 0 };
    const points: THREE.Vector3[] = [];
    for (let angle = 0; angle <= 360; angle += 3) {
      orbitalPosition(point, altitudeKm, inclinationDeg, 0, angle);
      points.push(new THREE.Vector3(point.x, point.y, point.z));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [altitudeKm, inclinationDeg]);

  return (
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial color={color} transparent opacity={0.45} />
    </line>
  );
}

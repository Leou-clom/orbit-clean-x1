import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { OrbitalRenderData } from '../types';
import { currentAngleDeg, orbitalPosition } from '../../../lib/orbitalMath';
import { sceneClock } from '../../../lib/sceneClock';

interface TargetMarkerProps {
  target: OrbitalRenderData | null;
  inRange: boolean;
}

const point = { x: 0, y: 0, z: 0 };

export function TargetMarker({ target, inRange }: TargetMarkerProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ camera }) => {
    const group = groupRef.current;
    if (!group || !target) return;

    const angle = currentAngleDeg(target.phaseDeg, target.altitudeKm, sceneClock.seconds);
    orbitalPosition(point, target.altitudeKm, target.inclinationDeg, target.raanDeg, angle);
    group.position.set(point.x, point.y, point.z);
    group.lookAt(camera.position);
    const pulse = 1 + Math.sin(performance.now() / 180) * 0.12;
    group.scale.setScalar(pulse);
  });

  if (!target) return null;

  return (
    <group ref={groupRef}>
      <mesh>
        <ringGeometry args={[target.sizeUnits * 2.4, target.sizeUnits * 2.9, 32]} />
        <meshBasicMaterial color={inRange ? '#4ade80' : '#fb923c'} transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

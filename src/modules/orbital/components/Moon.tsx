import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { kmToUnits } from '../../../lib/orbitalMath';
import { sceneClock } from '../../../lib/sceneClock';

// Distancia real (~60 radios terrestres, que es justamente la lección). El radio va aumentado ×4
// como el resto de objetos de la escena: a tamaño real sería un punto de 7 px imposible de ver.
const MOON_SIZE_EXAGGERATION = 10;
const MOON_DISTANCE_UNITS = kmToUnits(384400);
const MOON_RADIUS_UNITS = kmToUnits(1737) * MOON_SIZE_EXAGGERATION;
const MOON_PERIOD_SECONDS = 27.32 * 86400;
const MOON_INCLINATION = (5.14 * Math.PI) / 180;

export function Moon() {
  const groupRef = useRef<THREE.Group>(null);
  const surface = useTexture('/textures/moon_1024.jpg');

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    const angle = (sceneClock.seconds / MOON_PERIOD_SECONDS) * Math.PI * 2;
    group.position.set(
      Math.cos(angle) * MOON_DISTANCE_UNITS,
      Math.sin(angle) * Math.sin(MOON_INCLINATION) * MOON_DISTANCE_UNITS,
      Math.sin(angle) * MOON_DISTANCE_UNITS
    );
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[MOON_RADIUS_UNITS, 32, 24]} />
        <meshStandardMaterial map={surface} roughness={1} metalness={0} />
      </mesh>
      <mesh>
        <sphereGeometry args={[MOON_RADIUS_UNITS * 1.08, 16, 16]} />
        <meshBasicMaterial color="#e8e6e0" transparent opacity={0.14} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

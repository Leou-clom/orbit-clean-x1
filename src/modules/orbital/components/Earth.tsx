import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { EARTH_RADIUS_UNITS } from '../../../lib/orbitalMath';

interface EarthProps {
  detailed: boolean;
}

export function Earth({ detailed }: EarthProps) {
  const surfaceRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const gridRef = useRef<THREE.Mesh>(null);

  const [surface, clouds] = useTexture([
    '/textures/earth_atmos_2048.jpg',
    '/textures/earth_clouds_1024.png',
  ]);

  useFrame((_, delta) => {
    if (surfaceRef.current) surfaceRef.current.rotation.y += delta * 0.012;
    if (gridRef.current) gridRef.current.rotation.y += delta * 0.012;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.018;
  });

  const radius = EARTH_RADIUS_UNITS;

  return (
    <group>
      <mesh ref={surfaceRef}>
        <sphereGeometry args={[radius, detailed ? 64 : 32, detailed ? 48 : 24]} />
        {/* Emisivo bajo: sin esto el lado nocturno queda negro y media órbita se juega a ciegas. */}
        <meshStandardMaterial
          map={surface}
          emissiveMap={surface}
          emissive="#ffffff"
          emissiveIntensity={0.16}
          roughness={0.92}
          metalness={0.02}
        />
      </mesh>

      {detailed ? (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[radius * 1.008, 48, 32]} />
          <meshStandardMaterial map={clouds} transparent opacity={0.42} depthWrite={false} />
        </mesh>
      ) : null}

      {/* Retícula del centro de control, el estilo que el equipo aprobó para el dashboard. */}
      <mesh ref={gridRef}>
        <sphereGeometry args={[radius * 1.012, 24, 16]} />
        <meshBasicMaterial color="#4fd1ff" wireframe transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PLANET_TEXTURES, createBandedTexture } from '../lib/planetTextures';

// Telón de fondo: el Sol está a 1 UA y Júpiter a más de 4, distancias que quedan muy por detrás
// del plano lejano de la cámara. Se colocan a una distancia fija de fondo, sin escala real, solo
// para dar referencia visual del sistema solar. La Luna sí conserva su distancia real.
const BACKDROP_DISTANCE = 420;

interface DistantBody {
  name: string;
  color: string;
  radius: number;
  direction: [number, number, number];
  emissive: number;
  tilt: number;
  rings?: boolean;
}

const BODIES: DistantBody[] = [
  { name: 'Venus', color: '#e8d8a8', radius: 2.4, direction: [-0.75, 0.22, 0.62], emissive: 0.5, tilt: 0.05 },
  { name: 'Marte', color: '#c1583a', radius: 2.0, direction: [0.35, 0.42, -0.84], emissive: 0.35, tilt: 0.44 },
  { name: 'Júpiter', color: '#d7b08c', radius: 5.2, direction: [-0.42, -0.35, -0.84], emissive: 0.3, tilt: 0.05 },
  { name: 'Saturno', color: '#d9c48f', radius: 4.2, direction: [0.88, -0.18, 0.44], emissive: 0.3, tilt: 0.47, rings: true },
];

function normalize(direction: [number, number, number]): [number, number, number] {
  const [x, y, z] = direction;
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
}

export function DistantBodies() {
  const sunGlowRef = useRef<THREE.Mesh>(null);

  const textures = useMemo(() => {
    const map = new Map<string, THREE.CanvasTexture>();
    for (const [name, options] of Object.entries(PLANET_TEXTURES)) {
      map.set(name, createBandedTexture(options));
    }
    return map;
  }, []);

  useEffect(
    () => () => {
      for (const texture of textures.values()) texture.dispose();
    },
    [textures]
  );

  useFrame(() => {
    const glow = sunGlowRef.current;
    if (!glow) return;
    glow.scale.setScalar(1 + Math.sin(performance.now() / 1400) * 0.03);
  });

  const sunDirection = normalize([0.62, 0.38, 0.69]);

  return (
    <group>
      <group
        position={[
          sunDirection[0] * BACKDROP_DISTANCE,
          sunDirection[1] * BACKDROP_DISTANCE,
          sunDirection[2] * BACKDROP_DISTANCE,
        ]}
      >
        <mesh>
          <sphereGeometry args={[13, 24, 24]} />
          <meshBasicMaterial color="#fff6d8" toneMapped={false} />
        </mesh>
        <mesh ref={sunGlowRef}>
          <sphereGeometry args={[22, 20, 20]} />
          <meshBasicMaterial color="#ffd27a" transparent opacity={0.22} side={THREE.BackSide} />
        </mesh>
        <mesh>
          <sphereGeometry args={[34, 16, 16]} />
          <meshBasicMaterial color="#ffb347" transparent opacity={0.09} side={THREE.BackSide} />
        </mesh>
      </group>

      {BODIES.map((body) => {
        const direction = normalize(body.direction);
        const texture = textures.get(body.name);
        return (
          <group
            key={body.name}
            position={[
              direction[0] * BACKDROP_DISTANCE,
              direction[1] * BACKDROP_DISTANCE,
              direction[2] * BACKDROP_DISTANCE,
            ]}
            rotation={[0, 0, body.tilt]}
          >
            <mesh>
              <sphereGeometry args={[body.radius, 24, 20]} />
              <meshStandardMaterial
                map={texture}
                color={texture ? '#ffffff' : body.color}
                emissive={body.color}
                emissiveIntensity={body.emissive}
                roughness={1}
              />
            </mesh>
            {body.rings ? (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[body.radius * 1.5, body.radius * 2.3, 48]} />
                <meshBasicMaterial
                  color="#e4d3a6"
                  transparent
                  opacity={0.55}
                  side={THREE.DoubleSide}
                />
              </mesh>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}

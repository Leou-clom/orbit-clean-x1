import { useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { STATION_SIZE_UNITS } from '../lib/constants';
import { orbitalPosition } from '../../../lib/orbitalMath';
import { liveStation } from '../../../lib/stationState';
import { mulberry32 } from '../../../lib/random';

interface WreckProps {
  positionRef: RefObject<THREE.Vector3>;
  /** performance.now() del instante en que el casco llegó a 0. */
  startedAt: number;
}

const PIECE_COUNT = 18;
const FLASH_SECONDS = 0.55;
const WAVE_SECONDS = 1.1;

const here = { x: 0, y: 0, z: 0 };

/** Astronauta de geometría propia: no usamos el modelo de NASA porque su licencia es de un tercero. */
function Astronaut({ size }: { size: number }) {
  const s = size;
  return (
    <group>
      {/* mochila de soporte vital */}
      <mesh position={[0, 0, -s * 0.34]}>
        <boxGeometry args={[s * 0.44, s * 0.5, s * 0.22]} />
        <meshStandardMaterial color="#9a9a9a" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* torso */}
      <mesh>
        <capsuleGeometry args={[s * 0.26, s * 0.34, 4, 10]} />
        <meshStandardMaterial color="#f2f2f2" metalness={0.1} roughness={0.85} />
      </mesh>
      {/* casco */}
      <mesh position={[0, s * 0.52, 0]}>
        <sphereGeometry args={[s * 0.3, 14, 14]} />
        <meshStandardMaterial color="#fafafa" metalness={0.2} roughness={0.5} />
      </mesh>
      {/* visor */}
      <mesh position={[0, s * 0.52, s * 0.19]}>
        <sphereGeometry args={[s * 0.22, 12, 12]} />
        <meshStandardMaterial color="#141414" metalness={0.9} roughness={0.15} />
      </mesh>
      {/* brazos, abiertos como si flotara sin control */}
      {[-1, 1].map((side) => (
        <mesh
          key={`arm${side}`}
          position={[side * s * 0.34, s * 0.12, 0]}
          rotation={[0, 0, side * 0.9]}
        >
          <capsuleGeometry args={[s * 0.1, s * 0.34, 4, 8]} />
          <meshStandardMaterial color="#e8e8e8" metalness={0.1} roughness={0.85} />
        </mesh>
      ))}
      {/* piernas */}
      {[-1, 1].map((side) => (
        <mesh
          key={`leg${side}`}
          position={[side * s * 0.15, -s * 0.52, 0]}
          rotation={[0.25, 0, side * 0.2]}
        >
          <capsuleGeometry args={[s * 0.12, s * 0.38, 4, 8]} />
          <meshStandardMaterial color="#e2e2e2" metalness={0.1} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

export function Wreck({ positionRef, startedAt }: WreckProps) {
  const groupRef = useRef<THREE.Group>(null);
  const flashRef = useRef<THREE.Mesh>(null);
  const waveRef = useRef<THREE.Mesh>(null);
  const piecesRef = useRef<THREE.Group>(null);
  const astronautRef = useRef<THREE.Group>(null);

  const s = STATION_SIZE_UNITS;

  // Direcciones y giros fijos por pieza: deterministas, para que la escena no parpadee al repintar.
  const pieces = useMemo(() => {
    const rng = mulberry32(90125);
    return Array.from({ length: PIECE_COUNT }, () => {
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(rng() * 2 - 1);
      return {
        dir: new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta),
          Math.sin(phi) * Math.sin(theta),
          Math.cos(phi)
        ),
        speed: 0.5 + rng() * 1.3,
        scale: 0.1 + rng() * 0.3,
        spin: new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).multiplyScalar(2.6),
        long: rng() > 0.6,
      };
    });
  }, []);

  // El astronauta sale despedido hacia un lado y gira despacio sobre sí mismo.
  const astronautDir = useMemo(() => new THREE.Vector3(0.62, 0.52, -0.58).normalize(), []);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    // El pecio sigue en la órbita donde quedó la nave.
    const { altitudeKm, inclinationDeg, raanDeg, angleDeg } = liveStation;
    orbitalPosition(here, altitudeKm, inclinationDeg, raanDeg, angleDeg);
    group.position.set(here.x, here.y, here.z);
    positionRef.current?.set(here.x, here.y, here.z);

    const t = Math.max(0, (performance.now() - startedAt) / 1000);

    // Destello: crece deprisa y se apaga.
    const flash = flashRef.current;
    if (flash) {
      const k = Math.min(1, t / FLASH_SECONDS);
      const scale = 0.3 + k * 4.2;
      flash.scale.setScalar(scale);
      const mat = flash.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 1 - k) * 0.95;
      flash.visible = k < 1;
    }

    // Onda expansiva: un anillo que se abre y se desvanece.
    const wave = waveRef.current;
    if (wave) {
      const k = Math.min(1, t / WAVE_SECONDS);
      wave.scale.setScalar(0.2 + k * 9);
      const mat = wave.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 1 - k) * 0.5;
      wave.visible = k < 1;
      wave.rotation.z += 0.004;
    }

    // Fragmentos: salen disparados y frenan poco a poco, como basura a la deriva.
    const group2 = piecesRef.current;
    if (group2) {
      // Avance que se satura: rápido al principio, casi detenido al final.
      const travel = (1 - Math.exp(-t * 0.85)) * s * 7;
      for (let i = 0; i < group2.children.length; i += 1) {
        const child = group2.children[i];
        const p = pieces[i];
        const d = travel * p.speed;
        child.position.set(p.dir.x * d, p.dir.y * d, p.dir.z * d);
        child.rotation.x = p.spin.x * t;
        child.rotation.y = p.spin.y * t;
        child.rotation.z = p.spin.z * t;
      }
    }

    // Astronauta: se aleja despacio y da vueltas sobre sí mismo, sin control.
    const astro = astronautRef.current;
    if (astro) {
      const d = (1 - Math.exp(-t * 0.55)) * s * 5.5;
      astro.position.set(astronautDir.x * d, astronautDir.y * d, astronautDir.z * d);
      astro.rotation.x = t * 0.5;
      astro.rotation.y = t * 0.34;
      astro.rotation.z = Math.sin(t * 0.7) * 0.4;
    }
  });

  return (
    <group ref={groupRef}>
      {/* núcleo de la explosión */}
      <mesh ref={flashRef}>
        <sphereGeometry args={[s * 0.6, 16, 16]} />
        <meshBasicMaterial
          color="#ffd9a0"
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* onda expansiva */}
      <mesh ref={waveRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[s * 0.5, s * 0.62, 36]} />
        <meshBasicMaterial
          color="#ffb46b"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* restos del casco convertidos en basura espacial */}
      <group ref={piecesRef}>
        {pieces.map((p, i) => (
          <mesh key={i}>
            {p.long ? (
              <boxGeometry args={[s * p.scale * 0.5, s * p.scale * 0.5, s * p.scale * 2.1]} />
            ) : (
              <boxGeometry args={[s * p.scale, s * p.scale * 0.8, s * p.scale * 1.2]} />
            )}
            <meshStandardMaterial
              color={i % 3 === 0 ? '#8a8a8a' : i % 3 === 1 ? '#bdbdbd' : '#5e5e5e'}
              metalness={0.75}
              roughness={0.45}
            />
          </mesh>
        ))}
      </group>

      {/* el astronauta, a la deriva */}
      <group ref={astronautRef}>
        <Astronaut size={s} />
      </group>
    </group>
  );
}

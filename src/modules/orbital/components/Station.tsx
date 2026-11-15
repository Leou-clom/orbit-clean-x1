import { Suspense, useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { CaptureEvent } from '../types';
import { STATION_SIZE_UNITS } from '../lib/constants';
import { currentAngleDeg, orbitalPosition } from '../../../lib/orbitalMath';
import { sceneClock } from '../../../lib/sceneClock';
import { liveStation } from '../../../lib/stationState';

interface StationProps {
  positionRef: RefObject<THREE.Vector3>;
  capture: CaptureEvent | null;
  detailed: boolean;
}

// Casco de la nave recolectora con el modelo Dawn de NASA 3D Resources. El brazo robótico sigue
// siendo geometría propia porque se anima durante la captura.
function DetailedHull({ size }: { size: number }) {
  const { scene } = useGLTF('/models/dawn.glb');

  const model = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const span = box.getSize(new THREE.Vector3()).length() || 1;
    clone.scale.setScalar((size * 3.2) / span);
    const center = box.getCenter(new THREE.Vector3()).multiplyScalar((size * 3.2) / span);
    clone.position.sub(center);
    return clone;
  }, [scene, size]);

  return <primitive object={model} />;
}

function SimpleHull({ size }: { size: number }) {
  const s = size;
  return (
    <group>
      <mesh>
        <boxGeometry args={[s * 0.3, s * 0.3, s * 1.5]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, s * 0.55]}>
        <cylinderGeometry args={[s * 0.26, s * 0.26, s * 0.8, 10]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, -s * 0.55]}>
        <cylinderGeometry args={[s * 0.24, s * 0.24, s * 0.7, 10]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.4} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * s * 0.95, 0, 0]}>
          <mesh>
            <boxGeometry args={[s * 1.5, s * 0.02, s * 0.7]} />
            <meshStandardMaterial color="#1d4ed8" emissive="#1e3a8a" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0, 0, s * 0.8]}>
            <boxGeometry args={[s * 1.5, s * 0.02, s * 0.7]} />
            <meshStandardMaterial color="#1d4ed8" emissive="#1e3a8a" emissiveIntensity={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const CAPTURE_DURATION_MS = 900;

const here = { x: 0, y: 0, z: 0 };
const ahead = { x: 0, y: 0, z: 0 };
const targetPoint = { x: 0, y: 0, z: 0 };
const forward = new THREE.Vector3();
const armTarget = new THREE.Vector3();

export function Station({ positionRef, capture, detailed }: StationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const armRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    const { altitudeKm, inclinationDeg, raanDeg, angleDeg } = liveStation;
    orbitalPosition(here, altitudeKm, inclinationDeg, raanDeg, angleDeg);
    orbitalPosition(ahead, altitudeKm, inclinationDeg, raanDeg, angleDeg + 0.6);

    group.position.set(here.x, here.y, here.z);
    positionRef.current?.set(here.x, here.y, here.z);

    forward.set(ahead.x, ahead.y, ahead.z);
    group.lookAt(forward);

    const arm = armRef.current;
    if (!arm) return;

    let extension = 0.25;
    if (capture) {
      const elapsed = (performance.now() - capture.at) / CAPTURE_DURATION_MS;
      if (elapsed < 1) {
        extension = 0.25 + Math.sin(elapsed * Math.PI) * 1.5;
        const captureAngle = currentAngleDeg(capture.object.phaseDeg, capture.object.altitudeKm, sceneClock.seconds);
        orbitalPosition(
          targetPoint,
          capture.object.altitudeKm,
          capture.object.inclinationDeg,
          capture.object.raanDeg,
          captureAngle
        );
        armTarget.set(targetPoint.x, targetPoint.y, targetPoint.z);
        arm.lookAt(armTarget);
      }
    }
    arm.scale.z += (extension - arm.scale.z) * 0.25;
  });

  const s = STATION_SIZE_UNITS;

  return (
    <group ref={groupRef}>
      {detailed ? (
        <Suspense fallback={<SimpleHull size={s} />}>
          <DetailedHull size={s} />
        </Suspense>
      ) : (
        <SimpleHull size={s} />
      )}

      <mesh position={[0, s * 0.3, 0]}>
        <sphereGeometry args={[s * 0.14, 10, 10]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={1.4} />
      </mesh>

      <group ref={armRef} position={[0, -s * 0.2, s * 0.3]}>
        <mesh position={[0, 0, s * 0.5]}>
          <boxGeometry args={[s * 0.09, s * 0.09, s * 1]} />
          <meshStandardMaterial color="#f97316" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, s * 1.05]}>
          <boxGeometry args={[s * 0.16, s * 0.16, s * 0.14]} />
          <meshStandardMaterial color="#fb923c" emissive="#ea580c" emissiveIntensity={0.7} />
        </mesh>
      </group>
    </group>
  );
}

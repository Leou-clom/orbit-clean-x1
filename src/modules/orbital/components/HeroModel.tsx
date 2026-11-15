import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitalRenderData } from '../types';
import { currentAngleDeg, orbitalPosition } from '../../../lib/orbitalMath';
import { sceneClock } from '../../../lib/sceneClock';

// Modelos reales de NASA 3D Resources. Se cargan solo para el objeto que el jugador tiene fijado:
// un objeto detallado en pantalla es barato, seiscientos no lo serían.
const MODEL_BY_TYPE: Partial<Record<string, string>> = {
  satellite: '/models/clementine.glb',
};

const point = { x: 0, y: 0, z: 0 };

interface HeroModelProps {
  target: OrbitalRenderData;
}

function Model({ target, url }: HeroModelProps & { url: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3()).length() || 1;
    clone.scale.setScalar(1 / size);
    const center = box.getCenter(new THREE.Vector3()).multiplyScalar(1 / size);
    clone.position.sub(center);
    return clone;
  }, [scene]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    const angle = currentAngleDeg(target.phaseDeg, target.altitudeKm, sceneClock.seconds);
    orbitalPosition(point, target.altitudeKm, target.inclinationDeg, target.raanDeg, angle);
    group.position.set(point.x, point.y, point.z);
    group.rotation.y = target.spinY + angle * 0.02;
  });

  const scale = target.sizeUnits * 7;

  return (
    <group ref={groupRef} scale={scale}>
      <primitive object={model} />
    </group>
  );
}

export function HeroModel({ target }: HeroModelProps) {
  const url = MODEL_BY_TYPE[target.type];
  useEffect(() => {
    if (url) useGLTF.preload(url);
  }, [url]);

  if (!url) return null;

  return (
    <Suspense fallback={null}>
      <Model target={target} url={url} />
    </Suspense>
  );
}

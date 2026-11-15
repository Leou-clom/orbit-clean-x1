import { useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import {
  CAMERA_FOLLOW_MAX_DISTANCE,
  CAMERA_FOLLOW_MIN_DISTANCE,
  CAMERA_FREE_MAX_DISTANCE,
  CAMERA_FREE_MIN_DISTANCE,
} from '../lib/constants';
import { EARTH_RADIUS_UNITS, TIME_SCALE } from '../../../lib/orbitalMath';
import { sceneClock } from '../../../lib/sceneClock';

interface SceneRigProps {
  follow: boolean;
  stationPositionRef: RefObject<THREE.Vector3>;
}

const MIN_CAMERA_RADIUS = EARTH_RADIUS_UNITS * 1.01;

const previous = new THREE.Vector3();
const delta = new THREE.Vector3();

export function SceneRig({ follow, stationPositionRef }: SceneRigProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const wasFollowing = useRef(false);
  const camera = useThree((state) => state.camera);

  useFrame((_, frameDelta) => {
    if (sceneClock.running) sceneClock.seconds += frameDelta * TIME_SCALE;

    const controls = controlsRef.current;
    const station = stationPositionRef.current;
    if (!controls || !station) return;

    if (!follow) {
      wasFollowing.current = false;
      return;
    }

    if (!wasFollowing.current) {
      wasFollowing.current = true;
      previous.copy(station);
      camera.position.set(station.x + 0.35, station.y + 0.22, station.z + 0.35);
    }

    delta.subVectors(station, previous);
    camera.position.add(delta);
    controls.target.copy(station);
    previous.copy(station);

    // La cámara no debe entrar en la Tierra, pero empujarla de golpe se siente como chocar con una
    // pared invisible: se corrige de forma progresiva para que el giro siga siendo suave.
    const depth = camera.position.length();
    if (depth < MIN_CAMERA_RADIUS) {
      const corrected = MIN_CAMERA_RADIUS / Math.max(depth, 0.0001);
      camera.position.multiplyScalar(1 + (corrected - 1) * 0.12);
    }

    controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={false}
      minDistance={follow ? CAMERA_FOLLOW_MIN_DISTANCE : CAMERA_FREE_MIN_DISTANCE}
      maxDistance={follow ? CAMERA_FOLLOW_MAX_DISTANCE : CAMERA_FREE_MAX_DISTANCE}
    />
  );
}

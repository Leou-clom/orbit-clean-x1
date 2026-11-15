import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { DebrisObjectType } from '../../../types/orbital';
import type { OrbitalRenderData } from '../types';
import { createDebrisGeometries } from '../lib/debrisGeometries';
import { currentAngleDeg, orbitalPosition } from '../../../lib/orbitalMath';
import { sceneClock } from '../../../lib/sceneClock';

interface DebrisFieldProps {
  items: OrbitalRenderData[];
  targetIds: Set<string>;
  selectedObjectId: string | null;
  onSelectObject: (id: string) => void;
}

const TYPES: DebrisObjectType[] = ['debris', 'satellite', 'rocket_body', 'asteroid', 'unknown'];

const dummy = new THREE.Object3D();
const color = new THREE.Color();
const highlight = new THREE.Color('#ffffff');
const position = { x: 0, y: 0, z: 0 };

interface TypeGroupProps {
  type: DebrisObjectType;
  geometry: THREE.BufferGeometry;
  items: OrbitalRenderData[];
  targetIds: Set<string>;
  selectedObjectId: string | null;
  onSelectObject: (id: string) => void;
}

function TypeGroup({ type, geometry, items, targetIds, selectedObjectId, onSelectObject }: TypeGroupProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const indexToId = useRef<string[]>([]);
  // Holgura fija: la nube de fragmentos de cada misión se suma a la población base, y reasignar el
  // buffer de instancias a mitad de partida provoca un parpadeo del campo.
  const [capacity] = useState(() => Math.max(items.length, 1) + 160);

  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.75, metalness: 0.15, toneMapped: false, flatShading: true }),
    []
  );

  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 15);
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < Math.min(items.length, capacity); i++) {
      const item = items[i];
      color.set(item.colorHex);
      if (targetIds.has(item.id)) color.lerp(highlight, 0.25).multiplyScalar(1.9);
      else color.multiplyScalar(0.6);
      mesh.setColorAt(i, color);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [items, targetIds, capacity]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const time = sceneClock.seconds;
    const pulse = 1 + Math.sin(performance.now() / 160) * 0.35;
    const drawn = Math.min(items.length, capacity);
    const ids = indexToId.current;
    ids.length = drawn;

    for (let i = 0; i < drawn; i++) {
      const item = items[i];
      ids[i] = item.id;

      const angle = currentAngleDeg(item.phaseDeg, item.altitudeKm, time);
      orbitalPosition(position, item.altitudeKm, item.inclinationDeg, item.raanDeg, angle);

      const isTarget = targetIds.has(item.id);
      const isSelected = item.id === selectedObjectId;
      const scale = item.sizeUnits * (isTarget ? 1.7 : 1) * (isSelected ? pulse * 1.6 : 1);

      dummy.position.set(position.x, position.y, position.z);
      dummy.scale.setScalar(scale);
      dummy.rotation.set(item.spinX + angle * 0.02, item.spinY + angle * 0.03, item.spinZ);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.count = drawn;
    mesh.instanceMatrix.needsUpdate = true;
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (event.instanceId === undefined) return;
    const id = indexToId.current[event.instanceId];
    if (!id) return;
    event.stopPropagation();
    onSelectObject(id);
  };

  if (items.length === 0) return null;

  return (
    <instancedMesh
      key={`${type}-${capacity}`}
      ref={meshRef}
      args={[geometry, material, capacity]}
      onClick={handleClick}
      frustumCulled={false}
    />
  );
}

function DebrisFieldImpl({ items, targetIds, selectedObjectId, onSelectObject }: DebrisFieldProps) {
  const geometries = useMemo(() => createDebrisGeometries(), []);

  useEffect(
    () => () => {
      for (const geometry of Object.values(geometries)) geometry.dispose();
    },
    [geometries]
  );

  const byType = useMemo(() => {
    const groups = new Map<DebrisObjectType, OrbitalRenderData[]>();
    for (const type of TYPES) groups.set(type, []);
    for (const item of items) groups.get(item.type)?.push(item);
    return groups;
  }, [items]);

  return (
    <group>
      {TYPES.map((type) => (
        <TypeGroup
          key={type}
          type={type}
          geometry={geometries[type]}
          items={byType.get(type) ?? []}
          targetIds={targetIds}
          selectedObjectId={selectedObjectId}
          onSelectObject={onSelectObject}
        />
      ))}
    </group>
  );
}

export const DebrisField = memo(DebrisFieldImpl);

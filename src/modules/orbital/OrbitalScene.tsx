import { useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import type { DebrisObject } from '../../types';
import type { CaptureEvent } from './types';
import { toRenderData } from './lib/orbitalRenderData';
import { REFERENCE_ORBITS } from './lib/constants';
import { Starfield } from './components/Starfield';
import { Earth } from './components/Earth';
import { Moon } from './components/Moon';
import { DistantBodies } from './components/DistantBodies';
import { Atmosphere } from './components/Atmosphere';
import { OrbitRing } from './components/OrbitRing';
import { DebrisField } from './components/DebrisField';
import { InfoPanel } from './components/InfoPanel';
import { Station } from './components/Station';
import { SceneRig } from './components/SceneRig';
import { TargetMarker } from './components/TargetMarker';
import { HeroModel } from './components/HeroModel';
import type { QualitySettings } from '../../lib/quality';
import './orbital-scene.css';

interface OrbitalSceneProps {
  objects: DebrisObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string) => void;
  missionTargetIds?: Set<string>;
  nearestTargetId?: string | null;
  nearestInRange?: boolean;
  showStation?: boolean;
  capture?: CaptureEvent | null;
  followStation?: boolean;
  quality: QualitySettings;
}

const EMPTY_TARGETS: Set<string> = new Set();

export function OrbitalScene({
  objects,
  selectedObjectId,
  onSelectObject,
  missionTargetIds = EMPTY_TARGETS,
  nearestTargetId = null,
  nearestInRange = false,
  showStation = false,
  capture = null,
  followStation = false,
  quality,
}: OrbitalSceneProps) {
  const renderData = useMemo(() => objects.map(toRenderData), [objects]);
  const selected = renderData.find((item) => item.id === selectedObjectId) ?? null;
  const nearest = renderData.find((item) => item.id === nearestTargetId) ?? null;
  const stationPositionRef = useRef(new THREE.Vector3());

  return (
    <div className="orbital-scene">
      <Canvas
        camera={{ position: [0, 4, 9], fov: 50, near: 0.002, far: 600 }}
        dpr={[1, quality.maxPixelRatio]}
        gl={{ antialias: quality.antialias, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[6, 4, 5]} intensity={1.6} color="#dbeafe" />
        <Starfield count={quality.starCount} />
        <DistantBodies />
        <Earth detailed={quality.detailedModels} />
        <Atmosphere />
        <Moon />

        {REFERENCE_ORBITS.map((orbit) => (
          <OrbitRing key={orbit.label} altitudeKm={orbit.altitudeKm} inclinationDeg={orbit.inclinationDeg} />
        ))}

        <DebrisField
          key={quality.debrisCount}
          items={renderData}
          targetIds={missionTargetIds}
          selectedObjectId={selectedObjectId}
          onSelectObject={onSelectObject}
        />

        <TargetMarker target={nearest} inRange={nearestInRange} />

        {quality.detailedModels && selected ? <HeroModel target={selected} /> : null}

        {showStation ? (
          <Station positionRef={stationPositionRef} capture={capture} detailed={quality.detailedModels} />
        ) : null}

        <SceneRig follow={followStation && showStation} stationPositionRef={stationPositionRef} />
      </Canvas>
      {selected ? (
        <InfoPanel
          selected={selected}
          isTarget={missionTargetIds.has(selected.id)}
          onClose={() => onSelectObject('')}
        />
      ) : null}
    </div>
  );
}

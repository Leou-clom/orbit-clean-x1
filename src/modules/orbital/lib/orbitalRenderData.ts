import type { DebrisObject } from '../../../types';
import type { OrbitalRenderData } from '../types';
import { SIZE_UNITS, TYPE_COLORS, TYPE_LABELS } from './constants';

function hash(value: string): number {
  let result = 0;
  for (let i = 0; i < value.length; i++) {
    result = (result << 5) - result + value.charCodeAt(i);
    result |= 0;
  }
  return Math.abs(result);
}

export function toRenderData(object: DebrisObject): OrbitalRenderData {
  const seed = hash(object.id);
  return {
    spinX: (seed % 360) * (Math.PI / 180),
    spinY: ((seed >> 4) % 360) * (Math.PI / 180),
    spinZ: ((seed >> 8) % 360) * (Math.PI / 180),
    id: object.id,
    label: object.name,
    type: object.type,
    typeLabel: TYPE_LABELS[object.type],
    colorHex: TYPE_COLORS[object.type],
    altitudeKm: object.altitudeKm,
    inclinationDeg: object.inclinationDeg,
    raanDeg: object.raanDeg,
    phaseDeg: object.phaseDeg,
    speedKms: object.velocityKms,
    sizeClass: object.sizeClass,
    sizeUnits: SIZE_UNITS[object.sizeClass],
    resistance: object.resistance,
    points: object.points,
    special: object.special,
    bandLabel: object.bandLabel,
  };
}

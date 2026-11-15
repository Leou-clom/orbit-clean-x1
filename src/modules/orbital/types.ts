import type { DebrisSizeClass, DebrisObjectType } from '../../types';

export interface OrbitalRenderData {
  id: string;
  label: string;
  type: DebrisObjectType;
  typeLabel: string;
  colorHex: string;
  altitudeKm: number;
  inclinationDeg: number;
  raanDeg: number;
  phaseDeg: number;
  speedKms: number;
  sizeClass: DebrisSizeClass;
  sizeUnits: number;
  resistance: number;
  points: number;
  special: boolean;
  bandLabel: string;
  spinX: number;
  spinY: number;
  spinZ: number;
}

export type { LiveStation as StationState } from '../../lib/stationState';

export interface CaptureEvent {
  object: OrbitalRenderData;
  at: number;
}

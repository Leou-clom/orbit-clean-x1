import type { DebrisObjectType, DebrisSizeClass } from '../../../types/orbital';

export const TYPE_COLORS: Record<DebrisObjectType, string> = {
  satellite: '#4fd1ff',
  debris: '#ff6b6b',
  rocket_body: '#ffd166',
  asteroid: '#b08968',
  unknown: '#9ca3af',
};

export const TYPE_LABELS: Record<DebrisObjectType, string> = {
  satellite: 'satélite',
  debris: 'fragmento',
  rocket_body: 'cuerpo de cohete',
  asteroid: 'asteroide',
  unknown: 'desconocido',
};

// Tamaños exagerados a propósito: a escala real un fragmento sería invisible junto a la Tierra.
export const SIZE_UNITS: Record<DebrisSizeClass, number> = {
  small: 0.012,
  medium: 0.02,
  large: 0.032,
};

export const STATION_SIZE_UNITS = 0.03;

export const CAMERA_FREE_MIN_DISTANCE = 2.6;
export const CAMERA_FREE_MAX_DISTANCE = 200;
export const CAMERA_FOLLOW_MIN_DISTANCE = 0.15;
export const CAMERA_FOLLOW_MAX_DISTANCE = 4;

// Altitudes de referencia públicas para los anillos guía.
export const REFERENCE_ORBITS = [
  { altitudeKm: 408, label: 'ISS 408 km', inclinationDeg: 51.6 },
  { altitudeKm: 550, label: 'Constelaciones 550 km', inclinationDeg: 53 },
  { altitudeKm: 850, label: 'Pico de densidad 850 km', inclinationDeg: 98.8 },
  { altitudeKm: 1450, label: 'Banda 1450 km', inclinationDeg: 74 },
];

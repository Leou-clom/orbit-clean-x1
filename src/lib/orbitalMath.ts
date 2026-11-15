export const EARTH_RADIUS_KM = 6371;
export const EARTH_RADIUS_UNITS = 2;
export const MU_EARTH = 398600.4418;

// 1 s real = 90 s simulados: una órbita baja completa tarda poco más de un minuto en pantalla.
export const TIME_SCALE = 90;

const DEG = Math.PI / 180;

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export function kmToUnits(km: number): number {
  return (km / EARTH_RADIUS_KM) * EARTH_RADIUS_UNITS;
}

export function unitsToKm(units: number): number {
  return (units / EARTH_RADIUS_UNITS) * EARTH_RADIUS_KM;
}

export function orbitRadiusUnits(altitudeKm: number): number {
  return kmToUnits(EARTH_RADIUS_KM + altitudeKm);
}

export function orbitalPeriodSeconds(altitudeKm: number): number {
  const r = EARTH_RADIUS_KM + altitudeKm;
  return 2 * Math.PI * Math.sqrt((r * r * r) / MU_EARTH);
}

export function orbitalSpeedKms(altitudeKm: number): number {
  return Math.sqrt(MU_EARTH / (EARTH_RADIUS_KM + altitudeKm));
}

export function meanMotionDegPerSec(altitudeKm: number): number {
  return 360 / orbitalPeriodSeconds(altitudeKm);
}

export function currentAngleDeg(phaseDeg: number, altitudeKm: number, simSeconds: number): number {
  return phaseDeg + meanMotionDegPerSec(altitudeKm) * simSeconds;
}

export function orbitalPosition(
  out: Vec3,
  altitudeKm: number,
  inclinationDeg: number,
  raanDeg: number,
  angleDeg: number
): Vec3 {
  const r = orbitRadiusUnits(altitudeKm);
  const v = angleDeg * DEG;
  const i = inclinationDeg * DEG;
  const o = raanDeg * DEG;

  const x1 = r * Math.cos(v);
  const z1 = r * Math.sin(v);
  const y2 = -z1 * Math.sin(i);
  const z2 = z1 * Math.cos(i);

  out.x = x1 * Math.cos(o) + z2 * Math.sin(o);
  out.y = y2;
  out.z = -x1 * Math.sin(o) + z2 * Math.cos(o);
  return out;
}

export function distanceKm(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return unitsToKm(Math.sqrt(dx * dx + dy * dy + dz * dz));
}

export function shortestAngleDeg(from: number, to: number): number {
  let delta = (to - from) % 360;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return delta;
}

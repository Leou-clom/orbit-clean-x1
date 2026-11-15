import type { DebrisObject, DebrisObjectType, DebrisSizeClass } from '../types';
import { orbitalSpeedKms } from '../lib/orbitalMath';
import { mulberry32 } from '../lib/random';

// Bandas de altitud e inclinación según la distribución pública del entorno orbital que publican
// NASA ODPO (Orbital Debris Quarterly News) y el Space Environment Report de ESA: el pico de
// densidad espacial en LEO está entre ~780 y 900 km, con concentraciones secundarias cerca de
// 500-600 km y de 1400-1500 km, e inclinaciones agrupadas en heliosíncrona (~98°), la banda de
// Iridium/Cosmos (~74° y ~86°) y la de la ISS (51.6°).
// Son bandas estadísticas: cada objeto generado es sintético, NO un objeto catalogado real.
interface AltitudeBand {
  label: string;
  minKm: number;
  maxKm: number;
  weight: number;
  inclinations: number[];
}

const BANDS: AltitudeBand[] = [
  { label: 'LEO baja 480-620 km', minKm: 480, maxKm: 620, weight: 0.18, inclinations: [51.6, 53, 70, 97.5] },
  { label: 'LEO media 620-780 km', minKm: 620, maxKm: 780, weight: 0.17, inclinations: [74, 82, 97.8, 98.2] },
  { label: 'Pico de densidad 780-900 km', minKm: 780, maxKm: 900, weight: 0.27, inclinations: [86.4, 98.8, 99.1, 74] },
  { label: 'LEO alta 900-1100 km', minKm: 900, maxKm: 1100, weight: 0.16, inclinations: [82, 99.2, 63.4] },
  { label: 'Banda 1100-1300 km', minKm: 1100, maxKm: 1300, weight: 0.08, inclinations: [63.4, 82.9, 99.5] },
  { label: 'Banda 1400-1500 km', minKm: 1400, maxKm: 1500, weight: 0.08, inclinations: [52, 74, 82] },
  { label: 'LEO superior 1500-2000 km', minKm: 1500, maxKm: 2000, weight: 0.04, inclinations: [63.4, 82, 100] },
  { label: 'GEO 35 786 km', minKm: 35700, maxKm: 35800, weight: 0.02, inclinations: [0.1, 1.5, 5] },
];

const BASE_POINTS: Record<DebrisSizeClass, number> = { small: 10, medium: 25, large: 50 };

const PREFIX: Record<DebrisObjectType, string> = {
  satellite: 'SAT',
  debris: 'DEB',
  rocket_body: 'RB',
  asteroid: 'AST',
  unknown: 'UNK',
};

export function generateDebrisPopulation(count = 620, seed = 20261114): DebrisObject[] {
  const rng = mulberry32(seed);
  const cumulative: number[] = [];
  let acc = 0;
  for (const band of BANDS) {
    acc += band.weight;
    cumulative.push(acc);
  }

  const objects: DebrisObject[] = [];
  for (let i = 0; i < count; i++) {
    const roll = rng() * acc;
    const bandIndex = cumulative.findIndex((limit) => roll <= limit);
    const band = BANDS[bandIndex === -1 ? BANDS.length - 1 : bandIndex];

    const altitudeKm = band.minKm + rng() * (band.maxKm - band.minKm);
    const baseInclination = band.inclinations[Math.floor(rng() * band.inclinations.length)];
    const inclinationDeg = baseInclination + (rng() - 0.5) * 1.4;

    const typeRoll = rng();
    const type: DebrisObjectType =
      typeRoll < 0.5 ? 'debris' : typeRoll < 0.69 ? 'satellite' : typeRoll < 0.84 ? 'rocket_body' : 'asteroid';

    const sizeRoll = rng();
    const sizeClass: DebrisSizeClass =
      type === 'asteroid'
        ? sizeRoll < 0.25
          ? 'small'
          : sizeRoll < 0.65
            ? 'medium'
            : 'large'
        : sizeRoll < 0.58
          ? 'small'
          : sizeRoll < 0.87
            ? 'medium'
            : 'large';

    const resistanceRoll = rng();
    const resistance =
      sizeClass === 'small'
        ? resistanceRoll < 0.6
          ? 1
          : 2
        : sizeClass === 'medium'
          ? resistanceRoll < 0.7
            ? 2
            : 3
          : resistanceRoll < 0.4
            ? 2
            : 3;

    const special = rng() < 0.07;
    const points = Math.round(BASE_POINTS[sizeClass] * (1 + (resistance - 1) * 0.5) * (special ? 2 : 1));

    objects.push({
      id: `sim-${i.toString().padStart(4, '0')}`,
      name: `${PREFIX[type]}-${i.toString().padStart(4, '0')}`,
      type,
      altitudeKm,
      inclinationDeg,
      raanDeg: rng() * 360,
      phaseDeg: rng() * 360,
      velocityKms: orbitalSpeedKms(altitudeKm),
      sizeClass,
      resistance,
      points,
      special,
      bandLabel: band.label,
    });
  }

  return objects;
}

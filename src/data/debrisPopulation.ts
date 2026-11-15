import type { OrbitalDebris, DebrisObjectType, DebrisSizeClass } from '../types/orbital';
import { orbitalSpeedKms } from '../lib/orbitalMath';
import { mulberry32 } from '../lib/random';

// Familias de objetos realmente catalogadas por NASA/NORAD, colocadas en el régimen orbital que
// ocupan de verdad. Las cuatro primeras concentran buena parte de los fragmentos rastreados en
// órbita baja. El fragmento concreto que ves es sintético: lo real es la familia y su órbita.
interface DebrisFamily {
  designation: string;
  origin: string;
  type: DebrisObjectType;
  minAltitudeKm: number;
  maxAltitudeKm: number;
  inclinationDeg: number;
  weight: number;
  sizeBias: DebrisSizeClass;
}

const FAMILIES: DebrisFamily[] = [
  {
    designation: 'FENGYUN 1C DEB',
    origin: 'Ensayo antisatélite chino sobre Fengyun-1C (2007)',
    type: 'debris',
    minAltitudeKm: 780,
    maxAltitudeKm: 900,
    inclinationDeg: 98.8,
    weight: 0.24,
    sizeBias: 'small',
  },
  {
    designation: 'COSMOS 2251 DEB',
    origin: 'Colisión Iridium 33 / Cosmos 2251 (2009)',
    type: 'debris',
    minAltitudeKm: 700,
    maxAltitudeKm: 850,
    inclinationDeg: 74,
    weight: 0.15,
    sizeBias: 'small',
  },
  {
    designation: 'IRIDIUM 33 DEB',
    origin: 'Colisión Iridium 33 / Cosmos 2251 (2009)',
    type: 'debris',
    minAltitudeKm: 720,
    maxAltitudeKm: 860,
    inclinationDeg: 86.4,
    weight: 0.09,
    sizeBias: 'small',
  },
  {
    designation: 'COSMOS 1408 DEB',
    origin: 'Ensayo antisatélite ruso sobre Cosmos 1408 (2021)',
    type: 'debris',
    minAltitudeKm: 440,
    maxAltitudeKm: 620,
    inclinationDeg: 82.6,
    weight: 0.11,
    sizeBias: 'small',
  },
  {
    designation: 'SL-16 R/B',
    origin: 'Segunda etapa Zenit-2 abandonada',
    type: 'rocket_body',
    minAltitudeKm: 820,
    maxAltitudeKm: 870,
    inclinationDeg: 71,
    weight: 0.07,
    sizeBias: 'large',
  },
  {
    designation: 'SL-8 R/B',
    origin: 'Etapa superior Kosmos-3M abandonada',
    type: 'rocket_body',
    minAltitudeKm: 1400,
    maxAltitudeKm: 1550,
    inclinationDeg: 74,
    weight: 0.07,
    sizeBias: 'large',
  },
  {
    designation: 'NOAA 16 DEB',
    origin: 'Fragmentación del satélite meteorológico NOAA 16 (2015)',
    type: 'debris',
    minAltitudeKm: 840,
    maxAltitudeKm: 890,
    inclinationDeg: 99,
    weight: 0.06,
    sizeBias: 'small',
  },
  {
    designation: 'DELTA 1 DEB',
    origin: 'Fragmentaciones de etapas Delta',
    type: 'debris',
    minAltitudeKm: 950,
    maxAltitudeKm: 1300,
    inclinationDeg: 99.5,
    weight: 0.06,
    sizeBias: 'medium',
  },
  {
    designation: 'ENVISAT',
    origin: 'Satélite de observación de ESA, inactivo desde 2012',
    type: 'satellite',
    minAltitudeKm: 760,
    maxAltitudeKm: 780,
    inclinationDeg: 98.4,
    weight: 0.03,
    sizeBias: 'large',
  },
  {
    designation: 'METEOR 2-08 DEB',
    origin: 'Fragmentación de un satélite meteorológico soviético',
    type: 'debris',
    minAltitudeKm: 900,
    maxAltitudeKm: 1000,
    inclinationDeg: 82.5,
    weight: 0.05,
    sizeBias: 'small',
  },
  {
    designation: 'THORAD AGENA D DEB',
    origin: 'Fragmentación de una etapa Thorad-Agena D',
    type: 'debris',
    minAltitudeKm: 1000,
    maxAltitudeKm: 1120,
    inclinationDeg: 101,
    weight: 0.04,
    sizeBias: 'medium',
  },
  {
    designation: 'ARIANE 5 R/B',
    origin: 'Etapa superior Ariane 5 abandonada',
    type: 'rocket_body',
    minAltitudeKm: 600,
    maxAltitudeKm: 800,
    inclinationDeg: 7,
    weight: 0.03,
    sizeBias: 'large',
  },
  {
    designation: 'TITAN 3C TRANSTAGE DEB',
    origin: 'Fragmentación de etapas Transtage cerca de la órbita geoestacionaria',
    type: 'debris',
    minAltitudeKm: 35500,
    maxAltitudeKm: 35900,
    inclinationDeg: 2,
    weight: 0.02,
    sizeBias: 'medium',
  },
  {
    designation: 'BREEZE-M DEB',
    origin: 'Fragmentación de etapas Briz-M en órbita de transferencia',
    type: 'debris',
    minAltitudeKm: 1500,
    maxAltitudeKm: 2000,
    inclinationDeg: 49,
    weight: 0.03,
    sizeBias: 'medium',
  },
];

const ASTEROID_FAMILY: DebrisFamily = {
  designation: 'NEO FRAGMENT',
  origin: 'Fragmento rocoso en tránsito por la zona de trabajo',
  type: 'asteroid',
  minAltitudeKm: 500,
  maxAltitudeKm: 1600,
  inclinationDeg: 35,
  weight: 0.02,
  sizeBias: 'large',
};

const BASE_POINTS: Record<DebrisSizeClass, number> = { small: 10, medium: 25, large: 50 };

function pickSize(bias: DebrisSizeClass, roll: number): DebrisSizeClass {
  if (bias === 'large') return roll < 0.2 ? 'medium' : 'large';
  if (bias === 'medium') return roll < 0.3 ? 'small' : roll < 0.8 ? 'medium' : 'large';
  return roll < 0.68 ? 'small' : roll < 0.92 ? 'medium' : 'large';
}

export function generateDebrisPopulation(count = 620, seed = 20261114): OrbitalDebris[] {
  const rng = mulberry32(seed);
  const pool = [...FAMILIES, ASTEROID_FAMILY];
  const cumulative: number[] = [];
  let acc = 0;
  for (const family of pool) {
    acc += family.weight;
    cumulative.push(acc);
  }

  const objects: OrbitalDebris[] = [];
  const counters = new Map<string, number>();

  for (let i = 0; i < count; i++) {
    const roll = rng() * acc;
    const index = cumulative.findIndex((limit) => roll <= limit);
    const family = pool[index === -1 ? pool.length - 1 : index];

    const serial = (counters.get(family.designation) ?? 0) + 1;
    counters.set(family.designation, serial);

    const altitudeKm = family.minAltitudeKm + rng() * (family.maxAltitudeKm - family.minAltitudeKm);
    const inclinationDeg = family.inclinationDeg + (rng() - 0.5) * 1.6;
    const sizeClass = pickSize(family.sizeBias, rng());

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
      name: `${family.designation} ${serial.toString().padStart(3, '0')}`,
      type: family.type,
      altitudeKm,
      inclinationDeg,
      raanDeg: rng() * 360,
      phaseDeg: rng() * 360,
      velocityKms: orbitalSpeedKms(altitudeKm),
      sizeClass,
      resistance,
      points,
      special,
      bandLabel: family.origin,
    });
  }

  return objects;
}

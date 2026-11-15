// Catálogo de piezas de la nave recolectora. La regla del desafío de Space Apps es que ninguna
// opción sea gratis: cada mejora cuesta masa, potencia o presupuesto, y a veces empeora otra cosa.

export type PartSlot = 'arm' | 'shield' | 'power' | 'cargo' | 'thruster';

export interface ShipPart {
  id: string;
  slot: PartSlot;
  name: string;
  summary: string;
  massKg: number;
  // Positivo = genera potencia, negativo = la consume.
  powerW: number;
  costM: number;
  effects: Partial<ShipStats>;
}

export interface ShipStats {
  captureRangeKm: number;
  maneuverSpeed: number;
  hull: number;
  damageFactor: number;
  collisionProfile: number;
  cargoCapacity: number;
  steerRate: number;
}

export interface Launcher {
  id: string;
  name: string;
  summary: string;
  maxMassKg: number;
  maxAltitudeKm: number;
  costM: number;
}

export const BUDGET_M = 100;

export const SLOT_LABELS: Record<PartSlot, string> = {
  arm: 'Brazo robótico',
  shield: 'Blindaje',
  power: 'Paneles solares',
  cargo: 'Bodega de carga',
  thruster: 'Propulsión',
};

export const PARTS: ShipPart[] = [
  {
    id: 'arm-light',
    slot: 'arm',
    name: 'Brazo ligero',
    summary: 'Maniobra rápida, poco alcance',
    massKg: 120,
    powerW: -90,
    costM: 8,
    effects: { captureRangeKm: 110, maneuverSpeed: 1.3 },
  },
  {
    id: 'arm-standard',
    slot: 'arm',
    name: 'Brazo estándar',
    summary: 'Equilibrado',
    massKg: 220,
    powerW: -140,
    costM: 14,
    effects: { captureRangeKm: 150, maneuverSpeed: 1 },
  },
  {
    id: 'arm-heavy',
    slot: 'arm',
    name: 'Brazo pesado',
    summary: 'Mucho alcance, maniobra lenta',
    massKg: 380,
    powerW: -210,
    costM: 22,
    effects: { captureRangeKm: 215, maneuverSpeed: 0.75 },
  },

  {
    id: 'shield-min',
    slot: 'shield',
    name: 'Blindaje mínimo',
    summary: 'Ligero pero frágil',
    massKg: 80,
    powerW: 0,
    costM: 4,
    effects: { hull: 80, damageFactor: 1.35 },
  },
  {
    id: 'shield-mid',
    slot: 'shield',
    name: 'Blindaje medio',
    summary: 'Protección estándar',
    massKg: 240,
    powerW: 0,
    costM: 10,
    effects: { hull: 100, damageFactor: 1 },
  },
  {
    id: 'shield-heavy',
    slot: 'shield',
    name: 'Blindaje reforzado',
    summary: 'Aguanta mucho, pesa mucho',
    massKg: 460,
    powerW: 0,
    costM: 18,
    effects: { hull: 135, damageFactor: 0.6 },
  },

  {
    id: 'power-compact',
    slot: 'power',
    name: 'Paneles compactos',
    summary: 'Poca energía, blanco pequeño',
    massKg: 90,
    powerW: 280,
    costM: 6,
    effects: { collisionProfile: 0.8 },
  },
  {
    id: 'power-extended',
    slot: 'power',
    name: 'Paneles extendidos',
    summary: 'Mucha energía, blanco grande',
    massKg: 190,
    powerW: 560,
    costM: 12,
    effects: { collisionProfile: 1.3 },
  },

  {
    id: 'cargo-small',
    slot: 'cargo',
    name: 'Bodega pequeña',
    summary: '25 objetos',
    massKg: 110,
    powerW: -40,
    costM: 5,
    effects: { cargoCapacity: 25 },
  },
  {
    id: 'cargo-mid',
    slot: 'cargo',
    name: 'Bodega media',
    summary: '55 objetos',
    massKg: 240,
    powerW: -70,
    costM: 11,
    effects: { cargoCapacity: 55 },
  },
  {
    id: 'cargo-large',
    slot: 'cargo',
    name: 'Bodega grande',
    summary: '100 objetos',
    massKg: 420,
    powerW: -110,
    costM: 19,
    effects: { cargoCapacity: 100 },
  },

  {
    id: 'thruster-eco',
    slot: 'thruster',
    name: 'Propulsión económica',
    summary: 'Barata y lenta',
    massKg: 180,
    powerW: -80,
    costM: 7,
    effects: { steerRate: 0.55 },
  },
  {
    id: 'thruster-standard',
    slot: 'thruster',
    name: 'Propulsión estándar',
    summary: 'Equilibrada',
    massKg: 300,
    powerW: -130,
    costM: 13,
    effects: { steerRate: 0.8 },
  },
  {
    id: 'thruster-power',
    slot: 'thruster',
    name: 'Propulsión potente',
    summary: 'Llega antes, cuesta y pesa',
    massKg: 470,
    powerW: -200,
    costM: 21,
    effects: { steerRate: 1.2 },
  },
];

export const LAUNCHERS: Launcher[] = [
  {
    id: 'launcher-light',
    name: 'Lanzador ligero',
    summary: 'Hasta 900 kg y 700 km',
    maxMassKg: 900,
    maxAltitudeKm: 700,
    costM: 18,
  },
  {
    id: 'launcher-medium',
    name: 'Lanzador medio',
    summary: 'Hasta 1 400 kg y 1 600 km',
    maxMassKg: 1400,
    maxAltitudeKm: 1600,
    costM: 30,
  },
  {
    id: 'launcher-heavy',
    name: 'Lanzador pesado',
    summary: 'Hasta 2 200 kg, alcanza GEO',
    maxMassKg: 2200,
    maxAltitudeKm: 36000,
    costM: 48,
  },
];

export type Loadout = Record<PartSlot, string> & { launcher: string };

export const DEFAULT_LOADOUT: Loadout = {
  arm: 'arm-standard',
  shield: 'shield-mid',
  power: 'power-compact',
  cargo: 'cargo-small',
  thruster: 'thruster-standard',
  launcher: 'launcher-medium',
};

export const SLOT_ORDER: PartSlot[] = ['arm', 'shield', 'power', 'cargo', 'thruster'];

export function partsFor(slot: PartSlot): ShipPart[] {
  return PARTS.filter((part) => part.slot === slot);
}

export function findPart(id: string): ShipPart {
  return PARTS.find((part) => part.id === id) ?? PARTS[0];
}

export function findLauncher(id: string): Launcher {
  return LAUNCHERS.find((launcher) => launcher.id === id) ?? LAUNCHERS[0];
}

export interface DesignSummary {
  stats: ShipStats;
  massKg: number;
  netPowerW: number;
  costM: number;
  launcher: Launcher;
  issues: string[];
  valid: boolean;
}

export function summarize(loadout: Loadout, missionAltitudeKm: number): DesignSummary {
  const chosen = SLOT_ORDER.map((slot) => findPart(loadout[slot]));
  const launcher = findLauncher(loadout.launcher);

  const stats: ShipStats = {
    captureRangeKm: 150,
    maneuverSpeed: 1,
    hull: 100,
    damageFactor: 1,
    collisionProfile: 1,
    cargoCapacity: 25,
    steerRate: 0.8,
  };
  for (const part of chosen) Object.assign(stats, part.effects);

  const massKg = chosen.reduce((sum, part) => sum + part.massKg, 0);
  const netPowerW = chosen.reduce((sum, part) => sum + part.powerW, 0);
  const costM = chosen.reduce((sum, part) => sum + part.costM, 0) + launcher.costM;

  const issues: string[] = [];
  if (massKg > launcher.maxMassKg) {
    issues.push(`La nave pesa ${massKg} kg y el ${launcher.name.toLowerCase()} solo sube ${launcher.maxMassKg} kg.`);
  }
  if (netPowerW < 0) {
    issues.push(`Faltan ${Math.abs(netPowerW)} W: los paneles no alimentan todo lo que montaste.`);
  }
  if (costM > BUDGET_M) {
    issues.push(`El diseño cuesta ${costM} M€ y el presupuesto es de ${BUDGET_M} M€.`);
  }
  if (missionAltitudeKm > launcher.maxAltitudeKm) {
    issues.push(
      `La zona de trabajo está a ${Math.round(missionAltitudeKm)} km y este lanzador llega a ${launcher.maxAltitudeKm} km.`
    );
  }

  return { stats, massKg, netPowerW, costM, launcher, issues, valid: issues.length === 0 };
}

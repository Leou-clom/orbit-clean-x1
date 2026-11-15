import type {
  OrbitalDebris,
  DifficultyRank,
  MissionDefinition,
  MissionResult,
  SecondaryOutcome,
  TargetFilter,
} from '../../../types/orbital';
import { mulberry32, shuffle } from '../../../lib/random';
import type { LiveStation } from '../../../lib/stationState';

const DIFFICULTY_FACTOR: Record<DifficultyRank, number> = { D: 1, C: 1.2, B: 1.5, A: 1.8, S: 2.2 };
const SECONDARY_BONUS = 250;
const MISTAKE_PENALTY = 25;
const COLLISION_PENALTY = 40;

export function matchesFilter(object: OrbitalDebris, filter?: TargetFilter): boolean {
  if (!filter) return true;
  if (filter.sizeClass && object.sizeClass !== filter.sizeClass) return false;
  if (filter.type && object.type !== filter.type) return false;
  if (filter.minResistance && object.resistance < filter.minResistance) return false;
  return true;
}

// Cada misión ocurre en una zona de trabajo orbital: los objetivos se eligen alrededor de un objeto
// ancla, porque cambiar de plano orbital es lo caro y perseguir objetos en órbitas opuestas haría
// imposible cualquier límite de tiempo.
function zoneDistance(object: OrbitalDebris, anchor: OrbitalDebris): number {
  return Math.abs(object.altitudeKm - anchor.altitudeKm) / 50 + Math.abs(object.inclinationDeg - anchor.inclinationDeg) * 3;
}

export function selectMissionTargets(mission: MissionDefinition, population: OrbitalDebris[]): OrbitalDebris[] {
  const rng = mulberry32(1000 + mission.id);
  const poolSize = Math.ceil(mission.targetCount * 1.25);
  const matching = shuffle(
    population.filter((object) => matchesFilter(object, mission.targetFilter)),
    rng
  );
  const anchor = matching[0] ?? population[0];
  const candidates = matching.slice().sort((a, b) => zoneDistance(a, anchor) - zoneDistance(b, anchor));

  const needsLarge = mission.secondaryObjectives.reduce(
    (max, objective) => (objective.kind === 'large_count' ? Math.max(max, objective.count) : max),
    0
  );
  const needsSpecial = mission.secondaryObjectives.some((objective) => objective.kind === 'all_special')
    ? Math.max(3, Math.round(poolSize * 0.15))
    : 0;

  const picked: OrbitalDebris[] = [];
  const used = new Set<string>();

  const take = (predicate: (object: OrbitalDebris) => boolean, amount: number) => {
    let remaining = amount;
    for (const object of candidates) {
      if (remaining <= 0 || picked.length >= poolSize) break;
      if (used.has(object.id) || !predicate(object)) continue;
      picked.push(object);
      used.add(object.id);
      remaining--;
    }
  };

  take((object) => object.sizeClass === 'large', needsLarge);
  take((object) => object.special, needsSpecial);
  take(() => true, poolSize - picked.length);

  if (picked.length < poolSize) {
    const fallback = shuffle(population, rng);
    for (const object of fallback) {
      if (picked.length >= poolSize) break;
      if (used.has(object.id)) continue;
      picked.push(object);
      used.add(object.id);
    }
  }

  return picked;
}

// Fragmentos sueltos dentro de la zona de trabajo. Sin ellos las colisiones son estadísticamente
// casi imposibles: 620 objetos repartidos en todo el casquete de LEO dan un impacto cada varios
// minutos de vuelo.
export function generateHazardCloud(mission: MissionDefinition, targets: OrbitalDebris[]): OrbitalDebris[] {
  const anchor = targets[0];
  if (!anchor) return [];

  const rng = mulberry32(5000 + mission.id);
  const count = 70 + mission.id * 2;
  const cloud: OrbitalDebris[] = [];

  for (let i = 0; i < count; i++) {
    const sizeRoll = rng();
    const sizeClass = sizeRoll < 0.55 ? 'small' : sizeRoll < 0.85 ? 'medium' : 'large';
    const isAsteroid = rng() < 0.3;

    // Mitad comparte el plano y solo deriva en altitud; la otra mitad cruza el plano, que es
    // la geometría de las conjunciones reales y la que produce velocidad relativa alta.
    const crossing = rng() < 0.5;
    const inclinationOffset = crossing ? (rng() < 0.5 ? -1 : 1) * (14 + rng() * 26) : (rng() - 0.5) * 2;

    cloud.push({
      id: `hz-${mission.id}-${i}`,
      name: `${isAsteroid ? 'AST' : 'FRG'}-${mission.id}${i.toString().padStart(2, '0')}`,
      type: isAsteroid ? 'asteroid' : 'debris',
      altitudeKm: anchor.altitudeKm + (rng() - 0.5) * (crossing ? 40 : 220),
      inclinationDeg: anchor.inclinationDeg + inclinationOffset,
      raanDeg: crossing ? rng() * 360 : anchor.raanDeg + (rng() - 0.5) * 3,
      phaseDeg: rng() * 360,
      velocityKms: anchor.velocityKms,
      sizeClass,
      resistance: sizeClass === 'small' ? 1 : sizeClass === 'medium' ? 2 : 3,
      points: 0,
      special: false,
      bandLabel: `Zona de trabajo · ${anchor.bandLabel}`,
    });
  }

  return cloud;
}

export function missionStationStart(targets: OrbitalDebris[]): LiveStation {
  const anchor = targets[0];
  if (!anchor) return { altitudeKm: 408, inclinationDeg: 51.6, raanDeg: 0, angleDeg: 0 };
  return {
    altitudeKm: anchor.altitudeKm,
    inclinationDeg: anchor.inclinationDeg,
    raanDeg: anchor.raanDeg,
    angleDeg: anchor.phaseDeg - 12,
  };
}

export function objectiveProgress(mission: MissionDefinition, captured: OrbitalDebris[]): number {
  return captured.filter((object) => matchesFilter(object, mission.targetFilter)).length;
}

export function evaluateMission(args: {
  mission: MissionDefinition;
  targets: OrbitalDebris[];
  captured: OrbitalDebris[];
  mistakes: number;
  collisions: number;
  hullIntegrity: number;
  elapsedSeconds: number;
  livesRemaining: number;
}): MissionResult {
  const { mission, targets, captured, mistakes, collisions, hullIntegrity, elapsedSeconds, livesRemaining } = args;

  const progress = objectiveProgress(mission, captured);
  const mainObjectiveCompleted = progress >= mission.targetCount;
  const factor = DIFFICULTY_FACTOR[mission.difficulty];

  const capturedLarge = captured.filter((object) => object.sizeClass === 'large').length;
  const capturedSpecial = captured.filter((object) => object.special).length;
  const targetsSpecial = targets.filter((object) => object.special).length;

  const secondaryOutcomes: SecondaryOutcome[] = mission.secondaryObjectives.map((objective) => {
    let completed = false;
    if (mainObjectiveCompleted) {
      switch (objective.kind) {
        case 'no_mistakes':
          completed = mistakes === 0;
          break;
        case 'time_under':
          completed = elapsedSeconds < objective.seconds;
          break;
        case 'capture_all_targets':
          completed = captured.length >= targets.length;
          break;
        case 'large_count':
          completed = capturedLarge >= objective.count;
          break;
        case 'all_of_size': {
          const inField = targets.filter((object) => object.sizeClass === objective.sizeClass).length;
          const taken = captured.filter((object) => object.sizeClass === objective.sizeClass).length;
          completed = inField > 0 && taken >= inField;
          break;
        }
        case 'all_special':
          completed = targetsSpecial > 0 && capturedSpecial >= targetsSpecial;
          break;
        case 'no_life_lost':
          completed = livesRemaining >= 1;
          break;
      }
    }
    return { id: objective.id, label: objective.label, completed };
  });

  const capturePoints = captured.reduce((sum, object) => sum + object.points, 0);
  const timeLeft = Math.max(0, mission.timeLimitSeconds - elapsedSeconds);
  const speedBonus = mainObjectiveCompleted ? Math.round(timeLeft * 2 * factor) : 0;
  const secondaryBonus = Math.round(
    secondaryOutcomes.filter((outcome) => outcome.completed).length * SECONDARY_BONUS * factor
  );
  const mistakePenalty = mistakes * MISTAKE_PENALTY;
  const collisionPenalty = collisions * COLLISION_PENALTY;

  return {
    missionId: mission.id,
    missionName: mission.name,
    difficulty: mission.difficulty,
    collisions,
    hullIntegrity,
    totalScore: Math.max(0, capturePoints + speedBonus + secondaryBonus - mistakePenalty - collisionPenalty),
    capturePoints,
    speedBonus,
    secondaryBonus,
    mistakePenalty,
    collisionPenalty,
    capturedCount: captured.length,
    objectiveProgress: progress,
    elapsedSeconds,
    mainObjectiveCompleted,
    secondaryOutcomes,
    mistakes,
    livesRemaining,
  };
}

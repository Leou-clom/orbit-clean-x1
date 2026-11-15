import type { DebrisObject } from './index';

// Tipos del módulo orbital (persona 2). Viven aparte de `types/index.ts` para no tocar el
// contrato compartido del equipo: `OrbitalDebris` extiende el `DebrisObject` acordado, así que
// cualquier objeto de este módulo sigue siendo válido para el resto de los módulos.
export type { CrewStatus, DebrisObject, MissionState, PilotAction } from './index';

export type DebrisObjectType = 'satellite' | 'debris' | 'rocket_body' | 'asteroid' | 'unknown';
export type DebrisSizeClass = 'small' | 'medium' | 'large';

export interface OrbitalDebris extends DebrisObject {
  type: DebrisObjectType;
  inclinationDeg: number;
  raanDeg: number;
  phaseDeg: number;
  sizeClass: DebrisSizeClass;
  resistance: number;
  points: number;
  special: boolean;
  bandLabel: string;
}

export type DifficultyRank = 'D' | 'C' | 'B' | 'A' | 'S';

export interface TargetFilter {
  sizeClass?: DebrisSizeClass;
  type?: DebrisObjectType;
  minResistance?: number;
}

export type SecondaryObjective =
  | { id: string; label: string; kind: 'no_mistakes' }
  | { id: string; label: string; kind: 'time_under'; seconds: number }
  | { id: string; label: string; kind: 'capture_all_targets' }
  | { id: string; label: string; kind: 'large_count'; count: number }
  | { id: string; label: string; kind: 'all_of_size'; sizeClass: DebrisSizeClass }
  | { id: string; label: string; kind: 'all_special' }
  | { id: string; label: string; kind: 'no_life_lost' };

export interface MissionDefinition {
  id: number;
  name: string;
  difficulty: DifficultyRank;
  mainObjective: string;
  targetCount: number;
  targetFilter?: TargetFilter;
  secondaryObjectives: SecondaryObjective[];
  timeLimitSeconds: number;
}

export interface SecondaryOutcome {
  id: string;
  label: string;
  completed: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
}

export interface AchievementContext {
  result: MissionResult;
  hullIntegrity: number;
  totalCaptures: number;
  totalLargeCaptures: number;
  missionsCompleted: number;
}

export interface MissionResult {
  missionId: number;
  missionName: string;
  difficulty: DifficultyRank;
  collisions: number;
  hullIntegrity: number;
  totalScore: number;
  capturePoints: number;
  speedBonus: number;
  secondaryBonus: number;
  mistakePenalty: number;
  collisionPenalty: number;
  capturedCount: number;
  objectiveProgress: number;
  elapsedSeconds: number;
  mainObjectiveCompleted: boolean;
  secondaryOutcomes: SecondaryOutcome[];
  mistakes: number;
  livesRemaining: number;
}

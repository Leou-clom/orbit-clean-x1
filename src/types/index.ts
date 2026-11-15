export type DebrisObjectType = 'satellite' | 'debris' | 'rocket_body' | 'asteroid' | 'unknown';
export type DebrisSizeClass = 'small' | 'medium' | 'large';

export interface DebrisObject {
  id: string;
  name: string;
  type: DebrisObjectType;
  altitudeKm: number;
  inclinationDeg: number;
  raanDeg: number;
  phaseDeg: number;
  velocityKms: number;
  sizeClass: DebrisSizeClass;
  resistance: number;
  points: number;
  special: boolean;
  bandLabel: string;
}

export interface CrewStatus {
  heartRateBpm: number;
  spo2Percent: number;
  fatiguePercent: number;
  stressPercent: number;
  focusPercent: number;
  moodLabel: string;
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

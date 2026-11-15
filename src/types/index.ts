
export interface DebrisObject {
  id: string;
  name: string;
  type: string;
  altitudeKm: number;
  velocityKms: number;
}

export interface CrewStatus {
  heartRateBpm: number;
  spo2Percent: number;
  fatiguePercent: number;
  stressPercent: number;
  focusPercent: number;
  moodLabel: string;
}

export interface MissionState {
  phase: "briefing" | "active" | "completed";
  elapsedSeconds: number;
  targetDebrisId: string | null;
  capturedCount: number;
  score: number;
}

export type PilotAction = "approach" | "capture" | "abort";

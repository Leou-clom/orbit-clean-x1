import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { OrbitalScene } from './modules/orbital/OrbitalScene';
import { PilotConsole, type CaptureStatus } from './modules/pilot/PilotConsole';
import { TouchControls } from './modules/pilot/TouchControls';
import { isTouchDevice } from './lib/pointer';
import { MissionBriefing, MissionResults } from './modules/missions/MissionOverlay';
import { HealthPanel } from './modules/health/HealthPanel';
import { VitalsHud } from './modules/crew/VitalsHud';
import type { AvatarState } from './modules/crew/AstronautAvatar';
import { AchievementToasts } from './modules/achievements/AchievementsPanel';
import { evaluateAchievements } from './modules/achievements/achievements';
import { OptionsMenu } from './modules/options/OptionsMenu';
import { Tutorial } from './modules/tutorial/Tutorial';
import { ComboHud, type ScorePopup } from './modules/stats/ComboHud';
import { CaptureChallenge } from './modules/capture/CaptureChallenge';
import { MissionDesign } from './modules/design/MissionDesign';
import { DEFAULT_LOADOUT, summarize, type Loadout } from './data/shipParts';
import './styles/glass.css';
import { challengeCountFor, pickChallenges, type ChallengeKind } from './modules/capture/captureChallenges';
import { generateDebrisPopulation } from './data/debrisPopulation';
import { pickAstronaut } from './data/astronauts';
import { MISSIONS } from './data/missions';
import {
  evaluateMission,
  generateHazardCloud,
  missionStationStart,
  objectiveProgress,
  selectMissionTargets,
} from './modules/missions/lib/missionEngine';
import { sceneClock } from './lib/sceneClock';
import { QUALITY, detectQuality, type QualityLevel } from './lib/quality';
import { liveStation, resetStation } from './lib/stationState';
import {
  currentAngleDeg,
  distanceKm,
  kmToUnits,
  meanMotionDegPerSec,
  orbitalPosition,
  shortestAngleDeg,
  unitsToKm,
} from './lib/orbitalMath';
import { toRenderData } from './modules/orbital/lib/orbitalRenderData';
import type { StationState } from './modules/orbital/types';
import type { Achievement, CrewStatus, OrbitalDebris, DebrisSizeClass, MissionResult } from './types/orbital';

const COLLISION_RADIUS_UNITS = kmToUnits(105);
const COLLISION_RADIUS_SQ = COLLISION_RADIUS_UNITS * COLLISION_RADIUS_UNITS;
const WARNING_RADIUS_UNITS = kmToUnits(520);
const WARNING_RADIUS_SQ = WARNING_RADIUS_UNITS * WARNING_RADIUS_UNITS;
const HIT_COOLDOWN_MS = 2500;
const GRACE_AFTER_HIT_MS = 2200;
// Lo que dura la destrucción de la nave en pantalla antes de mostrar los resultados.
const DESTRUCTION_MS = 3400;
const DODGE_DURATION_MS = 900;
const DODGE_COOLDOWN_MS = 4000;

const HULL_DAMAGE: Record<DebrisSizeClass, number> = { small: 3, medium: 6, large: 10 };

const MOVEMENT_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

// Cada 3 capturas seguidas sube medio multiplicador, con tope en ×3.
function multiplierFor(streak: number): number {
  return Math.min(3, 1 + Math.floor(streak / 3) * 0.5);
}

const INITIAL_CREW: CrewStatus = {
  heartRateBpm: 72,
  spo2Percent: 97.5,
  fatiguePercent: 18,
  stressPercent: 24,
  focusPercent: 82,
  moodLabel: 'Enfoque estable',
};

const MemoHealthPanel = memo(HealthPanel);

type Phase = 'briefing' | 'design' | 'playing' | 'results';

const stationPoint = { x: 0, y: 0, z: 0 };
const prevStationPoint = { x: 0, y: 0, z: 0 };
const targetPoint = { x: 0, y: 0, z: 0 };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function moodFrom(status: CrewStatus): string {
  if (status.stressPercent >= 62) return 'Tensión de misión';
  if (status.fatiguePercent >= 68) return 'Fatiga de turno';
  if (status.focusPercent >= 75 && status.stressPercent < 45) return 'Enfoque estable';
  return 'Estable';
}

function App() {
  const [qualityLevel, setQualityLevel] = useState<QualityLevel>(() => detectQuality());
  // Se decide una vez: el tipo de puntero no cambia a mitad de partida.
  const [touch] = useState(() => isTouchDevice());
  const quality = QUALITY[qualityLevel];
  const population = useMemo(() => generateDebrisPopulation(quality.debrisCount), [quality.debrisCount]);
  const astronaut = useMemo(() => pickAstronaut(), []);

  const [missionIndex, setMissionIndex] = useState(0);
  const [unlocked, setUnlocked] = useState(1);
  const [phase, setPhase] = useState<Phase>('briefing');
  const [paused, setPaused] = useState(false);
  const [attempts, setAttempts] = useState<Record<number, number>>({});
  const [bestScores, setBestScores] = useState<Record<number, number>>({});

  const [targets, setTargets] = useState<OrbitalDebris[]>([]);
  const [hazardCloud, setHazardCloud] = useState<OrbitalDebris[]>([]);
  const [captured, setCaptured] = useState<OrbitalDebris[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [collisions, setCollisions] = useState(0);
  const [hullIntegrity, setHullIntegrity] = useState(100);
  // Instante en que el casco llegó a 0. Mientras no sea null la nave está explotando:
  // el jugador pierde el control y la escena muestra el pecio antes de los resultados.
  const [destroyedAt, setDestroyedAt] = useState<number | null>(null);
  const destroyedAtRef = useRef<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(MISSIONS[0].timeLimitSeconds);
  const [result, setResult] = useState<MissionResult | null>(null);

  const [station, setStation] = useState<StationState>(() => ({ ...liveStation }));
  const [nearest, setNearest] = useState<{ id: string; name: string; distanceKm: number; points: number } | null>(null);
  const [approachEngaged, setApproachEngaged] = useState(false);
  const [capture, setCapture] = useState<{ objectId: string; at: number } | null>(null);
  const [challenge, setChallenge] = useState<{ target: OrbitalDebris; kinds: ChallengeKind[] } | null>(null);
  const [hitFlash, setHitFlash] = useState(false);
  const [threat, setThreat] = useState<{ id: string; name: string; distanceKm: number } | null>(null);
  const [dodgeReady, setDodgeReady] = useState(true);
  const [loadout, setLoadout] = useState<Loadout>(DEFAULT_LOADOUT);
  const [streak, setStreak] = useState(0);
  const [bonusPoints, setBonusPoints] = useState(0);
  const [popups, setPopups] = useState<ScorePopup[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [crew, setCrew] = useState<CrewStatus>(INITIAL_CREW);

  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(() => new Set());
  const [toasts, setToasts] = useState<Achievement[]>([]);
  const [showTutorial, setShowTutorial] = useState(true);

  const [totalCaptures, setTotalCaptures] = useState(0);
  const [totalLargeCaptures, setTotalLargeCaptures] = useState(0);
  const [missionsCompleted, setMissionsCompleted] = useState(0);

  const mission = MISSIONS[missionIndex];
  // La nave que el jugador diseñó manda sobre las constantes: alcance, casco, bodega y velocidad.
  const designAltitudeKm = useMemo(
    () => selectMissionTargets(mission, population)[0]?.altitudeKm ?? 500,
    [mission, population]
  );
  const design = useMemo(() => summarize(loadout, designAltitudeKm), [loadout, designAltitudeKm]);
  const ship = design.stats;
  const shipRef = useRef(ship);
  useEffect(() => {
    shipRef.current = ship;
  });
  const running = phase === 'playing' && !paused && destroyedAt === null;

  const keysRef = useRef<Set<string>>(new Set());
  const activeTargetsRef = useRef<OrbitalDebris[]>([]);
  const hazardsRef = useRef<OrbitalDebris[]>([]);
  const nearestRef = useRef<OrbitalDebris | null>(null);
  const approachRef = useRef(false);
  const missionStartRef = useRef(0);
  const pausedAtRef = useRef(0);
  const hullRef = useRef(100);
  const lastHitRef = useRef<Map<string, number>>(new Map());
  const graceUntilRef = useRef(0);
  const threatRef = useRef<OrbitalDebris | null>(null);
  const dodgeUntilRef = useRef(0);
  const dodgeReadyAtRef = useRef(0);
  const dodgeDirRef = useRef(1);
  const popupIdRef = useRef(0);
  const streakRef = useRef(0);

  const capturedIds = useMemo(() => new Set(captured.map((object) => object.id)), [captured]);
  const targetIds = useMemo(() => new Set(targets.map((object) => object.id)), [targets]);
  const activeTargets = useMemo(
    () => targets.filter((object) => !capturedIds.has(object.id)),
    [targets, capturedIds]
  );
  const visibleObjects = useMemo(
    () => [...population, ...hazardCloud].filter((object) => !capturedIds.has(object.id)),
    [population, hazardCloud, capturedIds]
  );
  const hazards = useMemo(
    () => visibleObjects.filter((object) => !targetIds.has(object.id)),
    [visibleObjects, targetIds]
  );

  const progress = useMemo(() => objectiveProgress(mission, captured), [mission, captured]);
  const capturePoints = useMemo(() => captured.reduce((sum, object) => sum + object.points, 0), [captured]);

  const captureEvent = useMemo(() => {
    if (!capture) return null;
    const object = visibleObjects.find((item) => item.id === capture.objectId)
      ?? population.find((item) => item.id === capture.objectId);
    return object ? { object: toRenderData(object), at: capture.at } : null;
  }, [capture, population, visibleObjects]);

  useEffect(() => {
    activeTargetsRef.current = activeTargets;
  }, [activeTargets]);

  useEffect(() => {
    hazardsRef.current = hazards;
  }, [hazards]);

  useEffect(() => {
    approachRef.current = approachEngaged;
  }, [approachEngaged]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
      keysRef.current.add(event.code);
    };
    const up = (event: KeyboardEvent) => keysRef.current.delete(event.code);
    const blur = () => keysRef.current.clear();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, []);

  const finishMission = useCallback(
    (mainCompleted: boolean) => {
      sceneClock.running = false;
      approachRef.current = false;
      setApproachEngaged(false);
      setPaused(false);
      setChallenge(null);
      const elapsed = Math.min(
        mission.timeLimitSeconds,
        (performance.now() - missionStartRef.current) / 1000
      );
      const hull = hullRef.current;
      const evaluated = evaluateMission({
        mission,
        targets,
        captured,
        mistakes,
        collisions,
        hullIntegrity: hull,
        comboBonus: bonusPoints,
        elapsedSeconds: elapsed,
        livesRemaining: hull > 0 && mainCompleted ? 1 : 0,
      });

      setResult(evaluated);
      setPhase('results');

      const completedCount = missionsCompleted + (evaluated.mainObjectiveCompleted ? 1 : 0);
      const capturesTotal = totalCaptures + captured.length;
      const largeTotal = totalLargeCaptures + captured.filter((item) => item.sizeClass === 'large').length;

      if (evaluated.mainObjectiveCompleted) {
        setUnlocked((current) => Math.max(current, Math.min(MISSIONS.length, mission.id + 1)));
        setMissionsCompleted(completedCount);
      }
      setTotalCaptures(capturesTotal);
      setTotalLargeCaptures(largeTotal);
      setBestScores((current) => ({
        ...current,
        [mission.id]: Math.max(current[mission.id] ?? 0, evaluated.totalScore),
      }));

      setUnlockedAchievements((current) => {
        const earned = evaluateAchievements(
          {
            result: evaluated,
            hullIntegrity: hull,
            totalCaptures: capturesTotal,
            totalLargeCaptures: largeTotal,
            missionsCompleted: completedCount,
          },
          current
        );
        if (earned.length === 0) return current;
        setToasts(earned);
        const next = new Set(current);
        for (const achievement of earned) next.add(achievement.id);
        return next;
      });
    },
    [mission, targets, captured, mistakes, collisions, bonusPoints, missionsCompleted, totalCaptures, totalLargeCaptures]
  );

  const finishRef = useRef(finishMission);
  useEffect(() => {
    finishRef.current = finishMission;
  }, [finishMission]);

  useEffect(() => {
    if (toasts.length === 0) return;
    const id = window.setTimeout(() => setToasts([]), 4500);
    return () => window.clearTimeout(id);
  }, [toasts]);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (progress >= mission.targetCount) finishRef.current(true);
  }, [phase, progress, mission.targetCount]);

  // Casco a 0: la nave estalla. Se deja correr la animación del pecio antes de
  // pasar a resultados, para que se vea lo que ha ocurrido. El disparo se hace
  // en el bucle de juego, donde el casco llega a 0, no en un efecto.
  useEffect(() => {
    if (phase !== 'playing' || destroyedAt === null) return;
    const id = window.setTimeout(() => finishRef.current(false), DESTRUCTION_MS);
    return () => window.clearTimeout(id);
  }, [phase, destroyedAt]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.setTimeout(() => finishRef.current(false), 0);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  // Deriva de signos vitales una vez por segundo mientras la misión corre.
  useEffect(() => {
    if (!running) return;
    let tick = 0;
    const id = window.setInterval(() => {
      tick += 1;
      setCrew((current) => {
        const wave = Math.sin(tick / 4);
        const next: CrewStatus = {
          ...current,
          heartRateBpm: clamp(current.heartRateBpm + wave * 1.1, 58, 112),
          spo2Percent: clamp(current.spo2Percent + Math.cos(tick / 6) * 0.08, 93, 99),
          fatiguePercent: clamp(current.fatiguePercent + 0.18, 12, 82),
          stressPercent: clamp(current.stressPercent + wave * 0.5, 12, 80),
          focusPercent: clamp(current.focusPercent - 0.1, 30, 96),
        };
        return { ...next, moodLabel: moodFrom(next) };
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let last = performance.now();
    let lastSim = sceneClock.seconds;
    let lastPush = 0;
    let firstFrame = true;

    const loop = () => {
      frame = requestAnimationFrame(loop);
      const now = performance.now();
      const delta = Math.min(0.2, (now - last) / 1000);
      last = now;

      const simSeconds = sceneClock.seconds;
      const simDelta = simSeconds - lastSim;
      lastSim = simSeconds;

      const state = liveStation;
      const keys = keysRef.current;

      state.angleDeg += meanMotionDegPerSec(state.altitudeKm) * simDelta;

      if (MOVEMENT_KEYS.some((key) => keys.has(key))) approachRef.current = false;

      const chase = nearestRef.current;

      // Pilotar hacia el objetivo con una sola tecla. Antes había que componer a mano altitud,
      // plano e inclinación, que es lo que obligaba a depender del piloto automático.
      const steer = (rate: number) => {
        if (!chase) return;
        const gain = 1 - Math.exp(-rate * delta);
        state.altitudeKm += (chase.altitudeKm - state.altitudeKm) * gain;
        state.inclinationDeg += (chase.inclinationDeg - state.inclinationDeg) * gain;
        state.raanDeg += shortestAngleDeg(state.raanDeg, chase.raanDeg) * gain;
        const chaseAngle = currentAngleDeg(chase.phaseDeg, chase.altitudeKm, simSeconds);
        state.angleDeg += shortestAngleDeg(state.angleDeg, chaseAngle) * gain;
      };

      if (keys.has('KeyW')) steer(shipRef.current.steerRate);
      if (keys.has('KeyS')) {
        // Alejarse: separa altitud y fase respecto al objetivo.
        const away = chase && chase.altitudeKm > state.altitudeKm ? -1 : 1;
        state.altitudeKm = clamp(state.altitudeKm + away * 60 * delta, 220, 35786);
        state.angleDeg -= 9 * delta;
      }
      if (keys.has('KeyA')) state.raanDeg = (state.raanDeg - 7 * delta + 360) % 360;
      if (keys.has('KeyD')) state.raanDeg = (state.raanDeg + 7 * delta) % 360;
      if (keys.has('ArrowUp')) state.altitudeKm = Math.min(35786, state.altitudeKm + 85 * delta);
      if (keys.has('ArrowDown')) state.altitudeKm = Math.max(220, state.altitudeKm - 85 * delta);
      if (keys.has('ArrowLeft')) state.angleDeg -= 15 * delta;
      if (keys.has('ArrowRight')) state.angleDeg += 15 * delta;

      if (approachRef.current) steer(shipRef.current.steerRate * 1.5);

      if (dodgeUntilRef.current > now) {
        state.altitudeKm = clamp(state.altitudeKm + dodgeDirRef.current * 170 * delta, 220, 35786);
      }

      orbitalPosition(stationPoint, state.altitudeKm, state.inclinationDeg, state.raanDeg, state.angleDeg);
      if (firstFrame) {
        firstFrame = false;
        prevStationPoint.x = stationPoint.x;
        prevStationPoint.y = stationPoint.y;
        prevStationPoint.z = stationPoint.z;
      }

      let best: OrbitalDebris | null = null;
      let bestDistance = Infinity;
      for (const candidate of activeTargetsRef.current) {
        const angle = currentAngleDeg(candidate.phaseDeg, candidate.altitudeKm, simSeconds);
        orbitalPosition(targetPoint, candidate.altitudeKm, candidate.inclinationDeg, candidate.raanDeg, angle);
        const distance = distanceKm(stationPoint, targetPoint);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = candidate;
        }
      }
      nearestRef.current = best;

      // Distancia mínima de aproximación durante el paso de tiempo. Un test puntual deja pasar los
      // objetos entre frames, y usar la velocidad absoluta sobreestima: lo que importa es el
      // movimiento relativo, que es casi nulo entre objetos de la misma banda.
      const prevSim = simSeconds - simDelta;
      const invulnerable = now < graceUntilRef.current;
      let threat: OrbitalDebris | null = null;
      let threatDistance = Infinity;

      for (const hazard of hazardsRef.current) {
        const lastHit = lastHitRef.current.get(hazard.id) ?? 0;
        if (now - lastHit < HIT_COOLDOWN_MS) continue;

        const angleNow = currentAngleDeg(hazard.phaseDeg, hazard.altitudeKm, simSeconds);
        orbitalPosition(targetPoint, hazard.altitudeKm, hazard.inclinationDeg, hazard.raanDeg, angleNow);
        const x1 = stationPoint.x - targetPoint.x;
        const y1 = stationPoint.y - targetPoint.y;
        const z1 = stationPoint.z - targetPoint.z;

        const anglePrev = currentAngleDeg(hazard.phaseDeg, hazard.altitudeKm, prevSim);
        orbitalPosition(targetPoint, hazard.altitudeKm, hazard.inclinationDeg, hazard.raanDeg, anglePrev);
        const x0 = prevStationPoint.x - targetPoint.x;
        const y0 = prevStationPoint.y - targetPoint.y;
        const z0 = prevStationPoint.z - targetPoint.z;

        const dx = x1 - x0;
        const dy = y1 - y0;
        const dz = z1 - z0;
        const lengthSq = dx * dx + dy * dy + dz * dz;
        const t = lengthSq > 0 ? clamp(-(x0 * dx + y0 * dy + z0 * dz) / lengthSq, 0, 1) : 0;
        const cx = x0 + dx * t;
        const cy = y0 + dy * t;
        const cz = z0 + dz * t;

        const closestSq = cx * cx + cy * cy + cz * cz;

        // Aviso de proximidad: el jugador ve venir el impacto y puede esquivar antes de recibirlo.
        if (closestSq < WARNING_RADIUS_SQ) {
          const closestKm = unitsToKm(Math.sqrt(closestSq));
          if (closestKm < threatDistance) {
            threatDistance = closestKm;
            threat = hazard;
          }
        }

        const profile = shipRef.current.collisionProfile;
        if (closestSq > COLLISION_RADIUS_SQ * profile * profile || invulnerable) continue;

        lastHitRef.current.set(hazard.id, now);
        graceUntilRef.current = now + GRACE_AFTER_HIT_MS;
        const damage =
          HULL_DAMAGE[hazard.sizeClass] *
          (1 + (hazard.resistance - 1) * 0.25) *
          (hazard.type === 'asteroid' ? 1.5 : 1) *
          shipRef.current.damageFactor;

        hullRef.current = Math.max(0, hullRef.current - damage);
        setHullIntegrity(hullRef.current);
        if (hullRef.current <= 0 && destroyedAtRef.current === null) {
          destroyedAtRef.current = now;
          setDestroyedAt(now);
        }
        setCollisions((value) => value + 1);
        setStreak(0);
        streakRef.current = 0;
        setHitFlash(true);
        setCrew((current) => {
          const next: CrewStatus = {
            ...current,
            heartRateBpm: clamp(current.heartRateBpm + 9, 58, 112),
            stressPercent: clamp(current.stressPercent + 8, 12, 80),
            focusPercent: clamp(current.focusPercent - 6, 30, 96),
            spo2Percent: clamp(current.spo2Percent - 0.3, 93, 99),
          };
          return { ...next, moodLabel: moodFrom(next) };
        });
        break;
      }

      threatRef.current = threat;

      prevStationPoint.x = stationPoint.x;
      prevStationPoint.y = stationPoint.y;
      prevStationPoint.z = stationPoint.z;

      if (now - lastPush > 60) {
        lastPush = now;
        setStation({ ...state });
        setThreat((current) => {
          if (!threat) return current === null ? current : null;
          if (current && current.id === threat.id && Math.abs(current.distanceKm - threatDistance) < 15) return current;
          return { id: threat.id, name: threat.name, distanceKm: threatDistance };
        });
        setDodgeReady(now >= dodgeReadyAtRef.current);
        setNearest((current) => {
          if (!best) return current === null ? current : null;
          if (current && current.id === best.id && Math.abs(current.distanceKm - bestDistance) < 3) return current;
          return { id: best.id, name: best.name, distanceKm: bestDistance, points: best.points };
        });
        setApproachEngaged(approachRef.current);
      }
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  const startMission = useCallback(
    (index: number) => {
      const next = MISSIONS[index];
      const picked = selectMissionTargets(next, population);
      const startHull = summarize(loadout, picked[0]?.altitudeKm ?? 500).stats.hull;
      const start = missionStationStart(picked);
      resetStation(start);
      nearestRef.current = null;
      approachRef.current = false;
      hullRef.current = startHull;
      lastHitRef.current.clear();
      missionStartRef.current = performance.now();
      sceneClock.seconds = 0;
      sceneClock.running = true;

      setMissionIndex(index);
      setTargets(picked);
      setHazardCloud(generateHazardCloud(next, picked));
      setCaptured([]);
      setMistakes(0);
      setCollisions(0);
      setHullIntegrity(startHull);
      destroyedAtRef.current = null;
      setDestroyedAt(null);
      setTimeLeft(next.timeLimitSeconds);
      setStation({ ...start });
      setNearest(null);
      setApproachEngaged(false);
      setCapture(null);
      setChallenge(null);
      setStreak(0);
      streakRef.current = 0;
      setBonusPoints(0);
      setPopups([]);
      setHitFlash(false);
      setResult(null);
      setSelectedObjectId(null);
      setCrew(INITIAL_CREW);
      setPaused(false);
      setAttempts((current) => ({ ...current, [next.id]: (current[next.id] ?? 0) + 1 }));
      setPhase('playing');
    },
    [population, loadout]
  );

  const distanceToTarget = useCallback((target: OrbitalDebris) => {
    orbitalPosition(
      stationPoint,
      liveStation.altitudeKm,
      liveStation.inclinationDeg,
      liveStation.raanDeg,
      liveStation.angleDeg
    );
    const targetAngle = currentAngleDeg(target.phaseDeg, target.altitudeKm, sceneClock.seconds);
    orbitalPosition(targetPoint, target.altitudeKm, target.inclinationDeg, target.raanDeg, targetAngle);
    return distanceKm(stationPoint, targetPoint);
  }, []);

  const handleCapture = useCallback(() => {
    if (!running || challenge) return;
    const target = nearestRef.current;
    if (!target || distanceToTarget(target) > shipRef.current.captureRangeKm) {
      setMistakes((value) => value + 1);
      setStreak(0);
      streakRef.current = 0;
      setCrew((current) => ({
        ...current,
        stressPercent: clamp(current.stressPercent + 4, 12, 80),
      }));
      return;
    }

    setChallenge({
      target,
      kinds: pickChallenges(challengeCountFor(mission.difficulty)),
    });
    setCrew((current) => ({
      ...current,
      heartRateBpm: clamp(current.heartRateBpm + 5, 58, 112),
      stressPercent: clamp(current.stressPercent + 3, 12, 80),
    }));
  }, [running, challenge, mission.difficulty, distanceToTarget]);

  const handleChallengeComplete = useCallback(() => {
    const active = challenge;
    setChallenge(null);
    if (!active) return;

    if (distanceToTarget(active.target) > shipRef.current.captureRangeKm) {
      setMistakes((value) => value + 1);
      return;
    }

    setCaptured((current) =>
      current.some((item) => item.id === active.target.id) ? current : [...current, active.target]
    );
    setCapture({ objectId: active.target.id, at: performance.now() });

    // Racha: capturas seguidas sin fallar ni chocar suben el multiplicador.
    const nextStreak = streakRef.current + 1;
    streakRef.current = nextStreak;
    const multiplier = multiplierFor(nextStreak);
    const earned = Math.round(active.target.points * multiplier);
    setStreak(nextStreak);
    popupIdRef.current += 1;
    const popupId = popupIdRef.current;
    setPopups((current) => [...current, { id: popupId, points: earned, multiplier }]);
    window.setTimeout(() => setPopups((current) => current.filter((item) => item.id !== popupId)), 800);
    setBonusPoints((current) => current + (earned - active.target.points));

    // Cada retirada libera masa y permite reparar: la bodega recupera un 5 % de casco.
    hullRef.current = Math.min(100, hullRef.current + 5);
    setHullIntegrity(hullRef.current);

    setCrew((current) => ({
      ...current,
      focusPercent: clamp(current.focusPercent + 5, 30, 96),
      stressPercent: clamp(current.stressPercent - 5, 12, 80),
      heartRateBpm: clamp(current.heartRateBpm - 3, 58, 112),
    }));
  }, [challenge, distanceToTarget]);

  const handleChallengeFail = useCallback(() => {
    setChallenge(null);
    setMistakes((value) => value + 1);
    setStreak(0);
    streakRef.current = 0;
    setCrew((current) => ({
      ...current,
      stressPercent: clamp(current.stressPercent + 7, 12, 80),
      focusPercent: clamp(current.focusPercent - 4, 30, 96),
    }));
  }, []);

  const handleApproach = useCallback(() => {
    if (!running) return;
    approachRef.current = !approachRef.current;
    setApproachEngaged(approachRef.current);
    if (approachRef.current) {
      setCrew((current) => ({
        ...current,
        stressPercent: clamp(current.stressPercent + 3, 12, 80),
        heartRateBpm: clamp(current.heartRateBpm + 3, 58, 112),
      }));
    }
  }, [running]);

  const handleDodge = useCallback(() => {
    if (!running) return;
    const now = performance.now();
    if (now < dodgeReadyAtRef.current) return;

    // Se esquiva alejándose en altitud del objeto que amenaza, lo que rompe la trayectoria.
    const danger = threatRef.current;
    dodgeDirRef.current = danger && danger.altitudeKm > liveStation.altitudeKm ? -1 : 1;
    dodgeUntilRef.current = now + DODGE_DURATION_MS;
    dodgeReadyAtRef.current = now + DODGE_COOLDOWN_MS;
    graceUntilRef.current = Math.max(graceUntilRef.current, now + DODGE_DURATION_MS);
    approachRef.current = false;
    setApproachEngaged(false);
    setDodgeReady(false);
    setCrew((current) => ({
      ...current,
      heartRateBpm: clamp(current.heartRateBpm + 6, 58, 112),
      stressPercent: clamp(current.stressPercent + 4, 12, 80),
    }));
  }, [running]);

  const handleAbort = useCallback(() => {
    if (phase !== 'playing') return;
    finishRef.current(false);
  }, [phase]);

  const togglePause = useCallback(() => {
    setPaused((current) => {
      const next = !current;
      if (phase === 'playing') {
        sceneClock.running = !next;
        if (next) {
          pausedAtRef.current = performance.now();
        } else {
          // El tiempo en pausa no cuenta para el cronómetro de la misión.
          missionStartRef.current += performance.now() - pausedAtRef.current;
        }
      }
      return next;
    });
  }, [phase]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        event.preventDefault();
        if (showTutorial) setShowTutorial(false);
        else togglePause();
        return;
      }
      if (!running) return;
      if (event.code === 'Space') handleCapture();
      if (event.code === 'KeyE') handleApproach();
      if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') handleDodge();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running, showTutorial, handleCapture, handleApproach, handleDodge, togglePause]);

  useEffect(() => {
    if (!capture) return;
    const id = window.setTimeout(() => setCapture(null), 900);
    return () => window.clearTimeout(id);
  }, [capture]);

  useEffect(() => {
    if (!hitFlash) return;
    const id = window.setTimeout(() => setHitFlash(false), 1300);
    return () => window.clearTimeout(id);
  }, [hitFlash]);

  const inRange = nearest !== null && nearest.distanceKm <= ship.captureRangeKm;
  const captureStatus: CaptureStatus = capture
    ? 'capturing'
    : !nearest
      ? 'idle'
      : inRange
        ? 'ready'
        : 'out_of_range';

  const avatarState: AvatarState = hitFlash
    ? 'damage'
    : phase === 'results' && result?.mainObjectiveCompleted
      ? 'celebrate'
      : capture
        ? 'capture'
        : crew.stressPercent >= 62 || hullIntegrity < 35
          ? 'nervous'
          : inRange && running
            ? 'alert'
            : 'idle';

  const handleSelect = useCallback((id: string) => setSelectedObjectId(id === '' ? null : id), []);
  const handleCrewChange = useCallback((next: CrewStatus) => setCrew(next), []);

  return (
    <div className="dashboard">
      <section className="dashboard-stage">
        <OrbitalScene
          objects={visibleObjects}
          selectedObjectId={selectedObjectId}
          onSelectObject={handleSelect}
          missionTargetIds={targetIds}
          nearestTargetId={nearest?.id ?? null}
          nearestInRange={inRange}
          showStation
          capture={captureEvent}
          followStation={phase === 'playing'}
          destroyedAt={destroyedAt}
          quality={quality}
        />

        {destroyedAt !== null ? (
          <div className="destroyed-banner" role="status">
            <p className="destroyed-kicker">CASCO AL 0 %</p>
            <h2>Nave destruida</h2>
            <p className="destroyed-note">
              Los restos quedan en órbita como nueva basura espacial. Así empiezan las cascadas de
              fragmentos que el juego te pide limpiar.
            </p>
          </div>
        ) : null}

        <div className="dashboard-brand">
          <h1>ORBIT-CLEAN X</h1>
        </div>

        <button type="button" className="dashboard-options-button" onClick={togglePause}>
          Opciones · Esc
        </button>

        <PilotConsole
          mission={mission}
          station={station}
          target={nearest}
          captureStatus={captureStatus}
          approachEngaged={approachEngaged}
          progress={progress}
          capturedCount={captured.length}
          cargoCapacity={ship.cargoCapacity}
          mistakes={mistakes}
          capturePoints={capturePoints}
          timeLeft={timeLeft}
          running={running}
          threat={threat}
          dodgeReady={dodgeReady}
          onApproach={handleApproach}
          onCapture={handleCapture}
          onAbort={handleAbort}
          onDodge={handleDodge}
        />

        <VitalsHud
          crew={crew}
          astronautName={astronaut.name}
          hullIntegrity={hullIntegrity}
          collisions={collisions}
          avatarState={avatarState}
        />

        {phase === 'playing' ? (
          <ComboHud
            streak={streak}
            multiplier={multiplierFor(streak)}
            score={capturePoints + bonusPoints}
            popups={popups}
          />
        ) : null}

        {challenge ? (
          <CaptureChallenge
            key={challenge.target.id}
            kinds={challenge.kinds}
            targetName={challenge.target.name}
            onComplete={handleChallengeComplete}
            onFail={handleChallengeFail}
          />
        ) : null}

        {/* Mandos en pantalla: sin ellos el juego es injugable con el dedo. */}
        <TouchControls
          visible={touch && phase === 'playing' && !paused && destroyedAt === null}
          capturing={challenge !== null}
        />

        {hitFlash ? <div className="dashboard-damage" /> : null}

        <AchievementToasts achievements={toasts} />

        {phase === 'briefing' && !showTutorial && !paused ? (
          <MissionBriefing
            mission={mission}
            missions={MISSIONS}
            unlocked={unlocked}
            bestScores={bestScores}
            attempts={attempts[mission.id] ?? 0}
            onSelectMission={setMissionIndex}
            onStart={() => setPhase('design')}
            onShowTutorial={() => setShowTutorial(true)}
          />
        ) : null}

        {phase === 'design' && !showTutorial && !paused ? (
          <MissionDesign
            mission={mission}
            missionAltitudeKm={designAltitudeKm}
            loadout={loadout}
            onChange={setLoadout}
            onLaunch={() => startMission(missionIndex)}
            onBack={() => setPhase('briefing')}
          />
        ) : null}

        {phase === 'results' && result && !paused ? (
          <MissionResults
            result={result}
            hasNextMission={missionIndex + 1 < MISSIONS.length}
            onRetry={() => startMission(missionIndex)}
            onBriefing={() => setPhase('briefing')}
            onNext={() => startMission(Math.min(MISSIONS.length - 1, missionIndex + 1))}
          />
        ) : null}

        {showTutorial ? <Tutorial onClose={() => setShowTutorial(false)} /> : null}

        {paused ? (
          <OptionsMenu
            astronaut={astronaut}
            unlockedAchievements={unlockedAchievements}
            missionRunning={phase === 'playing'}
            qualityLevel={qualityLevel}
            onQualityChange={setQualityLevel}
            crewPanel={<MemoHealthPanel status={crew} onStatusChange={handleCrewChange} />}
            onResume={togglePause}
            onAbort={() => {
              togglePause();
              handleAbort();
            }}
            onShowTutorial={() => {
              togglePause();
              setShowTutorial(true);
            }}
          />
        ) : null}
      </section>
    </div>
  );
}

export default App;

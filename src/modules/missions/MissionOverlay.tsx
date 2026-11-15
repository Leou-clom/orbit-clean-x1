import { ShieldCheck, Target, Timer, Trash2, Trophy, Zap } from 'lucide-react';
import type { MissionDefinition, MissionResult } from '../../types/orbital';
import { StatsCard, StatsGrid } from '../stats/StatsCard';
import './missions.css';

interface BriefingProps {
  mission: MissionDefinition;
  missions: MissionDefinition[];
  unlocked: number;
  bestScores: Record<number, number>;
  attempts: number;
  onSelectMission: (index: number) => void;
  onStart: () => void;
  onShowTutorial: () => void;
}

export function MissionBriefing({
  mission,
  missions,
  unlocked,
  bestScores,
  attempts,
  onSelectMission,
  onStart,
  onShowTutorial,
}: BriefingProps) {
  return (
    <div className="mission-overlay">
      <article className="mission-card">
        <p className="mission-kicker">
          BRIEFING · MISIÓN {mission.id} DE {missions.length}
        </p>
        <h2 className="mission-name">{mission.name}</h2>
        <span className={`mission-rank mission-rank-${mission.difficulty}`}>Dificultad {mission.difficulty}</span>

        <div className="mission-block">
          <h3>Objetivo principal</h3>
          <p>{mission.mainObjective}</p>
        </div>

        <div className="mission-block">
          <h3>Objetivos secundarios (opcionales)</h3>
          <ul>
            {mission.secondaryObjectives.map((objective) => (
              <li key={objective.id}>{objective.label}</li>
            ))}
          </ul>
        </div>

        <div className="mission-meta">
          <span>Tiempo límite: {Math.floor(mission.timeLimitSeconds / 60)} min {mission.timeLimitSeconds % 60}s</span>
          <span>Vidas: 1</span>
          <span>Intentos usados: {attempts}</span>
        </div>

        <div className="mission-block">
          <h3>Selecciona misión</h3>
          <div className="mission-grid">
            {missions.map((item, index) => {
              const locked = index + 1 > unlocked;
              const best = bestScores[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`mission-chip mission-rank-${item.difficulty} ${item.id === mission.id ? 'mission-chip-active' : ''}`}
                  onClick={() => onSelectMission(index)}
                  disabled={locked}
                  title={locked ? 'Bloqueada' : `${item.name} · ${item.mainObjective}`}
                >
                  <span className="mission-chip-id">{locked ? '🔒' : item.id}</span>
                  <span className="mission-chip-rank">{item.difficulty}</span>
                  {best !== undefined ? <span className="mission-chip-best">{best}</span> : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mission-buttons">
          <button type="button" className="mission-button" onClick={onShowTutorial}>
            Ver tutorial
          </button>
          <button type="button" className="mission-button mission-button-primary" onClick={onStart}>
            Iniciar misión
          </button>
        </div>
        <p className="mission-note">
          Las misiones siguientes se desbloquean al completar el objetivo principal de la actual. El número
          pequeño es tu mejor puntaje en esa misión.
        </p>
      </article>
    </div>
  );
}

interface ResultsProps {
  result: MissionResult;
  hasNextMission: boolean;
  onRetry: () => void;
  onNext: () => void;
  onBriefing: () => void;
}

export function MissionResults({ result, hasNextMission, onRetry, onNext, onBriefing }: ResultsProps) {
  return (
    <div className="mission-overlay">
      <article className="mission-card">
        <p className="mission-kicker">RESULTADOS · MISIÓN {result.missionId}</p>
        <h2 className="mission-name">{result.missionName}</h2>
        <p className={`mission-verdict ${result.mainObjectiveCompleted ? 'mission-win' : 'mission-lose'}`}>
          {result.mainObjectiveCompleted ? 'Objetivo principal completado' : 'Objetivo principal no completado'}
        </p>

        <div className="mission-stats-wrap">
          <StatsGrid>
            <StatsCard
              index={0}
              title="Puntaje total"
              value={result.totalScore}
              detail={`Rango de misión ${result.difficulty}`}
              icon={Trophy}
              tone="amber"
            />
            <StatsCard
              index={1}
              title="Objetos retirados"
              value={result.capturedCount}
              detail={`Objetivo: ${result.objectiveProgress}`}
              icon={Trash2}
              tone="green"
            />
            <StatsCard
              index={2}
              title="Tiempo de misión"
              value={`${Math.round(result.elapsedSeconds)} s`}
              detail={result.speedBonus > 0 ? `Bonus +${result.speedBonus}` : 'Sin bonus de rapidez'}
              icon={Timer}
              tone="cyan"
            />
            <StatsCard
              index={3}
              title="Casco restante"
              value={`${Math.round(result.hullIntegrity)} %`}
              detail={`${result.livesRemaining} vida restante`}
              icon={ShieldCheck}
              tone="violet"
            />
            <StatsCard
              index={4}
              title="Impactos recibidos"
              value={result.collisions}
              change={result.collisionPenalty > 0 ? -result.collisionPenalty : undefined}
              icon={Zap}
              tone="rose"
            />
            <StatsCard
              index={5}
              title="Errores de maniobra"
              value={result.mistakes}
              change={result.mistakePenalty > 0 ? -result.mistakePenalty : undefined}
              icon={Target}
              tone="rose"
            />
          </StatsGrid>
        </div>

        <div className="mission-block">
          <h3>Desglose del puntaje</h3>
          <ul className="mission-breakdown">
            <li>
              <span>Capturas</span>
              <span>+{result.capturePoints}</span>
            </li>
            <li>
              <span>Bonus por rapidez</span>
              <span>+{result.speedBonus}</span>
            </li>
            <li>
              <span>Objetivos secundarios</span>
              <span>+{result.secondaryBonus}</span>
            </li>
            <li>
              <span>Penalización por errores de maniobra</span>
              <span>-{result.mistakePenalty}</span>
            </li>
            <li>
              <span>Penalización por impactos</span>
              <span>-{result.collisionPenalty}</span>
            </li>
          </ul>
        </div>

        <div className="mission-block">
          <h3>Objetivos secundarios</h3>
          <ul>
            {result.secondaryOutcomes.map((outcome) => (
              <li key={outcome.id} className={outcome.completed ? 'mission-done' : 'mission-missed'}>
                {outcome.completed ? '✓' : '✕'} {outcome.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="mission-buttons">
          <button type="button" className="mission-button" onClick={onBriefing}>
            Ver misiones
          </button>
          <button type="button" className="mission-button" onClick={onRetry}>
            Reintentar
          </button>
          <button
            type="button"
            className="mission-button mission-button-primary"
            onClick={onNext}
            disabled={!result.mainObjectiveCompleted || !hasNextMission}
          >
            Siguiente misión
          </button>
        </div>
        <p className="mission-note">
          El rango de dificultad describe la misión, no el desempeño del jugador. Todas las cifras salen del
          juego real de esta partida.
        </p>
      </article>
    </div>
  );
}

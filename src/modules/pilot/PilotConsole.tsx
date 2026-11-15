import type { MissionDefinition } from '../../types/orbital';
import type { StationState } from '../orbital/types';
import './pilot-console.css';

export type CaptureStatus = 'idle' | 'out_of_range' | 'ready' | 'capturing';

interface PilotConsoleProps {
  mission: MissionDefinition;
  station: StationState;
  target: { name: string; distanceKm: number; points: number } | null;
  captureStatus: CaptureStatus;
  approachEngaged: boolean;
  progress: number;
  capturedCount: number;
  cargoCapacity: number;
  mistakes: number;
  capturePoints: number;
  timeLeft: number;
  running: boolean;
  threat: { name: string; distanceKm: number } | null;
  dodgeReady: boolean;
  onApproach: () => void;
  onCapture: () => void;
  onAbort: () => void;
  onDodge: () => void;
}

const STATUS_LABEL: Record<CaptureStatus, string> = {
  idle: 'Sin objetivo',
  out_of_range: 'Fuera de alcance',
  ready: 'Listo para capturar',
  capturing: 'Capturando',
};

function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safe / 60);
  return `${minutes}:${String(safe % 60).padStart(2, '0')}`;
}

export function PilotConsole({
  mission,
  station,
  target,
  captureStatus,
  approachEngaged,
  progress,
  capturedCount,
  cargoCapacity,
  mistakes,
  capturePoints,
  timeLeft,
  running,
  threat,
  dodgeReady,
  onApproach,
  onCapture,
  onAbort,
  onDodge,
}: PilotConsoleProps) {
  const progressPercent = Math.min(100, (progress / mission.targetCount) * 100);
  const cargoPercent = Math.min(100, (capturedCount / cargoCapacity) * 100);
  const timePercent = Math.min(100, (timeLeft / mission.timeLimitSeconds) * 100);

  return (
    <section className="pilot-console" aria-label="Consola de pilotaje">
      <header className="pilot-header">
        <div>
          <p className="pilot-kicker">MISIÓN {mission.id} · RANGO {mission.difficulty}</p>
          <h2 className="pilot-title">{mission.name}</h2>
        </div>
        <div className={`pilot-timer ${timeLeft <= 20 ? 'pilot-timer-critical' : ''}`}>{formatTime(timeLeft)}</div>
      </header>

      <p className="pilot-objective">{mission.mainObjective}</p>

      <div className="pilot-gauges">
        <div className="pilot-gauge">
          <span className="pilot-gauge-label">Progreso de misión</span>
          <div className="pilot-bar">
            <div className="pilot-bar-fill pilot-bar-progress" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="pilot-gauge-value">
            {progress} / {mission.targetCount}
          </span>
        </div>

        <div className="pilot-gauge">
          <span className="pilot-gauge-label">Tiempo restante</span>
          <div className="pilot-bar">
            <div className="pilot-bar-fill pilot-bar-time" style={{ width: `${timePercent}%` }} />
          </div>
          <span className="pilot-gauge-value">{formatTime(timeLeft)}</span>
        </div>

        <div className="pilot-gauge">
          <span className="pilot-gauge-label">Bodega de carga</span>
          <div className="pilot-bar">
            <div className="pilot-bar-fill pilot-bar-cargo" style={{ width: `${cargoPercent}%` }} />
          </div>
          <span className="pilot-gauge-value">
            {capturedCount} / {cargoCapacity}
          </span>
        </div>
      </div>

      <div className="pilot-readouts">
        <div className="pilot-readout">
          <span>Objetivo</span>
          <strong>{target ? target.name : '—'}</strong>
        </div>
        <div className="pilot-readout">
          <span>Distancia</span>
          <strong>{target ? `${Math.round(target.distanceKm)} km` : '—'}</strong>
        </div>
        <div className="pilot-readout">
          <span>Altitud estación</span>
          <strong>{Math.round(station.altitudeKm)} km</strong>
        </div>
        <div className="pilot-readout">
          <span>Inclinación</span>
          <strong>{station.inclinationDeg.toFixed(1)}°</strong>
        </div>
        <div className="pilot-readout">
          <span>Errores</span>
          <strong>{mistakes}</strong>
        </div>
        <div className="pilot-readout">
          <span>Puntos de captura</span>
          <strong>{capturePoints}</strong>
        </div>
      </div>

      <p className={`pilot-status pilot-status-${captureStatus}`}>{STATUS_LABEL[captureStatus]}</p>

      {threat ? (
        <p className="pilot-threat">
          ⚠ Proximidad: <strong>{threat.name}</strong> a {Math.round(threat.distanceKm)} km
        </p>
      ) : null}

      <div className="pilot-actions">
        <button
          type="button"
          className={`pilot-button ${approachEngaged ? 'pilot-button-active' : ''}`}
          onClick={onApproach}
          disabled={!running}
        >
          Aproximación <kbd>E</kbd>
        </button>
        <button
          type="button"
          className="pilot-button pilot-button-capture"
          onClick={onCapture}
          disabled={!running}
        >
          Capturar <kbd>Espacio</kbd>
        </button>
        <button
          type="button"
          className={`pilot-button pilot-button-dodge ${threat && dodgeReady ? 'pilot-button-urgent' : ''}`}
          onClick={onDodge}
          disabled={!running || !dodgeReady}
        >
          {dodgeReady ? 'Esquivar' : 'Recargando'} <kbd>Shift</kbd>
        </button>
        <button type="button" className="pilot-button pilot-button-abort" onClick={onAbort} disabled={!running}>
          Abortar <kbd>Esc</kbd>
        </button>
      </div>

      <p className="pilot-help">
        <kbd>W</kbd> ir · <kbd>S</kbd> alejar · <kbd>A</kbd><kbd>D</kbd> plano · <kbd>↑↓</kbd> altitud ·{' '}
        <kbd>←→</kbd> fase
      </p>
    </section>
  );
}

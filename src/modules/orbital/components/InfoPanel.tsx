import type { OrbitalRenderData } from '../types';
import { orbitalPeriodSeconds } from '../../../lib/orbitalMath';

interface InfoPanelProps {
  selected: OrbitalRenderData;
  isTarget: boolean;
  onClose: () => void;
}

const SIZE_LABELS: Record<string, string> = {
  small: 'pequeño',
  medium: 'mediano',
  large: 'grande',
};

export function InfoPanel({ selected, isTarget, onClose }: InfoPanelProps) {
  const periodMinutes = orbitalPeriodSeconds(selected.altitudeKm) / 60;

  return (
    <aside className="orbital-info-panel">
      <button type="button" className="orbital-info-close" onClick={onClose} aria-label="Cerrar ficha">
        ✕
      </button>
      <h2 className="orbital-info-title">{selected.label}</h2>
      {isTarget ? <p className="orbital-info-badge">Objetivo de misión</p> : null}
      {selected.special ? <p className="orbital-info-badge orbital-info-badge-special">Objeto crítico</p> : null}

      <dl className="orbital-info-list">
        <div>
          <dt>Tipo</dt>
          <dd>{selected.typeLabel}</dd>
        </div>
        <div>
          <dt>Tamaño</dt>
          <dd>{SIZE_LABELS[selected.sizeClass]}</dd>
        </div>
        <div>
          <dt>Resistencia</dt>
          <dd>{selected.resistance} / 3</dd>
        </div>
        <div>
          <dt>Altitud</dt>
          <dd>{Math.round(selected.altitudeKm)} km</dd>
        </div>
        <div>
          <dt>Inclinación</dt>
          <dd>{selected.inclinationDeg.toFixed(1)}°</dd>
        </div>
        <div>
          <dt>Velocidad orbital</dt>
          <dd>{selected.speedKms.toFixed(2)} km/s</dd>
        </div>
        <div>
          <dt>Periodo</dt>
          <dd>{periodMinutes.toFixed(1)} min</dd>
        </div>
        <div>
          <dt>Puntos</dt>
          <dd>{selected.points}</dd>
        </div>
      </dl>

      <p className="orbital-info-band">{selected.bandLabel}</p>
    </aside>
  );
}

import { motion } from 'framer-motion';
import { AlertTriangle, Battery, Coins, Rocket, Weight } from 'lucide-react';
import {
  BUDGET_M,
  LAUNCHERS,
  SLOT_LABELS,
  SLOT_ORDER,
  partsFor,
  summarize,
  type Loadout,
  type PartSlot,
} from '../../data/shipParts';
import type { MissionDefinition } from '../../types/orbital';
import './mission-design.css';

interface MissionDesignProps {
  mission: MissionDefinition;
  missionAltitudeKm: number;
  loadout: Loadout;
  onChange: (loadout: Loadout) => void;
  onLaunch: () => void;
  onBack: () => void;
}

export function MissionDesign({
  mission,
  missionAltitudeKm,
  loadout,
  onChange,
  onLaunch,
  onBack,
}: MissionDesignProps) {
  const design = summarize(loadout, missionAltitudeKm);
  const { stats } = design;

  const pick = (slot: PartSlot, id: string) => onChange({ ...loadout, [slot]: id });

  const massPercent = (design.massKg / design.launcher.maxMassKg) * 100;
  const powerPercent = design.netPowerW >= 0 ? 100 : 0;
  const costPercent = (design.costM / BUDGET_M) * 100;

  return (
    <div className="design-overlay">
      <section className="design-panel">
        <header className="design-header">
          <div>
            <p className="design-kicker">
              DISEÑO DE MISIÓN {mission.id} · ZONA DE TRABAJO A {Math.round(missionAltitudeKm)} KM
            </p>
            <h2>{mission.name}</h2>
            <p className="design-objective">{mission.mainObjective}</p>
          </div>
        </header>

        <div className="design-resources">
          <div className={`design-resource ${design.massKg > design.launcher.maxMassKg ? 'design-bad' : ''}`}>
            <Weight size={16} strokeWidth={1.8} />
            <div>
              <span>Masa</span>
              <strong>
                {design.massKg} / {design.launcher.maxMassKg} kg
              </strong>
            </div>
            <div className="design-bar">
              <div className="design-bar-fill" style={{ width: `${Math.min(100, massPercent)}%` }} />
            </div>
          </div>

          <div className={`design-resource ${design.netPowerW < 0 ? 'design-bad' : ''}`}>
            <Battery size={16} strokeWidth={1.8} />
            <div>
              <span>Potencia</span>
              <strong>{design.netPowerW >= 0 ? `+${design.netPowerW} W` : `${design.netPowerW} W`}</strong>
            </div>
            <div className="design-bar">
              <div className="design-bar-fill" style={{ width: `${powerPercent}%` }} />
            </div>
          </div>

          <div className={`design-resource ${design.costM > BUDGET_M ? 'design-bad' : ''}`}>
            <Coins size={16} strokeWidth={1.8} />
            <div>
              <span>Presupuesto</span>
              <strong>
                {design.costM} / {BUDGET_M} M€
              </strong>
            </div>
            <div className="design-bar">
              <div className="design-bar-fill" style={{ width: `${Math.min(100, costPercent)}%` }} />
            </div>
          </div>
        </div>

        <div className="design-slots">
          {SLOT_ORDER.map((slot) => (
            <div key={slot} className="design-slot">
              <h3>{SLOT_LABELS[slot]}</h3>
              <div className="design-options">
                {partsFor(slot).map((part) => (
                  <button
                    key={part.id}
                    type="button"
                    className={part.id === loadout[slot] ? 'design-option design-option-active' : 'design-option'}
                    onClick={() => pick(slot, part.id)}
                  >
                    <strong>{part.name}</strong>
                    <span>{part.summary}</span>
                    <small>
                      {part.massKg} kg · {part.powerW >= 0 ? `+${part.powerW}` : part.powerW} W · {part.costM} M€
                    </small>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="design-slot">
            <h3>Lanzador</h3>
            <div className="design-options">
              {LAUNCHERS.map((launcher) => (
                <button
                  key={launcher.id}
                  type="button"
                  className={
                    launcher.id === loadout.launcher ? 'design-option design-option-active' : 'design-option'
                  }
                  onClick={() => onChange({ ...loadout, launcher: launcher.id })}
                >
                  <strong>{launcher.name}</strong>
                  <span>{launcher.summary}</span>
                  <small>{launcher.costM} M€</small>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="design-preview">
          <p className="design-preview-title">Cómo volará esta nave</p>
          <ul>
            <li>Alcance de captura <strong>{stats.captureRangeKm} km</strong></li>
            <li>Casco inicial <strong>{stats.hull} %</strong></li>
            <li>Daño recibido <strong>×{stats.damageFactor.toFixed(2)}</strong></li>
            <li>Superficie expuesta <strong>×{stats.collisionProfile.toFixed(2)}</strong></li>
            <li>Bodega <strong>{stats.cargoCapacity}</strong></li>
            <li>Maniobra de captura <strong>×{stats.maneuverSpeed.toFixed(2)}</strong></li>
          </ul>
        </div>

        {design.issues.length > 0 ? (
          <motion.ul className="design-issues" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            {design.issues.map((issue) => (
              <li key={issue}>
                <AlertTriangle size={15} strokeWidth={2} /> {issue}
              </li>
            ))}
          </motion.ul>
        ) : null}

        <footer className="design-footer">
          <button type="button" className="design-button" onClick={onBack}>
            Volver
          </button>
          <button
            type="button"
            className="design-button design-button-primary"
            onClick={onLaunch}
            disabled={!design.valid}
          >
            <Rocket size={16} strokeWidth={2} />
            {design.valid ? 'Lanzar misión' : 'Diseño no viable'}
          </button>
        </footer>
      </section>
    </div>
  );
}

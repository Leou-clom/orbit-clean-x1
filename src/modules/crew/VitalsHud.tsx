import type { CrewStatus } from '../../types/orbital';
import { AstronautAvatar, type AvatarState } from './AstronautAvatar';
import './crew-hud.css';

interface VitalsHudProps {
  crew: CrewStatus;
  astronautName: string;
  hullIntegrity: number;
  collisions: number;
  avatarState: AvatarState;
}

interface Vital {
  key: string;
  label: string;
  value: string;
  percent: number;
  warn: boolean;
  tone: 'heart' | 'oxygen' | 'stress' | 'focus' | 'fatigue' | 'hull';
}

export function VitalsHud({ crew, astronautName, hullIntegrity, collisions, avatarState }: VitalsHudProps) {
  const vitals: Vital[] = [
    {
      key: 'hull',
      label: 'Casco',
      value: `${Math.round(hullIntegrity)} %`,
      percent: hullIntegrity,
      warn: hullIntegrity <= 35,
      tone: 'hull',
    },
    {
      key: 'heart',
      label: 'Pulso',
      value: `${Math.round(crew.heartRateBpm)} bpm`,
      percent: ((crew.heartRateBpm - 58) / 54) * 100,
      warn: crew.heartRateBpm >= 105,
      tone: 'heart',
    },
    {
      key: 'spo2',
      label: 'Oxígeno',
      value: `${crew.spo2Percent.toFixed(1)} %`,
      percent: (crew.spo2Percent - 90) * 10,
      warn: crew.spo2Percent <= 95,
      tone: 'oxygen',
    },
    {
      key: 'stress',
      label: 'Estrés',
      value: `${Math.round(crew.stressPercent)} %`,
      percent: crew.stressPercent,
      warn: crew.stressPercent >= 62,
      tone: 'stress',
    },
    {
      key: 'focus',
      label: 'Concentración',
      value: `${Math.round(crew.focusPercent)} %`,
      percent: crew.focusPercent,
      warn: crew.focusPercent <= 42,
      tone: 'focus',
    },
    {
      key: 'fatigue',
      label: 'Fatiga',
      value: `${Math.round(crew.fatiguePercent)} %`,
      percent: crew.fatiguePercent,
      warn: crew.fatiguePercent >= 68,
      tone: 'fatigue',
    },
  ];

  return (
    <div className={`crew-hud ${avatarState === 'damage' ? 'crew-hud-hit' : ''}`}>
      <AstronautAvatar state={avatarState} name={astronautName} moodLabel={crew.moodLabel} />

      <ul className="vitals-list">
        {vitals.map((vital) => (
          <li key={vital.key} className={`vital vital-${vital.tone} ${vital.warn ? 'vital-warn' : ''}`}>
            <span className="vital-label">{vital.label}</span>
            <span className="vital-value">{vital.value}</span>
            <span className="vital-track">
              <span className="vital-fill" style={{ width: `${Math.max(0, Math.min(100, vital.percent))}%` }} />
            </span>
          </li>
        ))}
      </ul>

      <p className="crew-hud-impacts">
        Impactos recibidos: <strong>{collisions}</strong>
        <span className="crew-hud-live">
          <span className="crew-hud-pulse" /> 1 s
        </span>
      </p>
    </div>
  );
}

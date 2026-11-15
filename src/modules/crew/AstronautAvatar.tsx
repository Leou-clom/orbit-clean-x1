import './crew-hud.css';

export type AvatarState = 'idle' | 'alert' | 'nervous' | 'damage' | 'capture' | 'celebrate';

interface AstronautAvatarProps {
  state: AvatarState;
  name: string;
  moodLabel: string;
}

const STATE_CAPTION: Record<AvatarState, string> = {
  idle: 'Respiración estable',
  alert: 'Objetivo a tiro',
  nervous: 'Nervioso, pulso alto',
  damage: 'Impacto recibido',
  capture: 'Captura confirmada',
  celebrate: 'Misión completada',
};

export function AstronautAvatar({ state, name, moodLabel }: AstronautAvatarProps) {
  return (
    <figure className={`avatar avatar-${state}`}>
      <svg viewBox="0 0 120 130" className="avatar-svg" role="img" aria-label={`${name}: ${STATE_CAPTION[state]}`}>
        <ellipse cx="60" cy="124" rx="34" ry="5" fill="rgba(62,224,255,0.12)" />

        <g className="avatar-body">
          <rect x="34" y="66" width="52" height="48" rx="18" fill="#e8eef5" stroke="#9fb6c9" strokeWidth="2" />
          <rect x="46" y="78" width="28" height="18" rx="4" fill="#0d2233" stroke="#3ee0ff" strokeWidth="1.5" />
          <circle className="avatar-chest-light" cx="54" cy="87" r="2.6" fill="#3dff9a" />
          <circle className="avatar-chest-light avatar-chest-light-alt" cx="66" cy="87" r="2.6" fill="#ff8a3d" />

          <g className="avatar-arm avatar-arm-left">
            <rect x="18" y="70" width="18" height="34" rx="9" fill="#e8eef5" stroke="#9fb6c9" strokeWidth="2" />
          </g>
          <g className="avatar-arm avatar-arm-right">
            <rect x="84" y="70" width="18" height="34" rx="9" fill="#e8eef5" stroke="#9fb6c9" strokeWidth="2" />
          </g>

          <g className="avatar-head">
            <circle cx="60" cy="42" r="30" fill="#f1f6fa" stroke="#9fb6c9" strokeWidth="2" />
            <circle className="avatar-visor" cx="60" cy="42" r="23" fill="#0b1b2b" />
            <path d="M44 34 Q52 26 64 27" stroke="rgba(255,255,255,0.55)" strokeWidth="4" fill="none" strokeLinecap="round" />
            <g className="avatar-face">
              <g className="avatar-eyes">
                <circle className="avatar-eye" cx="52" cy="42" r="3.2" fill="#9ff0ff" />
                <circle className="avatar-eye" cx="68" cy="42" r="3.2" fill="#9ff0ff" />
              </g>
              <path className="avatar-mouth" d="M53 52 Q60 56 67 52" stroke="#9ff0ff" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>
            <circle className="avatar-sweat" cx="78" cy="34" r="3" fill="#7fdbff" />
          </g>
        </g>

        <g className="avatar-impact">
          <path d="M18 24 L30 36 M24 18 L36 30" stroke="#ff8a3d" strokeWidth="3" strokeLinecap="round" />
          <path d="M102 24 L90 36 M96 18 L84 30" stroke="#ff8a3d" strokeWidth="3" strokeLinecap="round" />
        </g>

        <g className="avatar-sparkles">
          <path d="M22 50 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5z" fill="#ffd15c" />
          <path d="M98 44 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#3dff9a" />
        </g>
      </svg>

      <figcaption className="avatar-caption">
        <strong className="avatar-name">{name}</strong>
        <span className="avatar-mood">{moodLabel}</span>
        <span className="avatar-state">{STATE_CAPTION[state]}</span>
      </figcaption>
    </figure>
  );
}

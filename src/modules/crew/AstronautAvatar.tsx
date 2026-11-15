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
        <defs>
          <linearGradient id="suit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#eaeaea" />
            <stop offset="100%" stopColor="#c4c4c4" />
          </linearGradient>
          <linearGradient id="visor" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#8a6a1f" />
            <stop offset="45%" stopColor="#3d2f10" />
            <stop offset="100%" stopColor="#1a1407" />
          </linearGradient>
          <linearGradient id="pack" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#adadad" />
            <stop offset="100%" stopColor="#797979" />
          </linearGradient>
        </defs>

        <ellipse cx="60" cy="125" rx="33" ry="4.5" fill="rgba(62,224,255,0.1)" />

        <g className="avatar-body">
          {/* Mochila de soporte vital, detrás del torso */}
          <rect x="30" y="62" width="60" height="42" rx="12" fill="url(#pack)" stroke="#616161" strokeWidth="1.5" />
          <rect x="36" y="66" width="10" height="20" rx="3" fill="#565656" />
          <rect x="74" y="66" width="10" height="20" rx="3" fill="#565656" />

          {/* Torso del traje */}
          <path
            d="M38 70 Q38 62 46 61 L74 61 Q82 62 82 70 L83 102 Q83 112 73 113 L47 113 Q37 112 37 102 Z"
            fill="url(#suit)"
            stroke="#a1a1a1"
            strokeWidth="1.8"
          />
          {/* Pliegues del traje */}
          <path d="M44 88 H76 M44 95 H76" stroke="#cdcdcd" strokeWidth="1.4" fill="none" />

          {/* Módulo de control en el pecho */}
          <rect x="48" y="70" width="24" height="15" rx="3" fill="#202020" stroke="#8c8c8c" strokeWidth="1.2" />
          <circle className="avatar-chest-light" cx="54" cy="77" r="2.3" fill="#3dff9a" />
          <circle className="avatar-chest-light avatar-chest-light-alt" cx="61" cy="77" r="2.3" fill="#ff8a3d" />
          <rect x="65" y="74" width="5" height="6" rx="1" fill="#b3b3b3" opacity="0.8" />

          {/* Manguera de oxígeno */}
          <path d="M40 74 Q30 80 33 92" stroke="#9a9a9a" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* Brazos con articulación y guante */}
          <g className="avatar-arm avatar-arm-left">
            <rect x="19" y="68" width="17" height="33" rx="8.5" fill="url(#suit)" stroke="#a1a1a1" strokeWidth="1.6" />
            <path d="M21 80 H34" stroke="#cdcdcd" strokeWidth="1.3" />
            <circle cx="27.5" cy="102" r="7" fill="#dfdfdf" stroke="#a1a1a1" strokeWidth="1.5" />
          </g>
          <g className="avatar-arm avatar-arm-right">
            <rect x="84" y="68" width="17" height="33" rx="8.5" fill="url(#suit)" stroke="#a1a1a1" strokeWidth="1.6" />
            <path d="M86 80 H99" stroke="#cdcdcd" strokeWidth="1.3" />
            <circle cx="92.5" cy="102" r="7" fill="#dfdfdf" stroke="#a1a1a1" strokeWidth="1.5" />
          </g>

          {/* Casco */}
          <g className="avatar-head">
            <circle cx="60" cy="40" r="29" fill="url(#suit)" stroke="#a1a1a1" strokeWidth="2" />
            <circle cx="60" cy="40" r="29" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.7" />
            {/* Cuello del casco */}
            <rect x="46" y="62" width="28" height="7" rx="3" fill="#bababa" stroke="#909090" strokeWidth="1" />

            {/* Visor dorado */}
            <ellipse className="avatar-visor" cx="60" cy="40" rx="22" ry="20" fill="url(#visor)" />
            {/* Reflejo del visor */}
            <path
              d="M45 30 Q52 22 64 23 Q54 27 49 37 Z"
              fill="rgba(255,255,255,0.4)"
            />
            <path d="M72 47 Q76 40 74 32" stroke="rgba(255,255,255,0.22)" strokeWidth="3" fill="none" strokeLinecap="round" />

            {/* Cara tras el visor */}
            <g className="avatar-face">
              <g className="avatar-eyes">
                <circle className="avatar-eye" cx="53" cy="39" r="2.9" fill="#dfdfdf" />
                <circle className="avatar-eye" cx="67" cy="39" r="2.9" fill="#dfdfdf" />
              </g>
              <path className="avatar-mouth" d="M54 49 Q60 53 66 49" stroke="#dfdfdf" strokeWidth="1.9" fill="none" strokeLinecap="round" />
            </g>

            {/* Luces del casco */}
            <rect x="34" y="31" width="5" height="11" rx="2.5" fill="#e6e6e6" stroke="#909090" strokeWidth="1" />
            <rect x="81" y="31" width="5" height="11" rx="2.5" fill="#e6e6e6" stroke="#909090" strokeWidth="1" />
            <circle className="avatar-sweat" cx="76" cy="30" r="2.8" fill="#c4c4c4" />
          </g>
        </g>

        <g className="avatar-impact">
          <path d="M16 26 L28 38 M22 20 L34 32" stroke="#ff8a3d" strokeWidth="3" strokeLinecap="round" />
          <path d="M104 26 L92 38 M98 20 L86 32" stroke="#ff8a3d" strokeWidth="3" strokeLinecap="round" />
        </g>

        <g className="avatar-sparkles">
          <path d="M20 52 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5z" fill="#ffd15c" />
          <path d="M100 46 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#3dff9a" />
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

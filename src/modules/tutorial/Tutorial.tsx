import { useState } from 'react';
import './tutorial.css';

interface TutorialStep {
  title: string;
  body: string;
  hint: string;
}

const STEPS: TutorialStep[] = [
  {
    title: 'Eres el piloto de la estación',
    body: 'Pilotas una estación de servicio orbital con un brazo robótico. Tu trabajo es retirar basura espacial y asteroides de la órbita baja terrestre.',
    hint: 'La estación arranca cada misión dentro de la zona de trabajo asignada.',
  },
  {
    title: 'Los objetivos brillan',
    body: 'Los objetos de la misión se ven más grandes y luminosos que el resto del campo. El anillo naranja marca el objetivo más cercano; se pone verde cuando lo tienes a tiro.',
    hint: 'Haz clic en cualquier objeto para ver su altitud, velocidad y banda orbital reales.',
  },
  {
    title: 'Vuela tú mismo hasta la basura',
    body: 'Mantén W para volar hacia el objetivo marcado y S para alejarte. Con A/D giras el plano orbital, con ↑/↓ cambias la altitud y con ←/→ te adelantas o retrasas en la órbita.',
    hint: 'Si prefieres que la nave lo haga sola, E activa el piloto automático. Es opcional.',
  },
  {
    title: 'Capturar lleva su maniobra',
    body: 'Cuando el indicador diga LISTO PARA CAPTURAR, pulsa Espacio y aparecerá una maniobra que debes superar: sincronía, estabilización, secuencia del brazo o cierre de pinza.',
    hint: 'Cada captura recupera un 5 % de casco. Capturar fuera de alcance cuenta como error.',
  },
  {
    title: 'Esquiva antes de que te golpeen',
    body: 'Chocar con basura o asteroides que no son tu objetivo daña el casco. Antes de cada impacto verás una alerta naranja de proximidad: pulsa Shift para hacer una maniobra evasiva.',
    hint: 'Tras un golpe tienes unos segundos de margen. Si el casco llega a 0, la misión fracasa.',
  },
  {
    title: 'Vigila a tu tripulante',
    body: 'Abajo a la izquierda tienes al astronauta y sus signos vitales. Si lo ves temblando y sudando, su estrés está alto o el casco está comprometido.',
    hint: 'Las cifras de salud son sintéticas para el juego, no mediciones médicas.',
  },
];

interface TutorialProps {
  onClose: () => void;
}

export function Tutorial({ onClose }: TutorialProps) {
  const [index, setIndex] = useState(0);
  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  return (
    <div className="tutorial-overlay">
      <article className="tutorial-card">
        <p className="tutorial-kicker">
          TUTORIAL · PASO {index + 1} DE {STEPS.length}
        </p>
        <h2>{step.title}</h2>
        <p className="tutorial-body">{step.body}</p>
        <p className="tutorial-hint">{step.hint}</p>

        <div className="tutorial-dots" aria-hidden="true">
          {STEPS.map((item, dotIndex) => (
            <span key={item.title} className={dotIndex === index ? 'tutorial-dot tutorial-dot-active' : 'tutorial-dot'} />
          ))}
        </div>

        <div className="tutorial-buttons">
          <button type="button" className="tutorial-button" onClick={onClose}>
            Saltar
          </button>
          <button
            type="button"
            className="tutorial-button"
            onClick={() => setIndex((current) => Math.max(0, current - 1))}
            disabled={index === 0}
          >
            Atrás
          </button>
          <button
            type="button"
            className="tutorial-button tutorial-button-primary"
            onClick={() => (isLast ? onClose() : setIndex((current) => current + 1))}
          >
            {isLast ? 'Empezar' : 'Siguiente'}
          </button>
        </div>
      </article>
    </div>
  );
}

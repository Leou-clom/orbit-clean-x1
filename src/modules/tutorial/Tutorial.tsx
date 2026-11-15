import { useState } from 'react';
import './tutorial.css';

interface TutorialStep {
  title: string;
  body: string;
}

const STEPS: TutorialStep[] = [
  {
    title: 'Vuela hasta la basura',
    body: 'Mantén W para ir al objetivo marcado. S te aleja.',
  },
  {
    title: 'Captura con Espacio',
    body: 'Cuando el indicador esté verde, pulsa Espacio y supera la maniobra.',
  },
  {
    title: 'Esquiva con Shift',
    body: 'Si salta la alerta naranja de proximidad, pulsa Shift o perderás casco.',
  },
  {
    title: 'Encadena capturas',
    body: 'Capturas seguidas sin fallar suben el multiplicador de puntos.',
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

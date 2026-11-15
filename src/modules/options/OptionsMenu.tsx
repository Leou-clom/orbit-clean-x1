import { useState, type ReactNode } from 'react';
import type { AstronautProfile } from '../../data/astronauts';
import { AchievementsPanel } from '../achievements/AchievementsPanel';
import { QUALITY, type QualityLevel } from '../../lib/quality';
import './options.css';

type Tab = 'logros' | 'tripulacion' | 'rendimiento' | 'ayuda';

const LEVELS: QualityLevel[] = ['bajo', 'medio', 'alto'];

interface OptionsMenuProps {
  astronaut: AstronautProfile;
  unlockedAchievements: Set<string>;
  missionRunning: boolean;
  qualityLevel: QualityLevel;
  onQualityChange: (level: QualityLevel) => void;
  crewPanel: ReactNode;
  onResume: () => void;
  onAbort: () => void;
  onShowTutorial: () => void;
}

export function OptionsMenu({
  astronaut,
  unlockedAchievements,
  missionRunning,
  qualityLevel,
  onQualityChange,
  crewPanel,
  onResume,
  onAbort,
  onShowTutorial,
}: OptionsMenuProps) {
  const [tab, setTab] = useState<Tab>('logros');

  return (
    <div className="options-overlay">
      <section className="options-panel">
        <header className="options-header">
          <div>
            <p className="options-kicker">OPCIONES · SIMULACIÓN EN PAUSA</p>
            <h2>{astronaut.name}</h2>
            <p className="options-credit">
              {astronaut.agency} · {astronaut.credit}
            </p>
          </div>
          <button type="button" className="options-close" onClick={onResume} aria-label="Reanudar">
            ✕
          </button>
        </header>

        <nav className="options-tabs">
          <button type="button" className={tab === 'logros' ? 'options-tab options-tab-active' : 'options-tab'} onClick={() => setTab('logros')}>
            Logros
          </button>
          <button type="button" className={tab === 'tripulacion' ? 'options-tab options-tab-active' : 'options-tab'} onClick={() => setTab('tripulacion')}>
            Tripulación
          </button>
          <button type="button" className={tab === 'rendimiento' ? 'options-tab options-tab-active' : 'options-tab'} onClick={() => setTab('rendimiento')}>
            Rendimiento
          </button>
          <button type="button" className={tab === 'ayuda' ? 'options-tab options-tab-active' : 'options-tab'} onClick={() => setTab('ayuda')}>
            Ayuda
          </button>
        </nav>

        <div className="options-content">
          {tab === 'logros' ? <AchievementsPanel unlocked={unlockedAchievements} /> : null}
          {tab === 'tripulacion' ? crewPanel : null}
          {tab === 'rendimiento' ? (
            <div className="options-help">
              <h3>Calidad gráfica</h3>
              <div className="options-levels">
                {LEVELS.map((level) => {
                  const settings = QUALITY[level];
                  return (
                    <button
                      key={level}
                      type="button"
                      className={level === qualityLevel ? 'options-level options-level-active' : 'options-level'}
                      onClick={() => onQualityChange(level)}
                    >
                      <strong>{settings.label}</strong>
                      <span>{settings.description}</span>
                      <small>
                        {settings.debrisCount} objetos · {settings.detailedModels ? 'modelos detallados' : 'solo geometría simple'}
                      </small>
                    </button>
                  );
                })}
              </div>
              <p>
                El campo de basura se dibuja con instancias: cientos de objetos caben en cuatro llamadas de
                dibujo. Los modelos detallados de NASA solo se cargan para la nave y para el objeto que
                tengas fijado, nunca para todo el campo.
              </p>
              <p>Cambiar la calidad regenera el campo y reinicia la misión en curso.</p>
            </div>
          ) : null}
          {tab === 'ayuda' ? (
            <div className="options-help">
              <h3>Controles</h3>
              <ul>
                <li><kbd>W</kbd> / <kbd>S</kbd> subir o bajar la altitud de la estación</li>
                <li><kbd>A</kbd> / <kbd>D</kbd> girar el plano orbital</li>
                <li><kbd>←</kbd> / <kbd>→</kbd> adelantar o retrasar la fase en la órbita</li>
                <li><kbd>↑</kbd> / <kbd>↓</kbd> cambiar la inclinación</li>
                <li><kbd>E</kbd> piloto automático de aproximación</li>
                <li><kbd>Espacio</kbd> capturar el objetivo</li>
                <li><kbd>Esc</kbd> abrir y cerrar estas opciones</li>
              </ul>
              <h3>Sobre los datos</h3>
              <p>
                Las altitudes e inclinaciones de los objetos siguen las bandas publicadas por NASA ODPO y
                ESA, pero cada objeto es sintético: no son objetos del catálogo real. La velocidad y el
                periodo sí se calculan con las fórmulas de una órbita circular.
              </p>
              <p>
                La Luna está a su distancia real, con el tamaño aumentado para que se vea. El Sol y los
                planetas del fondo no están a escala ni a distancia real: son solo referencia visual.
              </p>
              <p>
                Los signos vitales del astronauta son sintéticos para la demostración. El nombre es un
                homenaje a una persona real y los datos no la representan.
              </p>
              <button type="button" className="options-button" onClick={onShowTutorial}>
                Ver el tutorial otra vez
              </button>
            </div>
          ) : null}
        </div>

        <footer className="options-footer">
          <button type="button" className="options-button options-button-primary" onClick={onResume}>
            Reanudar
          </button>
          {missionRunning ? (
            <button type="button" className="options-button options-button-abort" onClick={onAbort}>
              Abortar misión
            </button>
          ) : null}
        </footer>
      </section>
    </div>
  );
}

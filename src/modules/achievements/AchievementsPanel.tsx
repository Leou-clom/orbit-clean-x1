import type { Achievement } from '../../types/orbital';
import { ACHIEVEMENTS } from './achievements';
import './achievements.css';

interface AchievementsPanelProps {
  unlocked: Set<string>;
}

export function AchievementsPanel({ unlocked }: AchievementsPanelProps) {
  return (
    <section className="achievements" aria-label="Logros">
      <header className="achievements-header">
        <h2>Logros</h2>
        <span className="achievements-count">
          {unlocked.size} / {ACHIEVEMENTS.length}
        </span>
      </header>
      <ul className="achievements-list">
        {ACHIEVEMENTS.map((achievement) => {
          const earned = unlocked.has(achievement.id);
          return (
            <li key={achievement.id} className={`achievement ${earned ? 'achievement-earned' : ''}`}>
              <span className="achievement-mark" aria-hidden="true">
                {earned ? '★' : '☆'}
              </span>
              <div>
                <strong>{achievement.name}</strong>
                <p>{achievement.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

interface AchievementToastsProps {
  achievements: Achievement[];
}

export function AchievementToasts({ achievements }: AchievementToastsProps) {
  if (achievements.length === 0) return null;

  return (
    <div className="achievement-toasts" aria-live="polite">
      {achievements.map((achievement) => (
        <article key={achievement.id} className="achievement-toast">
          <span aria-hidden="true">★</span>
          <div>
            <strong>Logro desbloqueado</strong>
            <p>{achievement.name}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

import type { Achievement, AchievementContext } from '../../types';

interface AchievementDefinition extends Achievement {
  earned: (context: AchievementContext) => boolean;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first-contact',
    name: 'Primer contacto',
    description: 'Completa tu primera misión.',
    earned: ({ result, missionsCompleted }) => result.mainObjectiveCompleted && missionsCompleted >= 1,
  },
  {
    id: 'spotless',
    name: 'Sin un rasguño',
    description: 'Termina una misión con el casco al 100 %.',
    earned: ({ result, hullIntegrity }) => result.mainObjectiveCompleted && hullIntegrity >= 100,
  },
  {
    id: 'steady-hand',
    name: 'Mano firme',
    description: 'Completa una misión sin errores de maniobra.',
    earned: ({ result }) => result.mainObjectiveCompleted && result.mistakes === 0,
  },
  {
    id: 'survivor',
    name: 'Superviviente',
    description: 'Completa una misión con el casco por debajo del 30 %.',
    earned: ({ result, hullIntegrity }) => result.mainObjectiveCompleted && hullIntegrity < 30,
  },
  {
    id: 'big-game',
    name: 'Cazador de grandes',
    description: 'Retira 10 objetos grandes en total.',
    earned: ({ totalLargeCaptures }) => totalLargeCaptures >= 10,
  },
  {
    id: 'collector',
    name: 'Coleccionista',
    description: 'Retira 60 objetos en total.',
    earned: ({ totalCaptures }) => totalCaptures >= 60,
  },
  {
    id: 'full-bay',
    name: 'Bodega llena',
    description: 'Retira 25 objetos en una sola misión.',
    earned: ({ result }) => result.capturedCount >= 25,
  },
  {
    id: 'speedrun',
    name: 'Contra el reloj',
    description: 'Consigue un bonus por rapidez mayor a 300 puntos.',
    earned: ({ result }) => result.speedBonus > 300,
  },
  {
    id: 'perfectionist',
    name: 'Perfeccionista',
    description: 'Completa todos los objetivos secundarios de una misión.',
    earned: ({ result }) =>
      result.mainObjectiveCompleted &&
      result.secondaryOutcomes.length > 0 &&
      result.secondaryOutcomes.every((outcome) => outcome.completed),
  },
  {
    id: 'veteran',
    name: 'Veterano orbital',
    description: 'Completa 5 misiones.',
    earned: ({ missionsCompleted }) => missionsCompleted >= 5,
  },
  {
    id: 'rank-s',
    name: 'Rango S',
    description: 'Completa una misión de dificultad S.',
    earned: ({ result }) => result.mainObjectiveCompleted && result.difficulty === 'S',
  },
  {
    id: 'clean-sweep',
    name: 'Limpieza total',
    description: 'Deja un campo de misión completamente limpio.',
    earned: ({ result }) =>
      result.secondaryOutcomes.some((outcome) => outcome.completed && outcome.label.includes('limpio')),
  },
];

export function evaluateAchievements(context: AchievementContext, unlocked: Set<string>): Achievement[] {
  return ACHIEVEMENTS.filter((achievement) => !unlocked.has(achievement.id) && achievement.earned(context)).map(
    ({ id, name, description }) => ({ id, name, description })
  );
}

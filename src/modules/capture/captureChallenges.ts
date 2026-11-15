import type { DifficultyRank } from '../../types/orbital';

export type ChallengeKind = 'sync' | 'stabilize' | 'sequence' | 'grip';

export interface ChallengeSpec {
  kind: ChallengeKind;
  title: string;
  instruction: string;
  durationMs: number;
}

export const CHALLENGES: Record<ChallengeKind, ChallengeSpec> = {
  sync: {
    kind: 'sync',
    title: 'Sincronía de acoplamiento',
    instruction: 'Pulsa Espacio cuando el indicador entre en la franja verde.',
    durationMs: 6000,
  },
  stabilize: {
    kind: 'stabilize',
    title: 'Estabilización del brazo',
    instruction: 'Mantén la aguja dentro de la franja con ← y →.',
    durationMs: 7000,
  },
  sequence: {
    kind: 'sequence',
    title: 'Despliegue del brazo',
    instruction: 'Introduce la secuencia de flechas en orden.',
    durationMs: 6000,
  },
  grip: {
    kind: 'grip',
    title: 'Cierre de la pinza',
    instruction: 'Pulsa Espacio repetidamente para cerrar la pinza.',
    durationMs: 4500,
  },
};

const ALL: ChallengeKind[] = ['sync', 'stabilize', 'sequence', 'grip'];

// Las misiones duras encadenan dos pruebas; las fáciles solo una, para que el ritmo siga dando
// tiempo a completar objetivos de 40 o 50 capturas.
export function challengeCountFor(difficulty: DifficultyRank): number {
  return difficulty === 'A' || difficulty === 'S' ? 2 : 1;
}

export function pickChallenges(count: number): ChallengeKind[] {
  const pool = ALL.slice();
  const picked: ChallengeKind[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return picked;
}

export const ARROW_KEYS = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'] as const;

export const ARROW_GLYPH: Record<string, string> = {
  ArrowUp: '↑',
  ArrowRight: '→',
  ArrowDown: '↓',
  ArrowLeft: '←',
};

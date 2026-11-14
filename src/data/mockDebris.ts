import type { DebrisObject, DebrisObjectType } from '../types';

/**
 * Datos de demostración (ficticios), NO posiciones orbitales reales.
 * Generados para tener un volumen realista (50-200 objetos) mientras el
 * equipo conecta una fuente de datos real.
 */
const TYPES: DebrisObjectType[] = ['satellite', 'debris', 'rocket_body'];

function generateMockDebris(count: number): DebrisObject[] {
  const objects: DebrisObject[] = [];
  for (let i = 0; i < count; i++) {
    const type = TYPES[i % TYPES.length];
    objects.push({
      id: `sim-${i.toString().padStart(3, '0')}`,
      name: `${type === 'satellite' ? 'SAT' : type === 'rocket_body' ? 'RB' : 'DEB'}-${i}`,
      type,
    });
  }
  return objects;
}

export const mockDebrisObjects: DebrisObject[] = generateMockDebris(120);

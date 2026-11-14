/**
 * Tipos compartidos de ORBIT-CLEAN X.
 *
 * NOTA (scaffold inicial, 2026-11-14): este archivo es un punto de partida
 * provisional creado para poder avanzar mientras no hay una base oficial del
 * equipo. Si el diseño final del proyecto define estos campos distinto,
 * actualiza esta interfaz aquí (es la única fuente de verdad) y no la
 * redefinas en otro archivo.
 */

export type DebrisObjectType = 'satellite' | 'debris' | 'rocket_body' | 'unknown';

export interface DebrisObject {
  id: string;
  name: string;
  type: DebrisObjectType;
  /** Datos reales si existen; si no, los módulos de simulación derivan valores propios. */
  altitudeKm?: number;
  velocityKms?: number;
}

/**
 * Ejes analógicos del joystick táctil, leídos por el bucle de juego.
 *
 * Es un objeto vivo compartido, igual que `liveStation`: el joystick escribe en él
 * en cada movimiento del dedo y el bucle lo lee en cada fotograma. Así el control es
 * proporcional —inclinar poco mueve poco— en vez de todo o nada como una tecla.
 */
export interface TouchAxes {
  /** -1 (retrasar fase) a 1 (adelantar fase). */
  x: number;
  /** -1 (bajar altitud) a 1 (subir altitud). */
  y: number;
}

export const touchAxes: TouchAxes = { x: 0, y: 0 };

export function resetTouchAxes(): void {
  touchAxes.x = 0;
  touchAxes.y = 0;
}

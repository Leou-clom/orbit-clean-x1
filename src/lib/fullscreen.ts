/**
 * Pantalla completa y bloqueo de orientación en horizontal.
 *
 * Aviso importante sobre lo que un navegador puede y no puede hacer:
 * una página web NO puede girar el móvil por su cuenta. `screen.orientation.lock()`
 * solo funciona si la página ya está en pantalla completa, exige un gesto del usuario,
 * y Safari en iOS no lo admite en absoluto. Por eso esto se intenta y, si falla, la
 * interfaz pide al jugador que gire el teléfono a mano.
 */

interface LegacyFullscreen extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
}

/**
 * `lock` y `unlock` no están en todos los navegadores, así que se describen como
 * opcionales. No se puede extender `ScreenOrientation` porque allí `lock` es obligatorio.
 */
interface LockableOrientation {
  lock?: (orientation: 'landscape' | 'portrait' | 'any') => Promise<void>;
  unlock?: () => void;
}

/** Resultado de intentar ponerse en horizontal, para que la interfaz sepa qué decir. */
export type LandscapeResult = 'locked' | 'fullscreen-only' | 'unsupported';

export function isFullscreen(): boolean {
  return document.fullscreenElement !== null;
}

/**
 * Pide pantalla completa y, si se concede, intenta fijar el horizontal.
 * Debe llamarse desde un gesto del usuario (un toque), o el navegador lo rechaza.
 */
export async function enterLandscape(): Promise<LandscapeResult> {
  const root = document.documentElement as LegacyFullscreen;

  try {
    if (!document.fullscreenElement) {
      if (root.requestFullscreen) await root.requestFullscreen({ navigationUI: 'hide' });
      else if (root.webkitRequestFullscreen) await root.webkitRequestFullscreen();
      else return 'unsupported';
    }
  } catch {
    // Safari en iOS rechaza la pantalla completa en elementos que no sean vídeo.
    return 'unsupported';
  }

  const orientation = screen.orientation as unknown as LockableOrientation | undefined;
  if (!orientation?.lock) return 'fullscreen-only';

  try {
    await orientation.lock('landscape');
    return 'locked';
  } catch {
    // Android con la rotación del sistema bloqueada, o navegador sin soporte.
    return 'fullscreen-only';
  }
}

export async function exitLandscape(): Promise<void> {
  const orientation = screen.orientation as unknown as LockableOrientation | undefined;
  try {
    orientation?.unlock?.();
  } catch {
    // Da igual: si no se puede desbloquear, el sistema lo hará al salir.
  }
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
  } catch {
    // Idem.
  }
}

/** El móvil está en vertical: la escena queda demasiado estrecha para jugar. */
export function isPortrait(): boolean {
  return window.matchMedia('(orientation: portrait)').matches;
}

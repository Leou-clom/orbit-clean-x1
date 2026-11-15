import { useCallback, useEffect, useRef, useState } from 'react';
import { touchAxes, resetTouchAxes } from '../../lib/touchInput';
import './touch-controls.css';

/**
 * Mandos en pantalla para jugar con el dedo.
 *
 * Dos mecanismos distintos a propósito:
 *  - El joystick escribe ejes analógicos en `touchAxes`, que el bucle de juego lee cada
 *    fotograma. Así inclinar poco mueve poco.
 *  - Los botones emiten KeyboardEvent sintéticos con el mismo `code` que el teclado. Como
 *    todo el juego escucha en `window`, funcionan igual el pilotaje y las maniobras de
 *    captura sin duplicar su lógica.
 */

function send(type: 'keydown' | 'keyup', code: string) {
  window.dispatchEvent(new KeyboardEvent(type, { code, key: code, bubbles: true }));
}

/** Zona muerta: evita que la nave derive por el temblor del pulgar apoyado. */
const DEAD_ZONE = 0.16;

function Joystick() {
  const baseRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  // En estado y no solo en la ref: el render necesita saberlo y leer una ref al
  // renderizar incumple las reglas de React.
  const [active, setActive] = useState(false);

  const apply = useCallback((clientX: number, clientY: number) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const radius = rect.width / 2;

    let dx = (clientX - cx) / radius;
    let dy = (clientY - cy) / radius;

    // Limitar al círculo unidad: el pomo no se sale de la base.
    const dist = Math.hypot(dx, dy);
    if (dist > 1) {
      dx /= dist;
      dy /= dist;
    }

    setKnob({ x: dx, y: dy });

    // Reescalar fuera de la zona muerta para que el primer movimiento útil sea suave
    // en vez de dar un salto.
    const magnitude = Math.min(1, dist);
    if (magnitude < DEAD_ZONE) {
      resetTouchAxes();
      return;
    }
    const scaled = (magnitude - DEAD_ZONE) / (1 - DEAD_ZONE);
    const nx = dist === 0 ? 0 : (dx / Math.min(dist, 1)) * scaled;
    const ny = dist === 0 ? 0 : (dy / Math.min(dist, 1)) * scaled;

    touchAxes.x = nx;
    touchAxes.y = -ny; // en pantalla el eje Y crece hacia abajo; arriba debe subir altitud
  }, []);

  const start = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (pointerRef.current !== null) return;
      pointerRef.current = event.pointerId;
      setActive(true);
      event.currentTarget.setPointerCapture?.(event.pointerId);
      apply(event.clientX, event.clientY);
    },
    [apply]
  );

  const move = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (pointerRef.current !== event.pointerId) return;
      event.preventDefault();
      apply(event.clientX, event.clientY);
    },
    [apply]
  );

  const end = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerRef.current !== event.pointerId) return;
    event.preventDefault();
    pointerRef.current = null;
    setActive(false);
    setKnob({ x: 0, y: 0 });
    resetTouchAxes();
  }, []);

  // Si el joystick desaparece con el dedo encima, los ejes deben quedar a cero.
  useEffect(() => resetTouchAxes, []);

  return (
    <div className="touch-stick-wrap">
      <div
        ref={baseRef}
        className={`touch-stick ${active ? 'touch-stick-active' : ''}`}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        onContextMenu={(e) => e.preventDefault()}
        role="application"
        aria-label="Joystick: altitud y fase orbital"
      >
        <span className="touch-stick-axis touch-stick-axis-v" />
        <span className="touch-stick-axis touch-stick-axis-h" />
        <span
          className="touch-stick-knob"
          style={{ transform: `translate(${knob.x * 34}px, ${knob.y * 34}px)` }}
        />
      </div>
      <span className="touch-stick-hint">ALTITUD · FASE</span>
    </div>
  );
}

interface HoldButtonProps {
  code: string;
  label: string;
  hint?: string;
  className?: string;
}

/** Botón que mantiene la tecla pulsada mientras el dedo esté encima. */
function HoldButton({ code, label, hint, className = '' }: HoldButtonProps) {
  const activeRef = useRef(false);
  const [down, setDown] = useState(false);

  const press = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (activeRef.current) return;
      activeRef.current = true;
      setDown(true);
      send('keydown', code);
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [code]
  );

  const release = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (!activeRef.current) return;
      activeRef.current = false;
      setDown(false);
      send('keyup', code);
    },
    [code]
  );

  // Si el componente desaparece con la tecla pulsada, hay que soltarla igualmente.
  useEffect(
    () => () => {
      if (activeRef.current) send('keyup', code);
    },
    [code]
  );

  return (
    <button
      type="button"
      className={`touch-key ${down ? 'touch-key-down' : ''} ${className}`}
      onPointerDown={press}
      onPointerUp={release}
      onPointerCancel={release}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={hint ?? label}
    >
      <span>{label}</span>
    </button>
  );
}

interface TouchControlsProps {
  /** Durante la maniobra de captura hacen falta mandos discretos, no analógicos. */
  capturing: boolean;
  visible: boolean;
}

export function TouchControls({ capturing, visible }: TouchControlsProps) {
  // Los ejes no deben quedarse colgados si los mandos se ocultan a media partida.
  useEffect(() => {
    if (!visible || capturing) resetTouchAxes();
  }, [visible, capturing]);

  if (!visible) return null;

  if (capturing) {
    // Las cuatro maniobras piden pulsaciones concretas: aquí una cruceta va mejor que
    // un joystick, sobre todo en la prueba de secuencia.
    return (
      <div className="touch-capture">
        <div className="touch-capture-arrows">
          <HoldButton code="ArrowUp" label="▲" hint="Arriba" />
          <div className="touch-capture-row">
            <HoldButton code="ArrowLeft" label="◀" hint="Izquierda" />
            <HoldButton code="ArrowRight" label="▶" hint="Derecha" />
          </div>
          <HoldButton code="ArrowDown" label="▼" hint="Abajo" />
        </div>
        <HoldButton code="Space" label="ACCIÓN" hint="Espacio" className="touch-key-action" />
      </div>
    );
  }

  return (
    <div className="touch-pad">
      <Joystick />

      <div className="touch-right">
        <div className="touch-plane">
          <HoldButton code="KeyA" label="↺" hint="Girar el plano orbital a la izquierda" />
          <HoldButton code="KeyD" label="↻" hint="Girar el plano orbital a la derecha" />
        </div>
        <div className="touch-main">
          <HoldButton code="KeyS" label="ALEJAR" hint="Alejarse del objetivo" />
          <HoldButton code="KeyW" label="IR" hint="Volar hacia el objetivo" className="touch-key-go" />
        </div>
      </div>
    </div>
  );
}

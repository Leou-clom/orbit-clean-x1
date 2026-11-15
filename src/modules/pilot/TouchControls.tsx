import { useCallback, useEffect, useRef, useState } from 'react';
import './touch-controls.css';

/**
 * Mandos en pantalla para jugar con el dedo.
 *
 * Todo el juego escucha el teclado en `window`, así que en vez de duplicar la lógica
 * cada botón emite un KeyboardEvent sintético con el mismo `code`. Así funcionan igual
 * el pilotaje y las maniobras de captura, sin tocar una línea de su código.
 */

function send(type: 'keydown' | 'keyup', code: string) {
  window.dispatchEvent(new KeyboardEvent(type, { code, key: code, bubbles: true }));
}

interface PadButtonProps {
  code: string;
  label: string;
  hint?: string;
  className?: string;
}

/** Botón que mantiene la tecla pulsada mientras el dedo esté encima. */
function HoldButton({ code, label, hint, className = '' }: PadButtonProps) {
  const activeRef = useRef(false);
  const [down, setDown] = useState(false);

  const press = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (activeRef.current) return;
      activeRef.current = true;
      setDown(true);
      send('keydown', code);
      // Capturar el puntero evita que la tecla se quede pegada si el dedo se sale del botón.
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
      onPointerLeave={release}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={hint ?? label}
    >
      <span>{label}</span>
    </button>
  );
}

interface TouchControlsProps {
  /** Mientras la maniobra de captura está abierta se muestran otros mandos. */
  capturing: boolean;
  visible: boolean;
}

export function TouchControls({ capturing, visible }: TouchControlsProps) {
  if (!visible) return null;

  if (capturing) {
    // Las cuatro maniobras usan Espacio y las flechas; se ofrecen todas juntas.
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
      {/* Izquierda: acercarse o alejarse del objetivo. */}
      <div className="touch-cluster touch-cluster-left">
        <HoldButton code="KeyW" label="IR" hint="Volar hacia el objetivo" className="touch-key-go" />
        <HoldButton code="KeyS" label="ALEJAR" hint="Alejarse del objetivo" />
      </div>

      {/* Derecha: ajuste fino de órbita. */}
      <div className="touch-cluster touch-cluster-right">
        <div className="touch-dpad">
          <HoldButton code="ArrowUp" label="▲" hint="Subir altitud" className="touch-dpad-up" />
          <HoldButton code="ArrowLeft" label="◀" hint="Retrasar fase" className="touch-dpad-left" />
          <HoldButton code="ArrowRight" label="▶" hint="Adelantar fase" className="touch-dpad-right" />
          <HoldButton code="ArrowDown" label="▼" hint="Bajar altitud" className="touch-dpad-down" />
          <span className="touch-dpad-center">ÓRBITA</span>
        </div>
        <div className="touch-plane">
          <HoldButton code="KeyA" label="↺" hint="Girar el plano orbital a la izquierda" />
          <HoldButton code="KeyD" label="↻" hint="Girar el plano orbital a la derecha" />
        </div>
      </div>
    </div>
  );
}

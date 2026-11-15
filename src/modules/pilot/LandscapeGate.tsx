import { useCallback, useEffect, useState } from 'react';
import { RotateCw, Smartphone } from 'lucide-react';
import { enterLandscape, isPortrait, type LandscapeResult } from '../../lib/fullscreen';
import './landscape-gate.css';

/**
 * Aviso que aparece en móviles sostenidos en vertical.
 *
 * Una web no puede girar el teléfono por su cuenta: `screen.orientation.lock()` exige
 * estar en pantalla completa, necesita un gesto del usuario y Safari en iOS no lo admite.
 * Así que se ofrece un botón que lo intenta, y si no se puede, se pide girar a mano.
 */
export function LandscapeGate({ enabled }: { enabled: boolean }) {
  const [portrait, setPortrait] = useState(() => isPortrait());
  const [result, setResult] = useState<LandscapeResult | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const media = window.matchMedia('(orientation: portrait)');
    const update = () => setPortrait(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [enabled]);

  const rotate = useCallback(async () => {
    setResult(await enterLandscape());
  }, []);

  if (!enabled || !portrait) return null;

  return (
    <div className="landscape-gate">
      <div className="landscape-card">
        <Smartphone size={34} strokeWidth={1.5} className="landscape-icon" />
        <h2>Gira el teléfono</h2>
        <p>ORBIT-CLEAN X se juega en horizontal. La escena necesita el ancho de la pantalla.</p>

        <button type="button" className="landscape-button" onClick={rotate}>
          <RotateCw size={17} strokeWidth={2} />
          Poner en horizontal
        </button>

        {result === 'fullscreen-only' ? (
          <p className="landscape-note">
            Tu navegador no deja fijar la orientación. Gíralo a mano y comprueba que el bloqueo de
            rotación del teléfono esté desactivado.
          </p>
        ) : null}

        {result === 'unsupported' ? (
          <p className="landscape-note">
            Este navegador no permite la pantalla completa desde una página. Gira el teléfono a
            mano para empezar.
          </p>
        ) : null}
      </div>
    </div>
  );
}

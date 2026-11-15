import { useEffect, useRef, useState } from 'react';
import { ARROW_GLYPH, ARROW_KEYS, CHALLENGES, type ChallengeKind } from './captureChallenges';
import './capture-challenge.css';

interface CaptureChallengeProps {
  kinds: ChallengeKind[];
  targetName: string;
  onComplete: () => void;
  onFail: (reason: string) => void;
}

const HOLD_GOAL_MS = 1600;
const GRIP_GOAL = 100;

function makeRound() {
  return {
    zone: 28 + Math.random() * 38,
    sequence: Array.from({ length: 3 }, () => ARROW_KEYS[Math.floor(Math.random() * ARROW_KEYS.length)]),
  };
}

export function CaptureChallenge({ kinds, targetName, onComplete, onFail }: CaptureChallengeProps) {
  const [step, setStep] = useState(0);
  const kind = kinds[step];
  const spec = CHALLENGES[kind];

  const [progress, setProgress] = useState(0);
  const [cursor, setCursor] = useState(0);
  const [needle, setNeedle] = useState(0);
  const [held, setHeld] = useState(0);
  const [grip, setGrip] = useState(0);
  const [typed, setTyped] = useState(0);
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null);

  const keysRef = useRef<Set<string>>(new Set());
  const resolvedRef = useRef(false);

  const [round, setRound] = useState(makeRound);
  const { zone, sequence } = round;

  const advance = (ok: boolean, reason?: string) => {
    if (resolvedRef.current) return;
    if (!ok) {
      resolvedRef.current = true;
      setFlash('bad');
      window.setTimeout(() => onFail(reason ?? 'Captura fallida'), 350);
      return;
    }
    if (step + 1 >= kinds.length) {
      resolvedRef.current = true;
      setFlash('ok');
      window.setTimeout(onComplete, 320);
      return;
    }
    setFlash('ok');
    window.setTimeout(() => {
      setFlash(null);
      setStep((current) => current + 1);
      setRound(makeRound());
      setProgress(0);
      setCursor(0);
      setNeedle(0);
      setHeld(0);
      setGrip(0);
      setTyped(0);
    }, 260);
  };

  // El bucle y los listeners se montan una vez por prueba; leer `advance` por referencia evita
  // reengancharlos en cada render y quedarse con un cierre viejo. La sincronización va en un
  // efecto porque escribir en una ref durante el render rompe las reglas de React.
  const advanceRef = useRef(advance);
  useEffect(() => {
    advanceRef.current = advance;
  });

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
        event.preventDefault();
        event.stopPropagation();
      }
      keysRef.current.add(event.code);

      if (resolvedRef.current || flash) return;

      if (kind === 'sync' && event.code === 'Space') {
        advanceRef.current(cursor >= zone && cursor <= zone + 18, 'Fuera de la ventana de acoplamiento');
      }
      if (kind === 'grip' && event.code === 'Space') {
        setGrip((current) => {
          const next = Math.min(GRIP_GOAL, current + 9);
          if (next >= GRIP_GOAL) advanceRef.current(true);
          return next;
        });
      }
      if (kind === 'sequence' && event.code.startsWith('Arrow')) {
        if (event.code === sequence[typed]) {
          const next = typed + 1;
          setTyped(next);
          if (next >= sequence.length) advanceRef.current(true);
        } else {
          advanceRef.current(false, 'Secuencia del brazo incorrecta');
        }
      }
    };
    const up = (event: KeyboardEvent) => keysRef.current.delete(event.code);

    window.addEventListener('keydown', down, true);
    window.addEventListener('keyup', up, true);
    return () => {
      window.removeEventListener('keydown', down, true);
      window.removeEventListener('keyup', up, true);
    };
  }, [kind, cursor, zone, typed, sequence, flash]);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    let elapsed = 0;
    let direction = 1;
    let drift = (Math.random() - 0.5) * 0.6;

    const loop = () => {
      frame = requestAnimationFrame(loop);
      const now = performance.now();
      const delta = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (resolvedRef.current) return;

      elapsed += delta * 1000;
      setProgress(Math.min(1, elapsed / spec.durationMs));

      if (kind === 'sync') {
        setCursor((current) => {
          let next = current + direction * 62 * delta;
          if (next >= 100) {
            next = 100;
            direction = -1;
          }
          if (next <= 0) {
            next = 0;
            direction = 1;
          }
          return next;
        });
      }

      if (kind === 'stabilize') {
        drift += (Math.random() - 0.5) * 2.2 * delta;
        drift = Math.max(-1.1, Math.min(1.1, drift));
        const keys = keysRef.current;
        const input = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0);
        setNeedle((current) => {
          const next = Math.max(-50, Math.min(50, current + (drift * 26 + input * 42) * delta));
          if (Math.abs(next) < 12) {
            setHeld((heldMs) => {
              const total = heldMs + delta * 1000;
              if (total >= HOLD_GOAL_MS) advanceRef.current(true);
              return total;
            });
          }
          return next;
        });
      }

      if (kind === 'grip') {
        setGrip((current) => {
          const next = Math.max(0, current - 26 * delta);
          if (next >= GRIP_GOAL) advanceRef.current(true);
          return next;
        });
      }

      if (elapsed >= spec.durationMs) {
        advanceRef.current(false, 'Se agotó el tiempo de la maniobra');
      }
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [kind, spec.durationMs, step]);

  return (
    <div className={`capture-challenge ${flash ? `capture-challenge-${flash}` : ''}`}>
      <header className="capture-head">
        <p className="capture-kicker">
          MANIOBRA DE CAPTURA {step + 1}/{kinds.length} · {targetName}
        </p>
        <h3>{spec.title}</h3>
        <p className="capture-instruction">{spec.instruction}</p>
      </header>

      <div className="capture-timer">
        <div className="capture-timer-fill" style={{ width: `${(1 - progress) * 100}%` }} />
      </div>

      {kind === 'sync' ? (
        <div className="capture-track">
          <div className="capture-zone" style={{ left: `${zone}%`, width: '18%' }} />
          <div className="capture-cursor" style={{ left: `${cursor}%` }} />
        </div>
      ) : null}

      {kind === 'stabilize' ? (
        <div className="capture-gauge">
          <div className="capture-gauge-band" />
          <div className="capture-needle" style={{ left: `calc(50% + ${needle}% )` }} />
          <div className="capture-hold" style={{ width: `${(held / HOLD_GOAL_MS) * 100}%` }} />
        </div>
      ) : null}

      {kind === 'sequence' ? (
        <div className="capture-sequence">
          {sequence.map((code, index) => (
            <span
              key={`${code}-${index}`}
              className={index < typed ? 'capture-key capture-key-done' : 'capture-key'}
            >
              {ARROW_GLYPH[code]}
            </span>
          ))}
        </div>
      ) : null}

      {kind === 'grip' ? (
        <div className="capture-grip">
          <div className="capture-grip-fill" style={{ width: `${grip}%` }} />
          <span>{Math.round(grip)}%</span>
        </div>
      ) : null}
    </div>
  );
}

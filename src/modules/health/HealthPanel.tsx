import { useEffect, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CrewStatus } from "../../types";
export interface HealthPanelProps {
  status: CrewStatus;
  onStatusChange: (status: CrewStatus) => void;
}
/** Umbrales de la demo. Sirven solo para encender alertas en el juego. */
const GAME_WARN = {
  heartRateHigh: 105,
  heartRateLow: 58,
  spo2Low: 95,
  fatigueHigh: 68,
  stressHigh: 62,
  focusLow: 42,
} as const;
const RANGES = {
  heart: [58, 112] as const,
  spo2: [93, 99] as const,
  fatigue: [12, 82] as const,
  stress: [12, 80] as const,
  focus: [30, 96] as const,
};
type DemoEvent = "approach" | "capture" | "mission-time";
type Sample = {
  label: string;
  heart: number;
  stress: number;
  focus: number;
  fatigue: number;
};
type LogEntry = {
  id: number;
  time: string;
  text: string;
};
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
function round(value: number): number {
  return Math.round(value);
}
function clockLabel(date = new Date()): string {
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
function moodFrom(status: CrewStatus): string {
  if (status.stressPercent >= GAME_WARN.stressHigh) return "Tensión de misión";
  if (status.fatiguePercent >= GAME_WARN.fatigueHigh) return "Fatiga de turno";
  if (status.focusPercent >= 75 && status.stressPercent < 45) return "Enfoque estable";
  return "Estable";
}
function withMood(status: CrewStatus): CrewStatus {
  return { ...status, moodLabel: moodFrom(status) };
}
function applyEvent(status: CrewStatus, event: DemoEvent): CrewStatus {
  if (event === "approach") {
    return withMood({
      ...status,
      stressPercent: clamp(status.stressPercent + 8, ...RANGES.stress),
      heartRateBpm: clamp(status.heartRateBpm + 6, ...RANGES.heart),
      focusPercent: clamp(status.focusPercent - 4, ...RANGES.focus),
    });
  }
  if (event === "capture") {
    return withMood({
      ...status,
      focusPercent: clamp(status.focusPercent + 10, ...RANGES.focus),
      stressPercent: clamp(status.stressPercent - 5, ...RANGES.stress),
      heartRateBpm: clamp(status.heartRateBpm - 2, ...RANGES.heart),
    });
  }
  return withMood({
    ...status,
    fatiguePercent: clamp(status.fatiguePercent + 6, ...RANGES.fatigue),
    focusPercent: clamp(status.focusPercent - 3, ...RANGES.focus),
    spo2Percent: clamp(status.spo2Percent - 0.4, ...RANGES.spo2),
  });
}
function drift(status: CrewStatus, elapsedTicks: number): CrewStatus {
  const wave = Math.sin(elapsedTicks / 3);
  return withMood({
    ...status,
    heartRateBpm: clamp(status.heartRateBpm + wave * 1.4, ...RANGES.heart),
    spo2Percent: clamp(status.spo2Percent + Math.cos(elapsedTicks / 4) * 0.15, ...RANGES.spo2),
    fatiguePercent: clamp(status.fatiguePercent + 0.35, ...RANGES.fatigue),
    stressPercent: clamp(status.stressPercent + wave * 0.6, ...RANGES.stress),
    focusPercent: clamp(status.focusPercent - 0.15, ...RANGES.focus),
  });
}
type AlertItem = { id: string; text: string };
function gameAlerts(status: CrewStatus): AlertItem[] {
  const alerts: AlertItem[] = [];
  if (status.heartRateBpm >= GAME_WARN.heartRateHigh || status.heartRateBpm <= GAME_WARN.heartRateLow) {
    alerts.push({
      id: "heart",
      text: "Pulso simulado fuera de la banda de juego.",
    });
  }
  if (status.spo2Percent <= GAME_WARN.spo2Low) {
    alerts.push({
      id: "spo2",
      text: "Oxígeno simulado por debajo del umbral de la demo.",
    });
  }
  if (status.fatiguePercent >= GAME_WARN.fatigueHigh) {
    alerts.push({
      id: "fatigue",
      text: "Fatiga simulada en nivel de advertencia del juego.",
    });
  }
  if (status.stressPercent >= GAME_WARN.stressHigh) {
    alerts.push({
      id: "stress",
      text: "Estrés simulado en nivel de advertencia del juego.",
    });
  }
  if (status.focusPercent <= GAME_WARN.focusLow) {
    alerts.push({
      id: "focus",
      text: "Concentración simulada por debajo del umbral de la demo.",
    });
  }
  return alerts;
}
function Ring({ value, max, warn }: { value: number; max: number; warn: boolean }) {
  const size = 86;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = clamp(value / max, 0, 1);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(94, 196, 255, 0.18)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={warn ? "#ff8a3d" : "#3ee0ff"}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circ * pct} ${circ}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="#e8f7ff" fontSize="16" fontFamily="Consolas, monospace">
        {round(value)}
      </text>
    </svg>
  );
}
function Bar({ value, warn }: { value: number; warn: boolean }) {
  return (
    <div style={styles.track} aria-hidden="true">
      <div
        style={{
          ...styles.fill,
          width: `${clamp(value, 0, 100)}%`,
          background: warn
            ? "linear-gradient(90deg, #ff8a3d, #ffd15c)"
            : "linear-gradient(90deg, #1f7cff, #3ee0ff)",
        }}
      />
    </div>
  );
}
export function HealthPanel({ status, onStatusChange }: HealthPanelProps) {
  const statusRef = useRef(status);
  const ticks = useRef(0);
  const logId = useRef(1);
  const [history, setHistory] = useState<Sample[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const alerts = useMemo(() => gameAlerts(status), [status]);
  useEffect(() => {
    statusRef.current = status;
  });
  useEffect(() => {
    const next: Sample = {
      label: clockLabel(),
      heart: round(status.heartRateBpm),
      stress: round(status.stressPercent),
      focus: round(status.focusPercent),
      fatigue: round(status.fatiguePercent),
    };
    const id = window.setTimeout(() => {
      setHistory((prev) => [...prev, next].slice(-24));
    }, 0);
    return () => window.clearTimeout(id);
  }, [status]);
  useEffect(() => {
    const id = window.setInterval(() => {
      ticks.current += 1;
      const next = drift(statusRef.current, ticks.current);
      onStatusChange(next);
    }, 2800);
    return () => window.clearInterval(id);
  }, [onStatusChange]);
  function pushLog(text: string) {
    const entry: LogEntry = { id: logId.current++, time: clockLabel(), text };
    setLog((prev) => [entry, ...prev].slice(0, 6));
  }
  function runEvent(event: DemoEvent) {
    const labels: Record<DemoEvent, string> = {
      approach: "Aproximación: sube el estrés simulado y el pulso de demo.",
      capture: "Captura: sube la concentración simulada.",
      "mission-time": "Tiempo de misión: sube la fatiga simulada.",
    };
    onStatusChange(applyEvent(status, event));
    pushLog(labels[event]);
  }
  const cards = [
    {
      kicker: "Estado físico simulado",
      label: "Frecuencia cardíaca",
      value: `${round(status.heartRateBpm)} bpm`,
      detail: "Banda de juego 58–112",
      warn: status.heartRateBpm >= GAME_WARN.heartRateHigh || status.heartRateBpm <= GAME_WARN.heartRateLow,
      bar: ((status.heartRateBpm - RANGES.heart[0]) / (RANGES.heart[1] - RANGES.heart[0])) * 100,
    },
    {
      kicker: "Estado físico simulado",
      label: "Saturación de oxígeno",
      value: `${status.spo2Percent.toFixed(1)} %`,
      detail: "Aviso de juego por debajo de 95",
      warn: status.spo2Percent <= GAME_WARN.spo2Low,
      bar: status.spo2Percent,
      ring: true,
    },
    {
      kicker: "Estado físico simulado",
      label: "Fatiga",
      value: `${round(status.fatiguePercent)} %`,
      detail: "Crece con el tiempo de misión",
      warn: status.fatiguePercent >= GAME_WARN.fatigueHigh,
      bar: status.fatiguePercent,
    },
    {
      kicker: "Bienestar simulado",
      label: "Estrés",
      value: `${round(status.stressPercent)} %`,
      detail: "La aproximación lo sube un poco",
      warn: status.stressPercent >= GAME_WARN.stressHigh,
      bar: status.stressPercent,
    },
    {
      kicker: "Bienestar simulado",
      label: "Concentración",
      value: `${round(status.focusPercent)} %`,
      detail: "La captura la modifica",
      warn: status.focusPercent <= GAME_WARN.focusLow,
      bar: status.focusPercent,
    },
    {
      kicker: "Bienestar simulado",
      label: "Estado emocional",
      value: status.moodLabel,
      detail: "Etiqueta sintética, no un diagnóstico",
      warn: status.stressPercent >= GAME_WARN.stressHigh || status.fatiguePercent >= GAME_WARN.fatigueHigh,
      bar: null as number | null,
    },
  ];
  return (
    <section style={styles.panel} aria-label="Panel de bienestar simulado del astronauta">
      <header style={styles.header}>
        <div>
          <p style={styles.kicker}>ORBIT-CLEAN X · CONTROL DE TRIPULACIÓN</p>
          <h2 style={styles.title}>Monitoreo físico y bienestar simulado</h2>
        </div>
        <div style={styles.live}>
          <span style={styles.dot} />
          SIMULADO
        </div>
      </header>
      <p style={styles.disclaimer}>
        Cifras sintéticas para la demostración de la misión. No son mediciones médicas ni un diagnóstico.
      </p>
      <div aria-live="polite">
        {alerts.length === 0 ? (
          <p style={styles.ok}>Sin advertencias de juego. Todos los indicadores simulados están dentro de la banda de la demo.</p>
        ) : (
          <ul style={styles.alerts}>
            {alerts.map((alert) => (
              <li key={alert.id} style={styles.alert}>
                Advertencia de juego · {alert.text}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={styles.grid}>
        {cards.map((card) => (
          <article key={card.label} style={{ ...styles.card, borderColor: card.warn ? "rgba(255,138,61,0.85)" : "rgba(62,224,255,0.28)" }}>
            <p style={styles.cardKicker}>{card.kicker}</p>
            <div style={styles.cardRow}>
              <div>
                <h3 style={styles.cardLabel}>{card.label}</h3>
                <p style={styles.cardValue}>{card.value}</p>
              </div>
              {card.ring ? <Ring value={status.spo2Percent} max={100} warn={card.warn} /> : null}
            </div>
            {card.bar !== null ? <Bar value={card.bar} warn={card.warn} /> : <div style={styles.moodChip}>{status.moodLabel}</div>}
            <p style={styles.cardDetail}>{card.detail}</p>
          </article>
        ))}
      </div>
      <div style={styles.chartCard}>
        <div style={styles.chartHead}>
          <h3 style={styles.cardLabel}>Evolución simulada</h3>
          <p style={styles.cardDetail}>Últimas muestras recibidas desde el estado de la misión</p>
        </div>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={history} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(94,196,255,0.12)" />
              <XAxis dataKey="label" stroke="#8fb4c9" tick={{ fontSize: 11 }} minTickGap={24} />
              <YAxis stroke="#8fb4c9" tick={{ fontSize: 11 }} domain={[0, 120]} />
              <Tooltip
                contentStyle={{ background: "#07131d", border: "1px solid #1e4d66", borderRadius: 10 }}
                labelStyle={{ color: "#d7f6ff" }}
              />
              <Legend />
              <Line type="monotone" dataKey="heart" name="Pulso simulado" stroke="#ff8a3d" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="stress" name="Estrés simulado" stroke="#3ee0ff" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="focus" name="Concentración simulada" stroke="#3dff9a" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="fatigue" name="Fatiga simulada" stroke="#5b8cff" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={styles.bottom}>
        <div>
          <h3 style={styles.cardLabel}>Eventos de misión</h3>
          <p style={styles.cardDetail}>
            Estos botones actualizan el estado del componente principal con onStatusChange. Persona 1 puede llamar las mismas funciones desde el pilotaje.
          </p>
          <div style={styles.actions}>
            <button type="button" style={styles.button} onClick={() => runEvent("approach")}>
              Aproximación
            </button>
            <button type="button" style={styles.button} onClick={() => runEvent("capture")}>
              Captura
            </button>
            <button type="button" style={styles.button} onClick={() => runEvent("mission-time")}>
              Tiempo de misión
            </button>
          </div>
        </div>
        <div>
          <h3 style={styles.cardLabel}>Cambios durante la misión</h3>
          {log.length === 0 ? (
            <p style={styles.cardDetail}>Todavía no hay eventos manuales. La deriva automática sigue actualizando las tarjetas y la gráfica.</p>
          ) : (
            <ul style={styles.log}>
              {log.map((entry) => (
                <li key={entry.id}>
                  <span style={styles.logTime}>{entry.time}</span> {entry.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
const styles: Record<string, React.CSSProperties> = {
  panel: {
    background: "radial-gradient(circle at top left, #12324a 0%, #071018 42%, #05090e 100%)",
    color: "#e7f6ff",
    border: "1px solid rgba(62,224,255,0.35)",
    borderRadius: 18,
    padding: 20,
    display: "grid",
    gap: 16,
    fontFamily: '"Segoe UI", sans-serif',
  },
  header: { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" },
  kicker: { margin: 0, letterSpacing: "0.16em", fontSize: 11, color: "#7fdbff" },
  title: { margin: "4px 0 0", fontSize: 26, fontWeight: 650 },
  live: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid rgba(61,255,154,0.5)",
    color: "#b9ffd8",
    borderRadius: 999,
    padding: "6px 12px",
    fontSize: 12,
    letterSpacing: "0.14em",
  },
  dot: { width: 8, height: 8, borderRadius: 99, background: "#3dff9a", boxShadow: "0 0 10px #3dff9a" },
  disclaimer: {
    margin: 0,
    background: "rgba(8, 24, 38, 0.8)",
    borderLeft: "3px solid #3ee0ff",
    padding: "10px 12px",
    color: "#c5e8f6",
    fontSize: 14,
  },
  ok: { margin: 0, color: "#9dffe0", fontSize: 14 },
  alerts: { listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 },
  alert: {
    background: "rgba(255, 138, 61, 0.14)",
    border: "1px solid rgba(255, 138, 61, 0.7)",
    color: "#ffd7bf",
    borderRadius: 10,
    padding: "8px 12px",
    fontSize: 14,
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 },
  card: { background: "rgba(8, 22, 36, 0.88)", border: "1px solid", borderRadius: 14, padding: 14, display: "grid", gap: 8 },
  cardKicker: { margin: 0, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#79d2ff" },
  cardRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 },
  cardLabel: { margin: 0, fontSize: 14, fontWeight: 600, color: "#d7f3ff" },
  cardValue: { margin: "4px 0 0", fontFamily: "Consolas, monospace", fontSize: 28, color: "#ffffff" },
  cardDetail: { margin: 0, color: "#8fb4c9", fontSize: 12 },
  track: { height: 8, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" },
  fill: { height: "100%", borderRadius: 99 },
  moodChip: {
    display: "inline-block",
    width: "fit-content",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(61,255,154,0.12)",
    color: "#b9ffd8",
    border: "1px solid rgba(61,255,154,0.35)",
  },
  chartCard: { background: "rgba(8, 22, 36, 0.88)", border: "1px solid rgba(91,140,255,0.35)", borderRadius: 14, padding: 14 },
  chartHead: { marginBottom: 8 },
  bottom: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 },
  actions: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 },
  button: {
    background: "transparent",
    color: "#d8f7ff",
    border: "1px solid rgba(62,224,255,0.55)",
    borderRadius: 999,
    padding: "8px 14px",
    cursor: "pointer",
  },
  log: { margin: "8px 0 0", paddingLeft: 18, color: "#d5eef8", display: "grid", gap: 6, fontSize: 14 },
  logTime: { fontFamily: "Consolas, monospace", color: "#7fdbff", marginRight: 8 },
};

import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

/* ── Google Fonts ────────────────────────────────────────────── */
if (!document.getElementById("sbm-fonts")) {
  const l = document.createElement("link");
  l.id = "sbm-fonts";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Fraunces:ital,wght@0,300;0,400;1,300;1,400&display=swap";
  document.head.appendChild(l);
}

/* ══════════════════════════════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg:       #060a08;
  --surface:  #090e0b;
  --surface2: #0d1510;
  --border:   #111a13;
  --border2:  #172016;
  --green:    #22c55e;
  --green-dim:#166534;
  --amber:    #f59e0b;
  --blue:     #3b82f6;
  --red:      #ef4444;
  --text:     #c8d4cc;
  --text2:    #8cb09a;
  --muted:    #4a6352;
  --dim:      #2d4035;
  --mono:     'JetBrains Mono', monospace;
  --sans:     'DM Sans', sans-serif;
  --serif:    'Fraunces', serif;
}
body { background: var(--bg); color: var(--text); font-family: var(--sans); overflow-x: hidden; }
@keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
.page-enter { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
.mono { font-family: var(--mono); }
.label {
  font-size: 9px; font-weight: 600; letter-spacing: .12em;
  text-transform: uppercase; color: var(--dim);
  display: flex; align-items: center; gap: 5px;
}
.label-dot { width:3px; height:3px; border-radius:50%; background: var(--green); flex-shrink:0; }
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px 18px;
  position: relative; overflow: hidden;
}
.card::after {
  content:''; position:absolute; inset:0; border-radius:10px;
  background: linear-gradient(135deg, rgba(34,197,94,.025) 0%, transparent 50%);
  pointer-events: none;
}
.chip {
  display:inline-flex; align-items:center; gap:5px;
  font-size:10px; border-radius:20px; padding:3px 9px;
  cursor:default; user-select:none; transition:all .2s;
}
.chip-green   { color:var(--green); background:rgba(34,197,94,.07);  border:1px solid rgba(34,197,94,.15); }
.chip-offline { color:var(--red);   background:rgba(239,68,68,.07);  border:1px solid rgba(239,68,68,.15); }
.chip-waiting { color:var(--amber); background:rgba(245,158,11,.07); border:1px solid rgba(245,158,11,.2);  }
.badge {
  font-family:var(--mono); font-size:9px; color:var(--muted);
  background:var(--surface2); border:1px solid var(--border2);
  border-radius:4px; padding:3px 7px; letter-spacing:.05em;
}
.badge span { color:var(--green); }
input[type=range] {
  -webkit-appearance:none; width:100%; height:3px;
  background:var(--border); border-radius:2px; outline:none; cursor:pointer;
}
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance:none; width:11px; height:11px; border-radius:50%;
  background:var(--green); box-shadow:0 0 7px rgba(34,197,94,.5);
  cursor:pointer; transition:transform .15s;
}
input[type=range]::-webkit-slider-thumb:hover { transform:scale(1.3); }
.fab-goto-docs {
  display:flex; align-items:center; gap:10px;
  background: linear-gradient(135deg, #0f2016 0%, #0d1a10 100%);
  border: 1px solid rgba(34,197,94,.2);
  border-radius: 12px; padding: 14px 24px;
  cursor: pointer; transition: all .25s;
  color: var(--green); font-family: var(--sans); font-size:13px; font-weight:500;
  box-shadow: 0 0 30px rgba(34,197,94,.06);
}
.fab-goto-docs:hover {
  background: linear-gradient(135deg, #142b1c 0%, #112215 100%);
  border-color: rgba(34,197,94,.35);
  box-shadow: 0 0 40px rgba(34,197,94,.12);
  transform: translateY(-1px);
}
.fab-goto-docs svg { transition: transform .25s; }
.fab-goto-docs:hover svg { transform: translateX(4px); }

/* ── Waiting overlay ── */
@keyframes pulse-ring {
  0%   { transform:scale(.85); opacity:.6; }
  50%  { transform:scale(1.1); opacity:1; }
  100% { transform:scale(.85); opacity:.6; }
}
@keyframes spin-dot {
  to { transform: rotate(360deg); }
}
.wait-overlay {
  position:fixed; inset:0; z-index:50;
  background: rgba(6,10,8,.88);
  backdrop-filter: blur(6px);
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  gap:18px;
}
.wait-ring {
  width:72px; height:72px; border-radius:50%;
  border: 2px solid rgba(245,158,11,.15);
  position:relative;
  animation: pulse-ring 2.2s ease-in-out infinite;
}
.wait-ring::after {
  content:''; position:absolute; inset:6px; border-radius:50%;
  border: 2px solid transparent;
  border-top-color: var(--amber);
  border-right-color: rgba(245,158,11,.4);
  animation: spin-dot 1.1s linear infinite;
}
.wait-title {
  font-family: var(--mono); font-size:13px; color:var(--amber);
  letter-spacing:.12em; text-transform:uppercase;
}
.wait-sub {
  font-size:12px; color:var(--muted); max-width:280px; text-align:center; line-height:1.7;
}
.wait-error {
  font-family:var(--mono); font-size:10px; color:rgba(239,68,68,.6);
  background:rgba(239,68,68,.05); border:1px solid rgba(239,68,68,.1);
  border-radius:5px; padding:6px 14px; max-width:360px;
  text-align:center; word-break:break-all;
}
.wait-ws-status {
  font-family:var(--mono); font-size:9px; color:var(--dim);
  letter-spacing:.08em;
}
`;

/* ══════════════════════════════════════════════════════════════
   CONFIG
══════════════════════════════════════════════════════════════ */
const WS_ENV_URL = import.meta.env.VITE_WS_URL;
const WS_DIRECT_URL =
  import.meta.env.VITE_WS_DIRECT_URL || "ws://localhost:8765/ws";
const ENABLE_NODERED_FALLBACK =
  String(
    import.meta.env.VITE_ENABLE_NODERED_FALLBACK || "false",
  ).toLowerCase() === "true";
const WS_NODERED_URL =
  import.meta.env.VITE_WS_NODERED_URL || "ws://localhost:1880/ws/stm32";
const WS_FALLBACKS = ENABLE_NODERED_FALLBACK
  ? [WS_DIRECT_URL, WS_NODERED_URL]
  : [WS_DIRECT_URL];
const WS_URLS = [WS_ENV_URL, ...WS_FALLBACKS].filter(
  (v, i, arr) => typeof v === "string" && v.length > 0 && arr.indexOf(v) === i,
);
const HIST_LEN = 120;

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */
function adcToVolt(v) {
  return ((v / 4095) * 3.3).toFixed(3);
}
function fmtUptime(s) {
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
    .map((n) => n.toString().padStart(2, "0"))
    .join(":");
}

function extractNodeRedMessage(input) {
  if (!input || typeof input !== "object") return null;

  // Some websocket nodes can wrap user payload in msg.payload.
  if (input.payload && typeof input.payload === "object") {
    const nested = extractNodeRedMessage(input.payload);
    if (nested) return nested;
  }

  // Raw stream frame from STM32CubeMonitor.
  if (
    typeof input.variablename === "string" &&
    Array.isArray(input.variabledata) &&
    input.variabledata.length > 0
  ) {
    const last = input.variabledata[input.variabledata.length - 1] ?? {};
    const latest = Number(last?.y);
    const tRaw = Number(last?.x ?? last?.t ?? last?.time_s ?? NaN);
    const time_s = Number.isFinite(tRaw) ? tRaw : null;
    if (!Number.isFinite(latest)) return null;
    return {
      kind: "single",
      variablename: String(input.variablename),
      value: latest,
      time_s,
    };
  }

  // Consolidated frame from Node-RED function node.
  if (
    Object.prototype.hasOwnProperty.call(input, "mode") ||
    Object.prototype.hasOwnProperty.call(input, "var1") ||
    Object.prototype.hasOwnProperty.call(input, "adc") ||
    Object.prototype.hasOwnProperty.call(input, "adc_value") ||
    Object.prototype.hasOwnProperty.call(input, "led_status") ||
    Array.isArray(input.leds)
  ) {
    const tRaw = Number(
      input.time_s ??
        input.t ??
        (Number.isFinite(Number(input.ts)) ? Number(input.ts) / 1000 : NaN),
    );
    const time_s = Number.isFinite(tRaw) ? tRaw : null;
    return { kind: "state", state: input, time_s };
  }

  return null;
}

/* ══════════════════════════════════════════════════════════════
   DASHBOARD COMPONENTS
══════════════════════════════════════════════════════════════ */
function RingGauge({ value, max = 100, color = "#22c55e", size = 120 }) {
  const circ = 2 * Math.PI * 44;
  const clamped = Math.max(0, Math.min(value, max));
  const progress = max > 0 ? clamped / max : 0;
  const activeLen = circ * progress;
  const gapLen = circ - activeLen;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <circle
        cx="60"
        cy="60"
        r="44"
        fill="none"
        stroke="#0f1a12"
        strokeWidth="7"
      />
      <circle
        cx="60"
        cy="60"
        r="44"
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${activeLen} ${gapLen}`}
        strokeDashoffset={0}
        transform="rotate(-90 60 60)"
        style={{
          transition: "stroke-dasharray .35s cubic-bezier(.4,0,.2,1)",
          filter: `drop-shadow(0 0 6px ${color}55)`,
        }}
      />
    </svg>
  );
}

function TimeSeriesChart({
  data,
  title,
  color,
  yMin = 0,
  yMax = 100,
  unit = "",
  xLabel = "Time (s)",
  prominent = false,
}) {
  const width = 520;
  const height = 190;
  const padL = 36;
  const padR = 12;
  const padT = 12;
  const padB = 28;
  const drawW = width - padL - padR;
  const drawH = height - padT - padB;

  const safeData =
    Array.isArray(data) && data.length > 1 ? data : DEFAULT_HIST();
  const vals = safeData.map((p) => Number(p.v) || 0);
  const localMin = Math.min(...vals);
  const localMax = Math.max(...vals);
  const minV = Math.min(yMin, localMin);
  const maxV = Math.max(yMax, localMax);
  const range = Math.max(1, maxV - minV);

  const point = (idx, v) => {
    const x = padL + (idx / (safeData.length - 1)) * drawW;
    const y = padT + drawH - ((v - minV) / range) * drawH;
    return `${x},${y}`;
  };

  const points = safeData.map((p, idx) => {
    const x = padL + (idx / (safeData.length - 1)) * drawW;
    const y = padT + drawH - (((Number(p.v) || 0) - minV) / range) * drawH;
    return { x, y };
  });

  const smoothPath = (() => {
    if (points.length < 2) return "";
    if (points.length === 2)
      return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      d += ` Q ${points[i].x} ${points[i].y} ${midX} ${midY}`;
    }
    const last = points[points.length - 1];
    d += ` T ${last.x} ${last.y}`;
    return d;
  })();

  const startT = safeData[0]?.t ?? 0;
  const midT = safeData[Math.floor((safeData.length - 1) / 2)]?.t ?? 0;
  const endT = safeData[safeData.length - 1]?.t ?? 0;
  const fmtT = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n.toFixed(1) : "0.0";
  };

  return (
    <div className={`trend-card${prominent ? " primary" : ""}`}>
      <div className="label" style={{ marginBottom: 8 }}>
        <div className="label-dot" />
        {title}
      </div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
        {Array.from({ length: 6 }, (_, i) => {
          const y = padT + (i / 5) * drawH;
          return (
            <line
              key={`h-${i}`}
              x1={padL}
              y1={y}
              x2={width - padR}
              y2={y}
              stroke="#18221b"
              strokeWidth="1"
            />
          );
        })}
        <line
          x1={padL}
          y1={padT}
          x2={padL}
          y2={height - padB}
          stroke="#2a3a2f"
          strokeWidth="1"
        />
        <line
          x1={padL}
          y1={height - padB}
          x2={width - padR}
          y2={height - padB}
          stroke="#2a3a2f"
          strokeWidth="1"
        />
        <path
          d={smoothPath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <text
          x={4}
          y={padT + 6}
          fontSize="9"
          fill="#496250"
          fontFamily="JetBrains Mono,monospace"
        >
          {Math.round(maxV)}
          {unit}
        </text>
        <text
          x={4}
          y={height - padB + 4}
          fontSize="9"
          fill="#496250"
          fontFamily="JetBrains Mono,monospace"
        >
          {Math.round(minV)}
          {unit}
        </text>
        <text
          x={padL}
          y={height - 7}
          fontSize="9"
          fill="#5f7a68"
          fontFamily="JetBrains Mono,monospace"
        >
          {fmtT(startT)}
        </text>
        <text
          x={padL + drawW / 2}
          y={height - 7}
          fontSize="9"
          fill="#5f7a68"
          textAnchor="middle"
          fontFamily="JetBrains Mono,monospace"
        >
          {fmtT(midT)}
        </text>
        <text
          x={width - padR}
          y={height - 7}
          fontSize="9"
          fill="#5f7a68"
          textAnchor="end"
          fontFamily="JetBrains Mono,monospace"
        >
          {fmtT(endT)}
        </text>
        <text
          x={padL + drawW / 2}
          y={height - 1}
          fontSize="9"
          fill="#7a9584"
          textAnchor="middle"
          fontFamily="JetBrains Mono,monospace"
        >
          {xLabel}
        </text>
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   WAITING OVERLAY — tampil saat ST-Link belum terhubung
══════════════════════════════════════════════════════════════ */
function WaitingOverlay({ error, wsState }) {
  const wsLabel = {
    connecting: "Menyambung ke backend…",
    open: "Backend terhubung",
    closed: "Backend tidak aktif",
    error: "Koneksi backend gagal",
  };

  return (
    <div className="wait-overlay">
      <div className="wait-ring" />
      <div className="wait-title">Menunggu ST-Link…</div>
      <div className="wait-sub">
        Tancapkan kabel USB ST-Link ke laptop/PC.
        <br />
        Monitor akan aktif otomatis saat terdeteksi.
      </div>
      {error && error !== "Menunggu ST-Link… Tancapkan kabel USB ST-Link." && (
        <div className="wait-error">{error}</div>
      )}
      <div className="wait-ws-status">{wsLabel[wsState] ?? wsState}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════════════════ */
const DEFAULT_HIST = () =>
  Array.from({ length: HIST_LEN }, (_, i) => ({ t: i, v: 0 }));

function Dashboard({ onGoToDocs, canAccessDocs = true }) {
  /* ── State (semua diisi dari WebSocket) ── */
  const [connected, setConnected] = useState(false);
  const [wsState, setWsState] = useState("connecting"); // connecting | open | closed | error
  const [mode, setMode] = useState(0);
  const [var1, setVar1] = useState(0);
  const [leds, setLeds] = useState(Array(8).fill(0));
  const [adc, setAdc] = useState(0);
  const [signal, setSignal] = useState(0);
  const [extiFlag, setExtiFlag] = useState(0);
  const [uptime, setUptime] = useState(0);
  const [error, setError] = useState(null);
  const [hist, setHist] = useState(DEFAULT_HIST);
  const [varHist, setVarHist] = useState(DEFAULT_HIST);
  const [ledHist, setLedHist] = useState(DEFAULT_HIST);
  const [adcStats, setAdcStats] = useState({ min: 0, max: 0, sum: 0 });

  const tick = useRef(HIST_LEN);
  const timeBaseRef = useRef(null);
  const wsRef = useRef(null);
  const reconnect = useRef(null);
  const wsUrlIndexRef = useRef(0);
  const nodeRedState = useRef({
    mode: 0,
    var1: 0,
    adc_value: 0,
    signal: 0,
    exti_flag: 0,
    leds: Array(8).fill(0),
  });
  const nodeRedStartedAt = useRef(Date.now());

  /* ── WebSocket: sambung ke backend, auto-reconnect ── */
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    setWsState("connecting");

    const targetUrl = WS_URLS[wsUrlIndexRef.current % WS_URLS.length];
    const ws = new WebSocket(targetUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsState("open");
    };

    ws.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);

        const nodeRedMsg = extractNodeRedMessage(d);
        if (nodeRedMsg) {
          setConnected(true);
          setError(null);
          let varUpdated = false;
          let ledUpdated = false;
          let sampleT = tick.current++;
          const parsedTime = Number(nodeRedMsg.time_s);
          if (Number.isFinite(parsedTime)) {
            if (
              timeBaseRef.current === null ||
              parsedTime < timeBaseRef.current
            ) {
              timeBaseRef.current = parsedTime;
            }
            sampleT = Number((parsedTime - timeBaseRef.current).toFixed(3));
          }

          if (nodeRedMsg.kind === "single") {
            const { variablename, value } = nodeRedMsg;
            const varName = String(variablename).toLowerCase();
            if (varName === "mode") {
              nodeRedState.current.mode = Math.max(
                0,
                Math.min(3, Math.round(value)),
              );
            } else if (varName === "var1") {
              nodeRedState.current.var1 = value;
              varUpdated = true;
            } else if (varName === "adc_value" || varName === "adc") {
              const adcValue = Math.max(0, Math.min(4095, Math.round(value)));
              nodeRedState.current.adc_value = adcValue;
              nodeRedState.current.signal = adcValue;
            } else {
              if (varName === "led_status") {
                const bits = Number.isFinite(value) ? Math.trunc(value) : 0;
                nodeRedState.current.leds = Array.from(
                  { length: 8 },
                  (_, idx) => ((bits >> idx) & 1 ? 1 : 0),
                );
                ledUpdated = true;
              }
              const m = varName.match(/led[_\s-]*status(?:\[(\d+)\]|(\d+))/);
              if (m) {
                const idx = Number(m[1] ?? m[2]);
                if (idx >= 0 && idx < 8) {
                  nodeRedState.current.leds[idx] = value ? 1 : 0;
                  ledUpdated = true;
                }
              }
            }
          } else if (nodeRedMsg.kind === "state") {
            const s = nodeRedMsg.state;
            if (Number.isFinite(Number(s.mode))) {
              nodeRedState.current.mode = Math.max(
                0,
                Math.min(3, Math.round(Number(s.mode))),
              );
            }
            if (Number.isFinite(Number(s.exti_flag))) {
              nodeRedState.current.exti_flag = Number(s.exti_flag) ? 1 : 0;
            }
            if (Number.isFinite(Number(s.var1))) {
              nodeRedState.current.var1 = Number(s.var1);
              varUpdated = true;
            }
            if (Number.isFinite(Number(s.adc_value))) {
              const adcValue = Math.max(
                0,
                Math.min(4095, Math.round(Number(s.adc_value))),
              );
              nodeRedState.current.adc_value = adcValue;
            }
            if (Number.isFinite(Number(s.adc))) {
              const adcValue = Math.max(
                0,
                Math.min(4095, Math.round(Number(s.adc))),
              );
              nodeRedState.current.adc_value = adcValue;
            }
            if (Number.isFinite(Number(s.signal))) {
              nodeRedState.current.signal = Math.max(
                0,
                Math.min(4095, Math.round(Number(s.signal))),
              );
            }
            if (Array.isArray(s.leds)) {
              const normalized = s.leds.slice(0, 8).map((x) => (x ? 1 : 0));
              while (normalized.length < 8) normalized.push(0);
              nodeRedState.current.leds = normalized;
              ledUpdated = true;
            }
            if (Array.isArray(s.led_status)) {
              const normalized = s.led_status
                .slice(0, 8)
                .map((x) => (x ? 1 : 0));
              while (normalized.length < 8) normalized.push(0);
              nodeRedState.current.leds = normalized;
              ledUpdated = true;
            }
            if (Number.isFinite(Number(s.led_status))) {
              const bits = Math.trunc(Number(s.led_status));
              nodeRedState.current.leds = Array.from({ length: 8 }, (_, idx) =>
                (bits >> idx) & 1 ? 1 : 0,
              );
              ledUpdated = true;
            }
          }

          const nr = nodeRedState.current;
          const nrAdc = nr.adc_value;
          const explicitSignal = Number(nr.signal);
          const nrSignal =
            Number.isFinite(explicitSignal) && explicitSignal > 0
              ? explicitSignal
              : nrAdc > 0
                ? nrAdc
                : Math.max(0, Math.min(4095, Math.round(nr.var1)));

          setMode(nr.mode);
          setVar1(nr.var1);
          setLeds([...nr.leds]);
          setAdc(nrAdc);
          setSignal(nrSignal);
          setExtiFlag(Number(nr.exti_flag) ? 1 : 0);
          setUptime(Math.floor((Date.now() - nodeRedStartedAt.current) / 1000));
          const ledOnCount = nr.leds.reduce((acc, v) => acc + (v ? 1 : 0), 0);

          setHist((h) => {
            const next = [...h.slice(1), { t: sampleT, v: nrSignal }];
            setAdcStats({
              min: Math.min(...next.map((x) => x.v)),
              max: Math.max(...next.map((x) => x.v)),
              sum: next.reduce((a, x) => a + x.v, 0),
            });
            return next;
          });
          if (varUpdated || nodeRedMsg.kind === "state") {
            setVarHist((h) => [
              ...h.slice(1),
              { t: sampleT, v: Math.round(nr.var1) },
            ]);
          }
          if (ledUpdated || nodeRedMsg.kind === "state") {
            setLedHist((h) => [...h.slice(1), { t: sampleT, v: ledOnCount }]);
          }
          return;
        }

        setConnected(!!d.connected);
        setError(d.error ?? null);

        if (d.connected) {
          const sampleT = tick.current++;
          const adcVal = Number(d.adc ?? 0);
          const signalVal = Number(d.signal ?? d.adc ?? 0);
          const v = Number.isFinite(signalVal)
            ? Math.max(0, Math.min(4095, Math.round(signalVal)))
            : 0;

          setAdc(
            Number.isFinite(adcVal)
              ? Math.max(0, Math.min(4095, Math.round(adcVal)))
              : 0,
          );
          setSignal(v);
          setExtiFlag(Number(d.exti_flag) ? 1 : 0);
          if (Array.isArray(d.leds)) {
            const normalized = d.leds.slice(0, 8).map((x) => (x ? 1 : 0));
            while (normalized.length < 8) normalized.push(0);
            setLeds(normalized);
            setLedHist((h) => [
              ...h.slice(1),
              {
                t: sampleT,
                v: normalized.reduce((acc, val) => acc + (val ? 1 : 0), 0),
              },
            ]);
          }
          setUptime(d.uptime ?? 0);
          if (Number.isFinite(Number(d.mode))) {
            setMode(Math.max(0, Math.min(3, Math.round(Number(d.mode)))));
          }
          if (Number.isFinite(Number(d.var1))) {
            setVar1(Number(d.var1));
            setVarHist((h) => [
              ...h.slice(1),
              { t: sampleT, v: Math.round(Number(d.var1)) },
            ]);
          }

          /* Rolling history */
          setHist((h) => {
            const next = [...h.slice(1), { t: sampleT, v }];
            setAdcStats({
              min: Math.min(...next.map((x) => x.v)),
              max: Math.max(...next.map((x) => x.v)),
              sum: next.reduce((a, x) => a + x.v, 0),
            });
            return next;
          });
        }
      } catch (_) {}
    };

    ws.onerror = () => setWsState("error");

    ws.onclose = () => {
      setWsState("closed");
      setConnected(false);
      wsUrlIndexRef.current = (wsUrlIndexRef.current + 1) % WS_URLS.length;
      /* Auto-reconnect setiap 2 detik jika backend mati */
      reconnect.current = setTimeout(connect, 2000);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnect.current);
      wsRef.current?.close();
    };
  }, [connect]);

  /* ── Computed ── */
  const volt = adcToVolt(adc);
  const signalPct = Math.round((signal / 4095) * 100);
  const gaugeAdc = mode === 3 ? 4095 - adc : adc;
  const gaugeVolt = adcToVolt(gaugeAdc);
  const gaugeSignalPct = Math.round((gaugeAdc / 4095) * 100);
  const displayAdc = mode === 3 ? gaugeAdc : adc;
  const displayVolt = mode === 3 ? gaugeVolt : volt;
  const adcColor =
    displayAdc > 3000 ? "#f59e0b" : displayAdc < 900 ? "#3b82f6" : "#22c55e";
  const ledOnCount = leds.reduce((acc, v) => acc + (v ? 1 : 0), 0);
  const panelLeds = mode === 1 ? Array(8).fill(0) : leds;
  const panelLedOnCount = panelLeds.reduce((acc, v) => acc + (v ? 1 : 0), 0);
  const ledByte = leds.reduce(
    (acc, bit, idx) => acc | ((bit ? 1 : 0) << idx),
    0,
  );
  const ledBin = ledByte.toString(2).padStart(8, "0");
  const ledHex = `0x${ledByte.toString(16).toUpperCase().padStart(2, "0")}`;
  const scanIdx =
    mode === 1 || panelLedOnCount > 0
      ? -1
      : ((Math.abs(Math.round(var1)) % 8) + 8) % 8;
  const modeLabel =
    mode === 0
      ? "Mode 0 - Shift Left"
      : mode === 1
        ? "Mode 1 - Sawtooth 0..2 lalu 0..52"
        : mode === 2
          ? "Mode 2 - Potensio Bar Graph"
          : "Mode 3 - Potensio RGB";
  const modeColor =
    mode === 1
      ? "#38bdf8"
      : mode === 2
        ? "#22c55e"
        : mode === 3
          ? "#f59e0b"
          : "#e2ebe5";
  const rgbAdc = 4095 - adc;
  const rgbState = (() => {
    if (rgbAdc < 500) return { name: "WHITE", r: 255, g: 255, b: 255 };
    if (rgbAdc < 1000) return { name: "MAGENTA", r: 255, g: 80, b: 235 };
    if (rgbAdc < 1500) return { name: "CYAN", r: 60, g: 235, b: 235 };
    if (rgbAdc < 2000) return { name: "YELLOW", r: 255, g: 220, b: 60 };
    if (rgbAdc < 2600) return { name: "BLUE", r: 70, g: 130, b: 255 };
    if (rgbAdc < 3300) return { name: "GREEN", r: 40, g: 255, b: 110 };
    return { name: "RED", r: 255, g: 40, b: 40 };
  })();
  const rgbActive = mode === 3;
  const rgbColor = rgbActive
    ? `rgb(${rgbState.r}, ${rgbState.g}, ${rgbState.b})`
    : "#1a2320";

  /* ── Dashboard CSS ── */
  const css = `
    .db-wrap { padding: 20px 24px 40px; min-height:100vh; position:relative; }
    .db-wrap::before { content:''; position:fixed; inset:0; background:
      radial-gradient(ellipse 60% 40% at 15% 10%, rgba(34,197,94,.04) 0%, transparent 60%),
      radial-gradient(ellipse 50% 30% at 85% 80%, rgba(245,158,11,.03) 0%, transparent 60%);
      pointer-events:none; z-index:0; }
    .db-wrap > * { position:relative; z-index:1; }
    .hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:22px; padding-bottom:14px; border-bottom:1px solid #0f1a12; flex-wrap:wrap; gap:10px; }
    .hdr-ident { display:flex; align-items:center; gap:12px; }
    .hdr-dot { width:8px; height:8px; border-radius:50%; background:var(--green); box-shadow:0 0 10px var(--green); animation:pdot 2s ease-in-out infinite; flex-shrink:0; }
    .hdr-dot.offline { background:var(--amber); box-shadow:0 0 10px var(--amber); }
    @keyframes pdot { 0%,100%{ box-shadow:0 0 8px currentColor; } 50%{ box-shadow:0 0 20px currentColor; } }
    .hdr-title { font-size:12px; font-weight:600; color:#e2ebe5; letter-spacing:.08em; text-transform:uppercase; }
    .hdr-sub { font-size:10px; color:var(--muted); margin-top:1px; }
    .hdr-right { display:flex; align-items:center; gap:9px; flex-wrap:wrap; }
    .g3 { display:grid; grid-template-columns:1fr; gap:14px; margin-bottom:14px; }
    .g1 { margin-bottom:14px; }
    .g3b { display:grid; grid-template-columns:1.2fr 1fr 1fr; gap:14px; margin-bottom:28px; }
    .adc-num { font-family:var(--mono); font-size:36px; font-weight:300; color:#e8f3eb; line-height:1; letter-spacing:-.02em; margin-bottom:3px; }
    .adc-num span { font-size:13px; color:var(--dim); margin-left:4px; }
    .adc-sub { font-size:10px; color:var(--muted); margin-bottom:11px; }
    .bar-track { height:3px; background:#0f1a12; border-radius:2px; overflow:hidden; margin-bottom:4px; }
    .bar-fill { height:100%; border-radius:2px; background:linear-gradient(90deg,#166534,var(--green)); transition:width .35s cubic-bezier(.4,0,.2,1); }
    .adc-range { display:flex; justify-content:space-between; font-family:var(--mono); font-size:8px; color:var(--dim); }
    .volt { font-family:var(--mono); font-size:20px; color:var(--amber); margin-top:8px; }
    .volt span { font-size:9px; color:#78430a; margin-left:2px; }
    .mini-stats { display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; margin-top:10px; }
    .ms { background:var(--surface2); border:1px solid var(--border); border-radius:5px; padding:6px 8px; }
    .ms-k { font-size:8px; color:var(--dim); text-transform:uppercase; letter-spacing:.1em; margin-bottom:2px; }
    .ms-v { font-family:var(--mono); font-size:12px; color:var(--text2); }
    .gauge-grid { display:grid; grid-template-columns:repeat(3,minmax(140px,1fr)); gap:10px; }
    .gauge-card { background:var(--surface2); border:1px solid var(--border); border-radius:8px; padding:10px 8px 8px; display:flex; flex-direction:column; align-items:center; }
    .gauge-title { font-size:8px; color:var(--dim); text-transform:uppercase; letter-spacing:.1em; margin-bottom:4px; }
    .gauge-val { font-family:var(--mono); font-size:16px; color:#e2ebe5; margin-top:2px; }
    .gauge-sub { font-size:9px; color:var(--muted); }
    .led-seq { display:grid; grid-template-columns:repeat(8,minmax(24px,1fr)); gap:8px; margin-top:6px; margin-bottom:12px; }
    .led-pill { border:1px solid var(--border); border-radius:8px; background:#0a120d; padding:8px 3px; display:flex; flex-direction:column; align-items:center; gap:4px; }
    .led-bulb { width:12px; height:12px; border-radius:50%; background:#1a2a20; box-shadow: inset 0 0 0 1px #203126; transition:all .2s; }
    .led-bulb.on { background:#22c55e; box-shadow:0 0 12px rgba(34,197,94,.65), 0 0 20px rgba(34,197,94,.3); animation:ledPulse .8s ease-in-out infinite; }
    .led-bulb.scan { background:#38bdf8; box-shadow:0 0 10px rgba(56,189,248,.55), 0 0 18px rgba(56,189,248,.25); animation:ledPulse .9s ease-in-out infinite; }
    .led-idx { font-family:var(--mono); font-size:8px; color:var(--dim); }
    @keyframes ledPulse { 0%,100%{ transform:scale(1); } 50%{ transform:scale(1.18); } }
    .trend-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; margin-top:14px; }
    .trend-card { background:var(--surface2); border:1px solid var(--border); border-radius:8px; padding:10px; }
    .signal-cluster { border:1px solid #172017; border-radius:12px; padding:12px; background:linear-gradient(140deg, rgba(8,13,10,.98), rgba(13,22,16,.95)); }
    .signal-cluster-title { font-family:var(--mono); font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:#9ac5ad; margin-bottom:10px; }
    .led-meta { display:flex; gap:8px; flex-wrap:wrap; margin-top:4px; margin-bottom:10px; }
    .led-meta-item { font-family:var(--mono); font-size:9px; color:var(--muted); background:#0b140e; border:1px solid var(--border); border-radius:5px; padding:5px 8px; letter-spacing:.06em; }
    .led-meta-item b { color:var(--green); font-weight:500; }
    .mode-note { margin-top:8px; margin-bottom:10px; font-family:var(--mono); font-size:10px; color:var(--muted); }
    .mode-hero { margin-top:12px; margin-bottom:14px; border:1px solid rgba(34,197,94,.25); border-radius:12px; background:linear-gradient(135deg, rgba(34,197,94,.09) 0%, rgba(56,189,248,.08) 100%); padding:12px 14px; display:flex; align-items:flex-end; justify-content:space-between; gap:10px; }
    .mode-hero-num { font-family:var(--mono); font-size:42px; line-height:1; color:#e7fff0; font-weight:700; letter-spacing:.02em; text-shadow:0 0 18px rgba(34,197,94,.25); }
    .mode-hero-title { font-family:var(--mono); font-size:13px; color:var(--text); letter-spacing:.08em; text-transform:uppercase; }
    .mode-hero-desc { font-size:12px; color:#a3c3b0; margin-top:2px; }
    .exti-banner { margin-top:10px; border:1px solid rgba(239,68,68,.25); background:rgba(239,68,68,.08); color:#fca5a5; border-radius:8px; padding:8px 10px; font-family:var(--mono); font-size:10px; letter-spacing:.06em; }
    .rgb-panel { margin-top:10px; margin-bottom:12px; border:1px solid #1a2a23; border-radius:10px; padding:10px 12px; background:linear-gradient(140deg, #0b120e, #0f1a13); }
    .rgb-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; font-family:var(--mono); font-size:10px; letter-spacing:.08em; text-transform:uppercase; color:#9ab6a4; }
    .rgb-lamp-wrap { display:flex; align-items:center; gap:10px; }
    .rgb-lamp { width:32px; height:32px; border-radius:50%; border:1px solid #2a3a2f; box-shadow:inset 0 0 6px rgba(0,0,0,.65); transition:all .2s ease; }
    .rgb-lamp.active { box-shadow:0 0 18px currentColor, 0 0 30px color-mix(in srgb, currentColor 55%, transparent), inset 0 0 10px rgba(255,255,255,.3); }
    .rgb-name { font-family:var(--mono); font-size:12px; color:#d4e5db; }
    .rgb-sub { font-size:10px; color:var(--muted); margin-top:2px; }
    .si-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
    .si { background:var(--surface2); border:1px solid var(--border); border-radius:5px; padding:6px 8px; }
    .si-k { font-size:8px; color:var(--dim); text-transform:uppercase; letter-spacing:.1em; margin-bottom:2px; }
    .si-v { font-family:var(--mono); font-size:11px; color:var(--text); }
    .pin-row { display:flex; align-items:center; gap:8px; padding:6px 0; border-bottom:1px solid #0f1510; }
    .pin-row:last-of-type { border-bottom:none; }
    .pin-tag { font-family:var(--mono); font-size:10px; background:#0f1a12; border:1px solid var(--border2); border-radius:4px; padding:2px 6px; color:var(--green); min-width:36px; text-align:center; flex-shrink:0; }
    .pin-desc { font-size:10px; flex:1; }
    .pin-mode { font-size:8px; color:var(--muted); background:var(--surface2); border:1px solid var(--border); border-radius:3px; padding:2px 5px; text-transform:uppercase; letter-spacing:.07em; white-space:nowrap; }
    .irq-row { display:flex; justify-content:space-between; align-items:center; padding:5px 0; border-bottom:1px solid #0f1510; }
    .irq-row:last-of-type { border-bottom:none; }
    .irq-name { font-family:var(--mono); color:#6a9079; font-size:9px; }
    .docs-btn-wrap { display:flex; justify-content:center; padding: 8px 0 4px; }
    input[type=range]:disabled { opacity:.35; cursor:not-allowed; }
    @media(max-width:1200px){.trend-grid{grid-template-columns:1fr 1fr}}
    @media(max-width:860px){.g3b{grid-template-columns:1fr 1fr}.gauge-grid{grid-template-columns:1fr 1fr}.trend-grid{grid-template-columns:1fr}}
    @media(max-width:580px){.g3b,.gauge-grid{grid-template-columns:1fr}}
  `;

  /* ── Chip status ── */
  const chipClass = connected
    ? "chip-green"
    : wsState === "closed" || wsState === "error"
      ? "chip-offline"
      : "chip-waiting";
  const chipLabel = connected
    ? "CONNECTED"
    : wsState === "closed" || wsState === "error"
      ? "BACKEND OFFLINE"
      : "WAITING…";

  const docsBtnLabel = canAccessDocs
    ? "Buka Dokumentasi Laporan SBM"
    : "Dokumentasi terkunci (backend/ST-Link offline)";

  return (
    <>
      <style>{css}</style>

      {/* Overlay waiting ketika ST-Link belum tancap */}
      {!connected && <WaitingOverlay error={error} wsState={wsState} />}

      <div
        className="db-wrap page-enter"
        style={
          !connected
            ? {
                filter: "blur(1.5px) grayscale(.4)",
                pointerEvents: "none",
                userSelect: "none",
              }
            : {}
        }
      >
        {/* Header */}
        <header className="hdr">
          <div className="hdr-ident">
            <div
              className={`hdr-dot${connected ? "" : ""}`}
              style={
                connected
                  ? {}
                  : {
                      background: "var(--amber)",
                      boxShadow: "0 0 10px var(--amber)",
                    }
              }
            />
            <div>
              <div className="hdr-title">SBM Monitor</div>
              <div className="hdr-sub">
                sbmproject · dnday · STM32F401CCUx · Live via ST-Link
              </div>
            </div>
          </div>
          <div className="hdr-right">
            <div className="badge">
              MCU <span>STM32F401CCUx</span>
            </div>
            <div className="badge">
              CLK <span>16 MHz</span>
            </div>
            <div className="badge">
              MODE <span>{mode}</span>
            </div>
            <div className="badge">
              VAR1 <span>{Math.round(var1)}</span>
            </div>
            <div className="badge">
              LED ON <span>{ledOnCount}/8</span>
            </div>
            <div className="badge">
              EXTI <span>{extiFlag ? "ACTIVE" : "IDLE"}</span>
            </div>
            <div className="badge">
              UPTIME <span>{fmtUptime(uptime)}</span>
            </div>
            <div className={`chip ${chipClass}`}>
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "currentColor",
                }}
              />
              {chipLabel}
            </div>
          </div>
        </header>

        <div className="mode-hero">
          <div>
            <div className="mode-hero-title">Active Mode</div>
            <div className="mode-hero-desc" style={{ color: modeColor }}>
              {modeLabel}
            </div>
          </div>
          <div className="mode-hero-num">{mode}</div>
        </div>

        {/* Row 1 */}
        <div className="g3">
          {/* ADC */}
          <div className="card">
            <div className="label" style={{ marginBottom: 10 }}>
              <div className="label-dot" />
              ADC1 — Channel 0 · PA0
            </div>
            <div className="adc-num">
              {displayAdc.toString().padStart(4, "0")}
              <span>/ 4095</span>
            </div>
            <div className="adc-sub">
              12-bit · Continuous · 3-cycle sampling
            </div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${(displayAdc / 4095) * 100}%` }}
              />
            </div>
            <div className="adc-range">
              <span>0</span>
              <span>2048</span>
              <span>4095</span>
            </div>
            <div className="volt">
              {displayVolt}
              <span>V</span>
            </div>
            <div className="mini-stats">
              <div className="ms">
                <div className="ms-k">Min</div>
                <div className="ms-v">{adcStats.min}</div>
              </div>
              <div className="ms">
                <div className="ms-k">Max</div>
                <div className="ms-v">{adcStats.max}</div>
              </div>
              <div className="ms">
                <div className="ms-k">Avg</div>
                <div className="ms-v">
                  {Math.round(adcStats.sum / HIST_LEN)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gauges */}
        <div className="g1">
          <div className="card">
            <div className="label" style={{ marginTop: 14, marginBottom: 8 }}>
              <div className="label-dot" />
              LED Sequence Activity
            </div>
            <div className="led-seq">
              {Array.from({ length: 8 }, (_, i) => {
                return (
                  <div key={i} className="led-pill">
                    <div
                      className={`led-bulb ${panelLeds[i] ? "on" : ""} ${!panelLeds[i] && i === scanIdx ? "scan" : ""}`}
                    />
                    <div className="led-idx">LED{i}</div>
                  </div>
                );
              })}
            </div>

            <div className="mode-note">{modeLabel}</div>

            <div className="rgb-panel">
              <div className="rgb-head">
                <span>Mode 3 RGB Light</span>
                <span>{rgbActive ? "ACTIVE" : "STANDBY"}</span>
              </div>
              <div className="rgb-lamp-wrap">
                <div
                  className={`rgb-lamp ${rgbActive ? "active" : ""}`}
                  style={{ background: rgbColor, color: rgbColor }}
                />
                <div>
                  <div className="rgb-name">
                    {rgbActive ? rgbState.name : "OFF"}
                  </div>
                  <div className="rgb-sub">ADC: {gaugeAdc} / 4095</div>
                </div>
              </div>
            </div>

            <div className="led-meta">
              <div className="led-meta-item">
                ON: <b>{panelLedOnCount}/8</b>
              </div>
              <div className="led-meta-item">
                BIN: <b>{ledBin}</b>
              </div>
              <div className="led-meta-item">
                HEX: <b>{ledHex}</b>
              </div>
            </div>

            <div className="trend-grid">
              <div className="signal-cluster">
                <div className="signal-cluster-title">Increment Monitor</div>
                <TimeSeriesChart
                  data={hist}
                  title="CubeMonitor Signal Trend"
                  color="#22c55e"
                  yMin={0}
                  yMax={4095}
                  xLabel="Relative Time (s)"
                />
              </div>
              <TimeSeriesChart
                data={varHist}
                title="VAR1 / Count Trend"
                color="#38bdf8"
                yMin={0}
                yMax={52}
                xLabel="Relative Time (s)"
              />
              <TimeSeriesChart
                data={ledHist}
                title="LED ON Count Trend"
                color="#22c55e"
                yMin={0}
                yMax={8}
                xLabel="Relative Time (s)"
              />
            </div>
            {extiFlag === 1 && (
              <div className="exti-banner">
                EXTI PB0 aktif: semua LED ON 5 detik, lalu restore.
              </div>
            )}

            <div className="label" style={{ marginTop: 14, marginBottom: 10 }}>
              <div className="label-dot" />
              Realtime Gauge Panel
            </div>
            <div className="gauge-grid">
              <div className="gauge-card">
                <div className="gauge-title">ADC Raw</div>
                <RingGauge
                  value={gaugeAdc}
                  max={4095}
                  color={adcColor}
                  size={122}
                />
                <div className="gauge-val" style={{ color: adcColor }}>
                  {gaugeAdc}
                </div>
                <div className="gauge-sub">0 - 4095</div>
              </div>
              <div className="gauge-card">
                <div className="gauge-title">Voltage</div>
                <RingGauge
                  value={Number(gaugeVolt)}
                  max={3.3}
                  color="#f59e0b"
                  size={122}
                />
                <div className="gauge-val" style={{ color: "#f59e0b" }}>
                  {gaugeVolt} V
                </div>
                <div className="gauge-sub">ADC / 4095 x 3.3</div>
              </div>
              <div className="gauge-card">
                <div className="gauge-title">Signal Activity</div>
                <RingGauge
                  value={gaugeAdc}
                  max={4095}
                  color="#22c55e"
                  size={122}
                />
                <div className="gauge-val" style={{ color: "#22c55e" }}>
                  {gaugeSignalPct}%
                </div>
                <div className="gauge-sub">Fallback-aware realtime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="g3b">
          <div className="card">
            <div className="label" style={{ marginBottom: 10 }}>
              <div className="label-dot" />
              System Info
            </div>
            <div className="si-grid">
              {[
                ["MCU", "STM32F401CCUx", true],
                ["Family", "STM32F4", true],
                ["Package", "UFQFPN48"],
                ["Flash", "256 KB"],
                ["RAM", "64 KB"],
                ["Heap", "0x200"],
                ["Stack", "0x400"],
                ["Firmware", "FW_F4 V1.28.3"],
                ["Toolchain", "STM32CubeIDE"],
                ["Compiler", "GCC -O6"],
              ].map(([k, v, ac]) => (
                <div key={k} className="si">
                  <div className="si-k">{k}</div>
                  <div
                    className="si-v"
                    style={ac ? { color: "var(--green)" } : {}}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="label" style={{ marginBottom: 10 }}>
              <div className="label-dot" />
              Pin Configuration
            </div>
            {[
              ["PA0", "ADC1 Ch0 input", "Analog In"],
              ["PA8", "TIM1 CH1 output", "Alt Func"],
              ["NRST", "Reset", "Reset"],
              ["VDD", "3.3V supply", "Power"],
              ["VSS", "Ground", "GND"],
            ].map(([p, d, m]) => (
              <div key={p} className="pin-row">
                <div className="pin-tag">{p}</div>
                <div className="pin-desc">{d}</div>
                <div className="pin-mode">{m}</div>
              </div>
            ))}
            <div
              style={{
                marginTop: 11,
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "9px 11px",
              }}
            >
              <div
                style={{
                  fontSize: 8,
                  color: "var(--dim)",
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Clock Tree
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  color: "var(--text2)",
                  lineHeight: 1.9,
                }}
              >
                HSI 16 MHz → SYSCLK
                <br />→ AHB / APB1 / APB2
                <br />
                <span style={{ color: "var(--muted)" }}>
                  All buses @ 16 MHz
                </span>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="label" style={{ marginBottom: 10 }}>
              <div className="label-dot" />
              NVIC — Interrupt Config
            </div>
            {[
              ["TIM1_UP_TIM10_IRQn", "P0"],
              ["SysTick_IRQn", "P15"],
              ["HardFault_IRQn", "—"],
              ["MemManage_IRQn", "—"],
              ["BusFault_IRQn", "—"],
              ["UsageFault_IRQn", "—"],
              ["PendSV_IRQn", "—"],
              ["SVCall_IRQn", "—"],
            ].map(([n, p]) => (
              <div key={n} className="irq-row">
                <div className="irq-name">{n}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 8,
                      color: "var(--dim)",
                    }}
                  >
                    {p}
                  </span>
                  <span style={{ color: "var(--green)", fontSize: 9 }}>
                    ENABLED
                  </span>
                </div>
              </div>
            ))}
            <div
              style={{
                marginTop: 10,
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: 5,
                padding: "9px 11px",
              }}
            >
              <div
                style={{
                  fontSize: 8,
                  color: "var(--dim)",
                  textTransform: "uppercase",
                  letterSpacing: ".1em",
                  marginBottom: 3,
                }}
              >
                Priority Group
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                  color: "var(--green)",
                }}
              >
                NVIC_PRIORITYGROUP_4
              </div>
            </div>
          </div>
        </div>

        {/* Docs Button */}
        <div className="docs-btn-wrap">
          <button
            className="fab-goto-docs"
            onClick={onGoToDocs}
            disabled={!canAccessDocs}
            style={
              !canAccessDocs ? { opacity: 0.55, cursor: "not-allowed" } : {}
            }
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path d="M9 12h6M9 16h6M9 8h4M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
            </svg>
            <span>{docsBtnLabel}</span>
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   DOCS PAGE  (tidak ada perubahan dari versi asli)
══════════════════════════════════════════════════════════════ */
const SECTIONS = [
  { id: "pendahuluan", title: "Pendahuluan" },
  { id: "landasan", title: "Landasan Teori" },
  { id: "hardware", title: "Spesifikasi Hardware" },
  { id: "perancangan", title: "Perancangan Sistem" },
  { id: "peripheral", title: "Konfigurasi Peripheral" },
  { id: "firmware", title: "Firmware & Kode" },
  { id: "pengujian", title: "Pengujian & Hasil" },
  { id: "analisis", title: "Analisis & Pembahasan" },
  { id: "kesimpulan", title: "Kesimpulan" },
  { id: "referensi", title: "Referensi" },
];

function CodeBlock({ children, lang = "c" }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div
      style={{
        background: "#050807",
        border: "1px solid #0f1a12",
        borderRadius: 8,
        overflow: "hidden",
        margin: "16px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "7px 14px",
          borderBottom: "1px solid #0f1a12",
          background: "#090e0b",
        }}
      >
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 9,
            color: "var(--dim)",
            textTransform: "uppercase",
            letterSpacing: ".1em",
          }}
        >
          {lang}
        </span>
        <button
          onClick={copy}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: copied ? "var(--green)" : "var(--dim)",
            fontFamily: "var(--mono)",
            fontSize: 9,
            letterSpacing: ".05em",
            transition: "color .2s",
          }}
        >
          {copied ? "COPIED ✓" : "COPY"}
        </button>
      </div>
      <pre
        style={{
          padding: "14px 16px",
          overflowX: "auto",
          fontFamily: "var(--mono)",
          fontSize: 12,
          lineHeight: 1.75,
          color: "#9ecfb0",
          margin: 0,
        }}
      >
        <code>{children.trim()}</code>
      </pre>
    </div>
  );
}

function InfoBox({ type = "info", children }) {
  const cfg = {
    info: {
      bg: "rgba(34,197,94,.05)",
      border: "rgba(34,197,94,.15)",
      icon: "ℹ",
      color: "#22c55e",
    },
    warn: {
      bg: "rgba(245,158,11,.05)",
      border: "rgba(245,158,11,.15)",
      icon: "⚠",
      color: "#f59e0b",
    },
    note: {
      bg: "rgba(59,130,246,.05)",
      border: "rgba(59,130,246,.15)",
      icon: "✦",
      color: "#3b82f6",
    },
  }[type];
  return (
    <div
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 8,
        padding: "12px 16px",
        margin: "16px 0",
        display: "flex",
        gap: 12,
      }}
    >
      <span style={{ color: cfg.color, fontSize: 14, flexShrink: 0 }}>
        {cfg.icon}
      </span>
      <div style={{ fontSize: 13, lineHeight: 1.7, color: "var(--text2)" }}>
        {children}
      </div>
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", margin: "16px 0" }}>
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}
      >
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  padding: "7px 10px",
                  borderBottom: "1px solid #0f1a12",
                  color: "var(--dim)",
                  fontWeight: 500,
                  letterSpacing: ".07em",
                  fontSize: 9,
                  textTransform: "uppercase",
                  fontFamily: "var(--mono)",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #080d09" }}>
              {r.map((c, j) => (
                <td
                  key={j}
                  style={{
                    padding: "7px 10px",
                    color: j === 3 ? "var(--green)" : "var(--text2)",
                    fontFamily: j === 3 || j === 0 ? "var(--mono)" : undefined,
                    fontSize: 12,
                  }}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionTitle({ id, num, children }) {
  return (
    <div
      id={id}
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 10,
        margin: "32px 0 14px",
        scrollMarginTop: 20,
      }}
    >
      <span
        style={{
          fontFamily: "var(--mono)",
          fontSize: 10,
          color: "var(--muted)",
        }}
      >
        {String(num).padStart(2, "0")}
      </span>
      <h2
        style={{
          fontFamily: "var(--serif)",
          fontSize: 22,
          fontWeight: 300,
          color: "#d8e8dc",
        }}
      >
        {children}
      </h2>
    </div>
  );
}

function DocsPage({ onBack }) {
  const [active, setActive] = useState("pendahuluan");
  const obRef = useRef(null);
  useEffect(() => {
    obRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obRef.current.observe(el);
    });
    return () => obRef.current?.disconnect();
  }, []);

  const docsCss = `
    .docs-wrap { display:flex; min-height:100vh; }
    .docs-nav { width:200px; flex-shrink:0; position:sticky; top:0; height:100vh; overflow-y:auto; padding:28px 0; border-right:1px solid #0a1009; }
    .nav-logo { padding:0 20px 20px; border-bottom:1px solid #0a1009; margin-bottom:16px; }
    .nav-logo-t { font-size:11px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:#e2ebe5; }
    .nav-logo-s { font-size:9px; color:var(--muted); margin-top:2px; }
    .nav-item { display:block; padding:6px 20px; font-size:11px; color:var(--muted); cursor:pointer; transition:all .15s; border-left:2px solid transparent; }
    .nav-item:hover { color:var(--text); }
    .nav-item.active { color:var(--green); border-left-color:var(--green); background:rgba(34,197,94,.03); }
    .nav-num { font-family:var(--mono); font-size:9px; color:var(--dim); margin-right:6px; }
    .docs-main { flex:1; max-width:720px; padding:40px 48px; }
    .docs-hero { margin-bottom:40px; padding-bottom:28px; border-bottom:1px solid #0a1009; }
    .docs-hero-tag { font-family:var(--mono); font-size:9px; color:var(--muted); letter-spacing:.12em; text-transform:uppercase; margin-bottom:10px; }
    .docs-hero-title { font-family:var(--serif); font-size:32px; font-weight:300; color:#d8e8dc; line-height:1.2; margin-bottom:10px; }
    .docs-hero-meta { display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; }
    .prose p { font-size:13.5px; line-height:1.85; color:var(--text2); margin-bottom:12px; }
    .prose strong { color:var(--text); font-weight:500; }
    .prose code { font-family:var(--mono); font-size:11px; background:#0a0f0b; border:1px solid #0f1a12; border-radius:3px; padding:1px 5px; color:#9ecfb0; }
    .section-divider { border:none; border-top:1px solid #0a1009; margin:32px 0; }
    .spec-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin:16px 0; }
    .spec-card { background:var(--surface); border:1px solid var(--border); border-radius:7px; padding:11px 13px; }
    .spec-k { font-size:8px; color:var(--dim); text-transform:uppercase; letter-spacing:.1em; margin-bottom:4px; }
    .spec-v { font-family:var(--mono); font-size:13px; color:var(--text); }
    .spec-u { font-size:9px; color:var(--muted); margin-left:3px; }
    .result-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin:16px 0; }
    .result-card { background:var(--surface); border:1px solid var(--border); border-radius:7px; padding:12px 13px; }
    .result-label { font-size:8px; color:var(--dim); text-transform:uppercase; letter-spacing:.1em; margin-bottom:4px; }
    .result-val { font-family:var(--mono); font-size:18px; font-weight:300; color:#e8f3eb; }
    .result-unit { font-size:9px; color:var(--muted); margin-left:3px; }
    .result-desc { font-size:9px; color:var(--dim); margin-top:3px; }
    .two-col { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:16px 0; }
    .info-card { background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:14px 16px; }
    .info-card-title { font-size:11px; font-weight:500; color:#e2ebe5; margin-bottom:6px; }
    .info-card p { font-size:12px; color:var(--text2); line-height:1.7; }
    @media(max-width:700px){.docs-nav{display:none}.docs-main{padding:28px 20px}.result-grid{grid-template-columns:1fr 1fr}.two-col{grid-template-columns:1fr}}
  `;

  return (
    <>
      <style>{docsCss}</style>
      <div className="docs-wrap page-enter">
        <nav className="docs-nav">
          <div className="nav-logo">
            <div className="nav-logo-t">SBM Report</div>
            <div className="nav-logo-s">sbmproject · dnday</div>
          </div>
          {SECTIONS.map((s, i) => (
            <a
              key={s.id}
              className={`nav-item${active === s.id ? " active" : ""}`}
              onClick={() =>
                document
                  .getElementById(s.id)
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <span className="nav-num">{String(i + 1).padStart(2, "0")}</span>
              {s.title}
            </a>
          ))}
        </nav>
        <div className="docs-main">
          <div className="docs-hero">
            <div className="docs-hero-tag">
              Laporan Implementasi · Monitoring STM32 Realtime
            </div>
            <h1 className="docs-hero-title">
              SBM Monitor
              <br />
              STM32F401CCUx Dashboard
            </h1>
            <div className="prose">
              <p>
                Website ini digunakan untuk memonitor telemetri STM32F401CCUx
                secara realtime melalui backend FastAPI + pyOCD dan koneksi
                ST-Link. Data ditampilkan dalam panel status, gauge, trend, dan
                ringkasan sistem untuk kebutuhan analisis dan presentasi.
              </p>
            </div>
            <div className="docs-hero-meta">
              {[
                ["MCU", "STM32F401CCUx"],
                ["Frontend", "React + Vite"],
                ["Backend", "FastAPI + pyOCD"],
                ["Transport", "WebSocket"],
                ["Probe", "ST-Link"],
                ["Mode", "0..3"],
              ].map(([k, v]) => (
                <div key={k} className="badge">
                  {k} <span>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <SectionTitle id="pendahuluan" num="1">
            Pendahuluan
          </SectionTitle>
          <div className="prose">
            <p>
              Sistem SBM Monitor menghubungkan perangkat embedded STM32 dengan
              antarmuka web untuk observasi data realtime. Tujuan utamanya
              adalah memberikan visibilitas kondisi firmware, ADC, LED,
              interrupt, dan status koneksi hardware secara langsung dari
              browser.
            </p>
            <p>
              Website juga menyatukan konten laporan teknis agar proses demo,
              pengujian, dan dokumentasi berada pada satu aplikasi yang sama.
            </p>
          </div>
          <hr className="section-divider" />

          <SectionTitle id="landasan" num="2">
            Landasan Teori
          </SectionTitle>
          <div className="prose">
            <p>
              <strong>WebSocket Telemetry</strong> digunakan untuk menyalurkan
              data dari backend ke frontend tanpa polling, sehingga panel dapat
              diperbarui realtime dengan latensi rendah.
            </p>
            <p>
              <strong>ADC 12-bit</strong> pada STM32 menghasilkan rentang nilai
              0-4095. Nilai ini ditampilkan sebagai raw value, tegangan, tren,
              dan indikator aktivitas sinyal.
            </p>
            <p>
              <strong>State Monitoring</strong> menampilkan mode firmware,
              status LED, dan event EXTI sehingga perubahan perilaku firmware
              dapat dianalisis dari dashboard.
            </p>
          </div>
          <hr className="section-divider" />

          <SectionTitle id="hardware" num="3">
            Spesifikasi Hardware
          </SectionTitle>
          <div className="spec-grid">
            {[
              ["Mikrokontroler", "STM32F401CCUx"],
              ["Core", "ARM Cortex-M4"],
              ["Package", "UFQFPN48"],
              ["Flash", "256 KB"],
              ["RAM", "64 KB"],
              ["ADC Input", "PA0 / ADC1 CH0"],
              ["Supply Voltage", "3.3V"],
              ["Debug Interface", "SWD via ST-Link"],
              ["Host Backend", "PC/server with Python"],
              ["Opsional Legacy", "Node-RED stream"],
            ].map(([k, v]) => (
              <div key={k} className="spec-card">
                <div className="spec-k">{k}</div>
                <div className="spec-v">{v}</div>
              </div>
            ))}
          </div>
          <hr className="section-divider" />

          <SectionTitle id="perancangan" num="4">
            Perancangan Sistem
          </SectionTitle>
          <div className="prose">
            <p>
              Arsitektur sistem terdiri dari firmware STM32, backend bridge, dan
              frontend dashboard. Backend membaca variabel dari target, lalu
              mengirim payload telemetry ke browser menggunakan WebSocket.
            </p>
            <p>
              Frontend menormalisasi payload dari mode direct backend maupun
              payload konsolidasi Node-RED sehingga tampilan mode, ADC, dan LED
              tetap konsisten.
            </p>
          </div>
          <hr className="section-divider" />

          <SectionTitle id="peripheral" num="5">
            Konfigurasi Peripheral
          </SectionTitle>
          <Table
            headers={["Komponen", "Parameter", "Nilai", "Keterangan"]}
            rows={[
              [
                "Backend",
                "WebSocket",
                "ws://localhost:8765/ws",
                "Default direct stream",
              ],
              [
                "Backend",
                "Write API",
                "http://localhost:8765/write",
                "Kontrol/aksi backend",
              ],
              [
                "Frontend",
                "Fallback URL",
                "ws://localhost:1880/ws/stm32",
                "Opsional Node-RED",
              ],
              ["Frontend", "Reconnect", "2 detik", "Auto reconnect saat putus"],
              ["Firmware", "Mode", "0-3", "Shift/Sawtooth/Bar/RGB"],
              ["Telemetry", "ADC", "0-4095", "Raw 12-bit"],
              ["Telemetry", "LED", "8 channel", "Bitfield + array"],
              ["Telemetry", "EXTI", "0/1", "State interrupt"],
              ["UI", "Trend", "Signal/VAR1/LED", "Rolling history"],
              ["UI", "Gauge", "ADC/Volt/Signal", "Visual realtime"],
            ]}
          />
          <hr className="section-divider" />

          <SectionTitle id="firmware" num="6">
            Firmware & Kode
          </SectionTitle>
          <div className="prose">
            <p>
              Firmware mengelola mode operasi, pembacaan ADC, status LED, dan
              event EXTI. Backend membaca variabel-variabel ini lalu meneruskan
              ke frontend.
            </p>
          </div>
          <CodeBlock lang="text">{`Data utama yang dipakai dashboard:
- mode
- var1
- adc / adc_value / signal
- led_status atau leds[8]
- exti_flag
- uptime`}</CodeBlock>

          <InfoBox type="note">
            Sinkronisasi payload dilakukan di frontend agar sumber data direct
            backend dan Node-RED tetap menghasilkan state UI yang sama.
          </InfoBox>
          <hr className="section-divider" />

          <SectionTitle id="pengujian" num="7">
            Pengujian & Hasil
          </SectionTitle>
          <div className="prose">
            <p>
              Pengujian dilakukan untuk memastikan integrasi hardware-software:
              backend aktif, ST-Link terdeteksi, payload masuk, dan UI
              menampilkan data sesuai state terbaru.
            </p>
          </div>
          <div className="result-grid">
            {[
              ["WebSocket", "Open", "state", "Koneksi backend berhasil"],
              ["ST-Link", "Detected", "state", "Target siap dibaca"],
              ["ADC", "0..4095", "raw", "Update realtime"],
              ["LED", "0..8", "count", "Status panel sinkron"],
              ["Mode", "0..3", "state", "Label mode konsisten"],
              ["Recovery", "Auto", "reconnect", "Pulih saat koneksi kembali"],
            ].map(([k, v, u, d]) => (
              <div key={k} className="result-card">
                <div className="result-label">{k}</div>
                <div className="result-val">
                  {v}
                  <span className="result-unit">{u}</span>
                </div>
                <div className="result-desc">{d}</div>
              </div>
            ))}
          </div>
          <Table
            headers={["Parameter Uji", "Ekspektasi", "Hasil", "Status"]}
            rows={[
              ["Backend hidup", "UI online", "Tercapai", "✓ Pass"],
              ["ST-Link dilepas", "UI terkunci", "Tercapai", "✓ Pass"],
              ["Masuk docs saat offline", "Ditolak", "Tercapai", "✓ Pass"],
              ["Rekoneksi backend", "Pulih otomatis", "Tercapai", "✓ Pass"],
              ["Mode berubah", "UI ikut berubah", "Tercapai", "✓ Pass"],
              ["LED/ADC update", "Grafik bergerak", "Tercapai", "✓ Pass"],
            ]}
          />
          <hr className="section-divider" />

          <SectionTitle id="analisis" num="8">
            Analisis & Pembahasan
          </SectionTitle>
          <div className="prose">
            <p>
              Dashboard berhasil memberikan observabilitas yang cukup untuk
              analisis perilaku firmware realtime. Kombinasi panel numerik,
              gauge, dan trend membantu diagnosis lebih cepat dibanding output
              serial text saja.
            </p>
            <p>
              Penguncian akses saat backend/ST-Link offline mencegah user
              mengakses halaman docs dalam kondisi sistem belum siap, sehingga
              alur demo dan validasi menjadi lebih konsisten.
            </p>
            <p>
              Mekanisme fallback URL dan auto-reconnect meningkatkan ketahanan
              sistem ketika backend restart atau jalur websocket berganti.
            </p>
          </div>
          <div className="two-col">
            <div className="info-card">
              <div className="info-card-title">Kelebihan Implementasi</div>
              <p>
                Integrasi end-to-end embedded ke web, visualisasi data lengkap,
                serta UX monitoring yang tetap jelas saat perangkat offline.
              </p>
            </div>
            <div className="info-card">
              <div className="info-card-title">Area Pengembangan</div>
              <p>
                Tambah autentikasi akses dashboard, logging historis ke DB, dan
                alarm rule-based untuk kondisi threshold ADC/EXTI.
              </p>
            </div>
          </div>
          <hr className="section-divider" />

          <SectionTitle id="kesimpulan" num="9">
            Kesimpulan
          </SectionTitle>
          <div className="prose">
            <p>
              SBM Monitor berhasil mengintegrasikan backend hardware-aware dan
              frontend realtime untuk kebutuhan monitoring STM32F401CCUx.
            </p>
            <p>
              Sistem saat ini sudah siap untuk demonstrasi/presentasi karena
              menyediakan telemetry live, dokumentasi terintegrasi, dan guard
              akses ketika backend atau ST-Link tidak aktif.
            </p>
          </div>
          <InfoBox type="info">
            Panduan deploy: frontend dapat dipublish sebagai static site
            (misalnya Vercel), sedangkan backend harus berjalan pada mesin yang
            punya akses USB ST-Link.
          </InfoBox>
          <hr className="section-divider" />

          <SectionTitle id="referensi" num="10">
            Referensi
          </SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              ["README", "README project SBM Monitor (setup dan run)"],
              ["FastAPI", "Dokumentasi FastAPI untuk backend service"],
              ["pyOCD", "Dokumentasi pyOCD untuk debug probe STM32"],
              ["React", "Dokumentasi React untuk UI state management"],
              ["Vite", "Dokumentasi Vite untuk build/deploy frontend"],
              ["ST-Link", "Dokumentasi probe ST-Link dan SWD"],
              [
                "STM32",
                "Reference manual dan datasheet STM32F401 untuk detail peripheral",
              ],
            ].map(([id, text]) => (
              <div
                key={id}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "8px 0",
                  borderBottom: "1px solid #0f1510",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    color: "var(--green)",
                    minWidth: 60,
                    flexShrink: 0,
                  }}
                >
                  [{id}]
                </span>
                <span style={{ fontSize: 12, color: "var(--text2)" }}>
                  {text}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{ marginTop: 40, display: "flex", justifyContent: "center" }}
          >
            <button
              className="fab-goto-docs"
              onClick={onBack}
              style={{ gap: 10 }}
            >
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Kembali ke Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   APP ROOT
══════════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [accessGranted, setAccessGranted] = useState(false);
  const guardWsRef = useRef(null);
  const guardReconnectRef = useRef(null);
  const guardWsUrlIndexRef = useRef(0);

  useEffect(() => {
    let disposed = false;

    const connectGuard = () => {
      if (disposed) return;
      const targetUrl = WS_URLS[guardWsUrlIndexRef.current % WS_URLS.length];
      const ws = new WebSocket(targetUrl);
      guardWsRef.current = ws;

      ws.onmessage = (e) => {
        try {
          const d = JSON.parse(e.data);
          const nodeRedMsg = extractNodeRedMessage(d);
          if (nodeRedMsg) {
            setAccessGranted(true);
            return;
          }
          if (typeof d?.connected === "boolean") {
            setAccessGranted(d.connected);
          }
        } catch (_) {}
      };

      ws.onerror = () => {
        setAccessGranted(false);
      };

      ws.onclose = () => {
        setAccessGranted(false);
        guardWsUrlIndexRef.current =
          (guardWsUrlIndexRef.current + 1) % WS_URLS.length;
        guardReconnectRef.current = setTimeout(connectGuard, 2000);
      };
    };

    connectGuard();
    return () => {
      disposed = true;
      clearTimeout(guardReconnectRef.current);
      guardWsRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (page === "docs" && !accessGranted) {
      setPage("dashboard");
    }
  }, [accessGranted, page]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const openDocs = () => {
    if (!accessGranted) return;
    setPage("docs");
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {page === "dashboard" ? (
        <Dashboard onGoToDocs={openDocs} canAccessDocs={accessGranted} />
      ) : (
        <DocsPage onBack={() => setPage("dashboard")} />
      )}
    </>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);

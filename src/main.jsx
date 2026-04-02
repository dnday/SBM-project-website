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
const WS_FALLBACKS = ["ws://localhost:1880/ws/stm32", "ws://localhost:8765/ws"];
const WS_URLS = [WS_ENV_URL, ...WS_FALLBACKS].filter(
  (v, i, arr) => typeof v === "string" && v.length > 0 && arr.indexOf(v) === i,
);
const API_URL = "http://localhost:8765";
const HIST_LEN = 60;

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */
function adcToVolt(v) {
  return ((v / 4095) * 3.3).toFixed(3);
}
function calcFreq(psc, per) {
  return (16_000_000 / ((psc + 1) * (per + 1))).toFixed(2);
}
function calcDuty(pulse, period) {
  return ((pulse / (period + 1)) * 100).toFixed(1);
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
function PWMWave({ duty, freq }) {
  const cycles = 3,
    W = 400,
    H = 78,
    pad = 10;
  const cw = (W - pad * 2) / cycles;
  const onW = (duty / 100) * cw;
  const hi = 18,
    lo = 60;
  let d = `M ${pad} ${lo}`;
  for (let i = 0; i < cycles; i++) {
    const x0 = pad + i * cw;
    d += ` L ${x0} ${hi} L ${x0 + onW} ${hi} L ${x0 + onW} ${lo} L ${x0 + cw} ${lo}`;
  }
  const fills = Array.from({ length: cycles }, (_, i) => {
    const x0 = pad + i * cw;
    return (
      <rect
        key={i}
        x={x0}
        y={hi}
        width={onW}
        height={lo - hi}
        fill="url(#wg)"
      />
    );
  });
  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity=".25" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity=".02" />
        </linearGradient>
      </defs>
      <line
        x1={pad}
        y1={hi}
        x2={W - pad}
        y2={hi}
        stroke="#0f1a12"
        strokeWidth="1"
        strokeDasharray="3 4"
      />
      <line
        x1={pad}
        y1={lo}
        x2={W - pad}
        y2={lo}
        stroke="#0f1a12"
        strokeWidth="1"
        strokeDasharray="3 4"
      />
      {fills}
      <path
        d={d}
        fill="none"
        stroke="#22c55e"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <text
        x={pad + 3}
        y={hi - 3}
        fontSize="9"
        fill="#3a5443"
        fontFamily="JetBrains Mono,monospace"
      >
        HIGH
      </text>
      <text
        x={pad + 3}
        y={lo + 10}
        fontSize="9"
        fill="#3a5443"
        fontFamily="JetBrains Mono,monospace"
      >
        LOW
      </text>
      <text
        x={W - pad - 2}
        y={H - 1}
        fontSize="9"
        fill="#2d4035"
        fontFamily="JetBrains Mono,monospace"
        textAnchor="end"
      >
        {freq} Hz
      </text>
    </svg>
  );
}

function RingGauge({ value, max = 100, color = "#22c55e", size = 120 }) {
  const circ = 2 * Math.PI * 44;
  const offset = circ * (1 - Math.min(value, max) / max);
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
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 60 60)"
        style={{
          transition: "stroke-dashoffset .4s cubic-bezier(.4,0,.2,1)",
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

  const polyline = safeData
    .map((p, idx) => point(idx, Number(p.v) || 0))
    .join(" ");

  const startT = safeData[0]?.t ?? 0;
  const midT = safeData[Math.floor((safeData.length - 1) / 2)]?.t ?? 0;
  const endT = safeData[safeData.length - 1]?.t ?? 0;
  const fmtT = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n.toFixed(1) : "0.0";
  };

  return (
    <div className="trend-card">
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
        <polyline
          points={polyline}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
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

function Dashboard({ onGoToDocs }) {
  /* ── State (semua diisi dari WebSocket) ── */
  const [connected, setConnected] = useState(false);
  const [wsState, setWsState] = useState("connecting"); // connecting | open | closed | error
  const [mode, setMode] = useState(0);
  const [var1, setVar1] = useState(0);
  const [leds, setLeds] = useState(Array(8).fill(0));
  const [adc, setAdc] = useState(0);
  const [signal, setSignal] = useState(0);
  const [psc, setPsc] = useState(15999);
  const [period, setPeriod] = useState(499);
  const [pulse, setPulse] = useState(250);
  const [uptime, setUptime] = useState(0);
  const [error, setError] = useState(null);
  const [hist, setHist] = useState(DEFAULT_HIST);
  const [varHist, setVarHist] = useState(DEFAULT_HIST);
  const [ledHist, setLedHist] = useState(DEFAULT_HIST);
  const [adcStats, setAdcStats] = useState({ min: 0, max: 0, sum: 0 });
  const [writing, setWriting] = useState(false); // feedback saat slider menulis ke STM32

  const tick = useRef(HIST_LEN);
  const wsRef = useRef(null);
  const reconnect = useRef(null);
  const wsUrlIndexRef = useRef(0);
  const nodeRedState = useRef({
    mode: 0,
    var1: 0,
    adc_value: 0,
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
          const sampleT = Number.isFinite(Number(nodeRedMsg.time_s))
            ? Number(nodeRedMsg.time_s)
            : tick.current++;

          if (nodeRedMsg.kind === "single") {
            const { variablename, value } = nodeRedMsg;
            const varName = String(variablename).toLowerCase();
            if (varName === "mode") {
              nodeRedState.current.mode = Math.max(
                0,
                Math.min(2, Math.round(value)),
              );
            } else if (varName === "var1") {
              nodeRedState.current.var1 = value;
              varUpdated = true;
            } else if (varName === "adc_value" || varName === "adc") {
              nodeRedState.current.adc_value = Math.max(
                0,
                Math.min(4095, Math.round(value)),
              );
            } else {
              if (varName === "led_status") {
                const bits = Number.isFinite(value) ? Math.trunc(value) : 0;
                nodeRedState.current.leds = Array.from(
                  { length: 8 },
                  (_, idx) => ((bits >> idx) & 1 ? 1 : 0),
                );
                ledUpdated = true;
              }
              const m = varName.match(/led[_\s-]*status\[(\d+)\]/);
              if (m) {
                const idx = Number(m[1]);
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
                Math.min(2, Math.round(Number(s.mode))),
              );
            }
            if (Number.isFinite(Number(s.var1))) {
              nodeRedState.current.var1 = Number(s.var1);
              varUpdated = true;
            }
            if (Number.isFinite(Number(s.adc_value))) {
              nodeRedState.current.adc_value = Math.max(
                0,
                Math.min(4095, Math.round(Number(s.adc_value))),
              );
            }
            if (Number.isFinite(Number(s.adc))) {
              nodeRedState.current.adc_value = Math.max(
                0,
                Math.min(4095, Math.round(Number(s.adc))),
              );
            }
            if (Array.isArray(s.leds)) {
              nodeRedState.current.leds = s.leds
                .slice(0, 8)
                .map((x) => (x ? 1 : 0));
              while (nodeRedState.current.leds.length < 8)
                nodeRedState.current.leds.push(0);
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
          const nrSignal =
            nrAdc > 0
              ? nrAdc
              : Math.max(0, Math.min(4095, Math.round(nr.var1)));

          setMode(nr.mode);
          setVar1(nr.var1);
          setLeds([...nr.leds]);
          setAdc(nrAdc);
          setSignal(nrSignal);
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
          setPsc((prev) => {
            const next = Number(d.psc);
            return Number.isFinite(next) && next > 0 ? next : prev;
          });
          setPeriod((prev) => {
            const next = Number(d.period);
            return Number.isFinite(next) && next > 0 ? next : prev;
          });
          setPulse((prev) => {
            const next = Number(d.pulse);
            return Number.isFinite(next) && next >= 0 ? next : prev;
          });
          setUptime(d.uptime ?? 0);
          if (Number.isFinite(Number(d.mode))) {
            setMode(Math.max(0, Math.min(2, Math.round(Number(d.mode)))));
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

  /* ── Tulis register ke STM32 via REST ── */
  const writeReg = async (register, value) => {
    if (!connected) return;
    setWriting(true);
    try {
      await fetch(`${API_URL}/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ register, value: +value }),
      });
    } catch (_) {
    } finally {
      setWriting(false);
    }
  };

  /* ── Computed ── */
  const freq = calcFreq(psc, period);
  const duty = parseFloat(calcDuty(pulse, period));
  const dutyColor = duty > 75 ? "#f59e0b" : duty < 25 ? "#3b82f6" : "#22c55e";
  const volt = adcToVolt(adc);
  const signalPct = Math.round((signal / 4095) * 100);
  const adcColor = adc > 3000 ? "#f59e0b" : adc < 900 ? "#3b82f6" : "#22c55e";
  const ledOnCount = leds.reduce((acc, v) => acc + (v ? 1 : 0), 0);
  const scanIdx =
    ledOnCount === 0 ? ((Math.abs(Math.round(var1)) % 8) + 8) % 8 : -1;

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
    .g3 { display:grid; grid-template-columns:1fr 1.6fr 1fr; gap:14px; margin-bottom:14px; }
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
    .pwm-stats { display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; margin-top:11px; }
    .ps { background:var(--surface2); border:1px solid var(--border); border-radius:5px; padding:7px 9px; }
    .ps-k { font-size:8px; color:var(--dim); text-transform:uppercase; letter-spacing:.1em; margin-bottom:2px; }
    .ps-v { font-family:var(--mono); font-size:13px; color:#e2ebe5; }
    .ps-u { font-size:9px; color:var(--muted); margin-left:2px; }
    .duty-wrap { display:flex; flex-direction:column; align-items:center; }
    .duty-big { font-family:var(--mono); font-size:32px; font-weight:300; line-height:1; margin-top:6px; }
    .duty-big span { font-size:13px; }
    .duty-sub { font-size:10px; color:var(--muted); margin-top:3px; margin-bottom:12px; }
    .ctrl { display:flex; flex-direction:column; gap:11px; }
    .ctrl-hd { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:5px; }
    .cn { font-size:9px; color:var(--dim); text-transform:uppercase; letter-spacing:.1em; }
    .cv { font-family:var(--mono); font-size:11px; color:var(--green); }
    .cv.writing { color:var(--amber); }
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
    .trend-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:14px; }
    .trend-card { background:var(--surface2); border:1px solid var(--border); border-radius:8px; padding:10px; }
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
    @media(max-width:860px){.g3{grid-template-columns:1fr 1fr}.g3b{grid-template-columns:1fr 1fr}.gauge-grid{grid-template-columns:1fr 1fr}.trend-grid{grid-template-columns:1fr}}
    @media(max-width:580px){.g3,.g3b,.gauge-grid{grid-template-columns:1fr}}
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

        {/* Row 1 */}
        <div className="g3">
          {/* ADC */}
          <div className="card">
            <div className="label" style={{ marginBottom: 10 }}>
              <div className="label-dot" />
              ADC1 — Channel 0 · PA0
            </div>
            <div className="adc-num">
              {adc.toString().padStart(4, "0")}
              <span>/ 4095</span>
            </div>
            <div className="adc-sub">
              12-bit · Continuous · 3-cycle sampling
            </div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${(adc / 4095) * 100}%` }}
              />
            </div>
            <div className="adc-range">
              <span>0</span>
              <span>2048</span>
              <span>4095</span>
            </div>
            <div className="volt">
              {volt}
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

          {/* PWM */}
          <div className="card">
            <div className="label" style={{ marginBottom: 10 }}>
              <div className="label-dot" />
              TIM1 — PWM · PA8
            </div>
            <PWMWave duty={duty} freq={freq} />
            <div className="pwm-stats">
              {[
                ["Frequency", freq, "Hz"],
                ["Prescaler", psc, ""],
                ["Period", period, ""],
                ["Pulse", pulse, ""],
                ["Timer CLK", "1", "kHz"],
                ["Channel", "CH1", ""],
              ].map(([k, v, u]) => (
                <div key={k} className="ps">
                  <div className="ps-k">{k}</div>
                  <div className="ps-v">
                    {v}
                    <span className="ps-u">{u}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Duty */}
          <div className="card">
            <div className="label" style={{ marginBottom: 10 }}>
              <div className="label-dot" />
              Duty Cycle
            </div>
            <div className="duty-wrap">
              <RingGauge value={duty} color={dutyColor} size={118} />
              <div className="duty-big" style={{ color: dutyColor }}>
                {duty}
                <span>%</span>
              </div>
              <div className="duty-sub">PWM on-time ratio</div>
            </div>
            {/* Slider: tulis langsung ke STM32 via REST */}
            <div className="ctrl">
              {[
                {
                  label: "Pulse width",
                  val: `${pulse} / ${period + 1}`,
                  min: 0,
                  max: period,
                  cur: pulse,
                  set: (v) => {
                    setPulse(+v);
                    writeReg("pulse", +v);
                  },
                },
                {
                  label: "Period (ARR)",
                  val: period,
                  min: 99,
                  max: 9999,
                  cur: period,
                  set: (v) => {
                    setPeriod(+v);
                    setPulse((p) => Math.min(p, +v));
                    writeReg("period", +v);
                  },
                },
              ].map((c) => (
                <div key={c.label}>
                  <div className="ctrl-hd">
                    <span className="cn">{c.label}</span>
                    <span className={`cv${writing ? " writing" : ""}`}>
                      {c.val}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={c.min}
                    max={c.max}
                    value={c.cur}
                    disabled={!connected}
                    onChange={(e) => c.set(e.target.value)}
                  />
                </div>
              ))}
              {writing && (
                <div
                  style={{
                    fontSize: 9,
                    color: "var(--amber)",
                    fontFamily: "var(--mono)",
                    letterSpacing: ".08em",
                  }}
                >
                  ↑ Menulis ke STM32…
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gauges */}
        <div className="g1">
          <div className="card">
            <div className="label" style={{ marginBottom: 10 }}>
              <div className="label-dot" />
              Realtime Gauge Panel
            </div>
            <div className="gauge-grid">
              <div className="gauge-card">
                <div className="gauge-title">ADC Raw</div>
                <RingGauge value={adc} max={4095} color={adcColor} size={122} />
                <div className="gauge-val" style={{ color: adcColor }}>
                  {adc}
                </div>
                <div className="gauge-sub">0 - 4095</div>
              </div>
              <div className="gauge-card">
                <div className="gauge-title">Voltage</div>
                <RingGauge
                  value={Number(volt)}
                  max={3.3}
                  color="#f59e0b"
                  size={122}
                />
                <div className="gauge-val" style={{ color: "#f59e0b" }}>
                  {volt} V
                </div>
                <div className="gauge-sub">ADC / 4095 x 3.3</div>
              </div>
              <div className="gauge-card">
                <div className="gauge-title">Signal Activity</div>
                <RingGauge
                  value={signal}
                  max={4095}
                  color="#22c55e"
                  size={122}
                />
                <div className="gauge-val" style={{ color: "#22c55e" }}>
                  {signalPct}%
                </div>
                <div className="gauge-sub">Fallback-aware realtime</div>
              </div>
            </div>

            <div className="label" style={{ marginTop: 14, marginBottom: 8 }}>
              <div className="label-dot" />
              LED Sequence Activity
            </div>
            <div className="led-seq">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="led-pill">
                  <div
                    className={`led-bulb ${leds[i] ? "on" : ""} ${!leds[i] && i === scanIdx ? "scan" : ""}`}
                  />
                  <div className="led-idx">LED{i}</div>
                </div>
              ))}
            </div>

            <div className="trend-grid">
              <TimeSeriesChart
                data={varHist}
                title="VAR1 / Count Trend"
                color="#38bdf8"
                yMin={0}
                yMax={100}
              />
              <TimeSeriesChart
                data={ledHist}
                title="LED ON Count Trend"
                color="#22c55e"
                yMin={0}
                yMax={8}
              />
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
          <button className="fab-goto-docs" onClick={onGoToDocs}>
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
            <span>Buka Dokumentasi Laporan SBM</span>
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
              Laporan Proyek · Sistem Berbasis Mikrokontroler
            </div>
            <h1 className="docs-hero-title">
              ADC-to-PWM Controller
              <br />
              STM32F401CCUx
            </h1>
            <div className="prose">
              <p>
                Implementasi sistem pembacaan ADC continuous dan output PWM
                menggunakan STM32F401CCUx dengan HAL Library. Konfigurasi
                dilakukan melalui STM32CubeMX dan dikembangkan menggunakan
                STM32CubeIDE.
              </p>
            </div>
            <div className="docs-hero-meta">
              {[
                ["MCU", "STM32F401CCUx"],
                ["Clock", "16 MHz HSI"],
                ["ADC", "12-bit Channel 0"],
                ["PWM", "TIM1 CH1 · PA8"],
                ["IDE", "STM32CubeIDE"],
                ["Library", "HAL FW_F4 V1.28.3"],
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
              Proyek ini dikembangkan sebagai implementasi sistem kontrol
              berbasis mikrokontroler STM32F401CCUx yang membaca sinyal analog
              melalui ADC dan menghasilkan sinyal PWM yang dapat dikonfigurasi.
              Sistem ini mendemonstrasikan penggunaan peripheral ADC1 dan TIM1
              secara bersamaan dalam satu aplikasi embedded.
            </p>
            <p>
              Tujuan utama proyek adalah memahami alur kerja pengembangan
              firmware embedded menggunakan STM32CubeMX untuk konfigurasi
              peripheral dan STM32CubeIDE sebagai lingkungan pengembangan
              terintegrasi.
            </p>
          </div>
          <hr className="section-divider" />

          <SectionTitle id="landasan" num="2">
            Landasan Teori
          </SectionTitle>
          <div className="prose">
            <p>
              <strong>ADC (Analog-to-Digital Converter)</strong> mengubah sinyal
              analog menjadi nilai digital. STM32F401 memiliki ADC 12-bit dengan
              resolusi 4096 level (0–4095). Pada mode continuous, konversi
              dilakukan terus menerus tanpa intervensi software.
            </p>
            <p>
              <strong>PWM (Pulse Width Modulation)</strong> adalah teknik
              modulasi lebar pulsa yang digunakan untuk mengatur daya rata-rata
              yang dikirim ke beban. Duty cycle (rasio waktu HIGH terhadap
              periode) menentukan nilai rata-rata sinyal.
            </p>
            <p>
              <strong>Timer (TIM1)</strong> adalah peripheral advanced-control
              timer pada STM32F401 yang mendukung 4 kanal PWM dengan fitur
              dead-time insertion dan complementary output.
            </p>
          </div>
          <hr className="section-divider" />

          <SectionTitle id="hardware" num="3">
            Spesifikasi Hardware
          </SectionTitle>
          <div className="spec-grid">
            {[
              ["Mikrokontroler", "STM32F401CCUx"],
              ["Core", "ARM Cortex-M4 @ 16 MHz"],
              ["Flash Memory", "256 KB"],
              ["RAM", "64 KB SRAM"],
              ["Package", "UFQFPN48"],
              ["ADC Resolution", "12-bit (0–4095)"],
              ["ADC Input", "PA0 (Channel 0)"],
              ["PWM Output", "PA8 (TIM1 CH1)"],
              ["Supply Voltage", "3.3V"],
              ["Debug Interface", "SWD (ST-Link)"],
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
              Sistem dirancang dengan arsitektur sederhana: sinyal analog pada
              PA0 dibaca oleh ADC1 secara continuous, kemudian nilai ADC
              dikonversi secara proporsional menjadi duty cycle untuk sinyal PWM
              pada PA8.
            </p>
            <p>
              Nilai ADC 0 menghasilkan duty cycle 0% (output LOW konstan),
              sedangkan ADC 4095 menghasilkan duty cycle mendekati 100% (output
              HIGH konstan). Pemetaan ini dilakukan melalui perhitungan linear.
            </p>
          </div>
          <hr className="section-divider" />

          <SectionTitle id="peripheral" num="5">
            Konfigurasi Peripheral
          </SectionTitle>
          <Table
            headers={["Peripheral", "Parameter", "Nilai", "Keterangan"]}
            rows={[
              ["ADC1", "Resolution", "12-bit", "4096 level konversi"],
              ["ADC1", "Mode", "Continuous", "Konversi terus-menerus"],
              ["ADC1", "Channel", "0 (PA0)", "Input analog"],
              ["ADC1", "Sampling Time", "3 cycles", "Waktu sampling minimum"],
              ["TIM1", "Prescaler (PSC)", "15999", "Clock divider"],
              ["TIM1", "Period (ARR)", "499", "Auto-reload value"],
              ["TIM1", "Pulse (CCR1)", "250", "Default 50% duty"],
              ["TIM1", "Frequency", "2 Hz", "16M/(16000×500)"],
              ["NVIC", "Priority Group", "4", "Pre-emption only"],
              ["NVIC", "TIM1 Priority", "0", "Highest priority"],
            ]}
          />
          <hr className="section-divider" />

          <SectionTitle id="firmware" num="6">
            Firmware & Kode
          </SectionTitle>
          <div className="prose">
            <p>
              Firmware dikembangkan menggunakan HAL Library STM32F4 versi
              1.28.3. Loop utama membaca nilai ADC secara continuous dan
              memetakannya ke duty cycle PWM.
            </p>
          </div>

          <CodeBlock lang="c">{`/* main.c — Loop utama ADC-to-PWM */
int main(void)
{
  HAL_Init();
  SystemClock_Config();
  MX_GPIO_Init();
  MX_ADC1_Init();
  MX_TIM1_Init();

  HAL_ADC_Start(&hadc1);
  HAL_TIM_PWM_Start(&htim1, TIM_CHANNEL_1);

  while (1)
  {
    /* Baca nilai ADC */
    uint32_t adc_val = HAL_ADC_GetValue(&hadc1);

    /* Konversi ke duty cycle (opsional — pengembangan) */
    uint32_t duty = (adc_val * (htim1.Init.Period + 1)) / 4095;
    __HAL_TIM_SET_COMPARE(&htim1, TIM_CHANNEL_1, duty);

    HAL_Delay(10);  /* Sampling interval */
  }
}`}</CodeBlock>

          <CodeBlock lang="c">{`/* Konfigurasi ADC1 — MX_ADC1_Init() */
void MX_ADC1_Init(void)
{
  hadc1.Instance                   = ADC1;
  hadc1.Init.ClockPrescaler        = ADC_CLOCK_SYNC_PCLK_DIV2;
  hadc1.Init.Resolution            = ADC_RESOLUTION_12B;
  hadc1.Init.ContinuousConvMode    = ENABLE;   /* Continuous */
  hadc1.Init.NbrOfConversion       = 1;
  HAL_ADC_Init(&hadc1);

  /* Channel 0 → PA0 */
  sConfig.Channel      = ADC_CHANNEL_0;
  sConfig.Rank         = 1;
  sConfig.SamplingTime = ADC_SAMPLETIME_3CYCLES;
  HAL_ADC_ConfigChannel(&hadc1, &sConfig);
}`}</CodeBlock>

          <CodeBlock lang="c">{`/* Konfigurasi TIM1 PWM — MX_TIM1_Init() */
void MX_TIM1_Init(void)
{
  htim1.Instance           = TIM1;
  htim1.Init.Prescaler     = 15999;  /* 16MHz / 16000 = 1kHz  */
  htim1.Init.Period        = 499;    /* 1kHz  / 500   = 2Hz   */
  htim1.Init.ClockDivision = TIM_CLOCKDIVISION_DIV1;
  HAL_TIM_PWM_Init(&htim1);

  sConfigOC.OCMode     = TIM_OCMODE_PWM1;
  sConfigOC.Pulse      = 250;        /* Duty = 250/500 = 50%  */
  sConfigOC.OCPolarity = TIM_OCPOLARITY_HIGH;
  HAL_TIM_PWM_ConfigChannel(&htim1, &sConfigOC, TIM_CHANNEL_1);
}`}</CodeBlock>

          <InfoBox type="warn">
            Frekuensi PWM 2 Hz pada konfigurasi saat ini terlalu lambat untuk
            aplikasi motor atau servo (umumnya 50–20.000 Hz). Nilai Period dan
            Prescaler perlu disesuaikan sesuai beban yang digunakan.
          </InfoBox>
          <hr className="section-divider" />

          <SectionTitle id="pengujian" num="7">
            Pengujian & Hasil
          </SectionTitle>
          <div className="prose">
            <p>
              Pengujian dilakukan secara fungsional untuk memverifikasi output
              ADC dan sinyal PWM sesuai spesifikasi desain.
            </p>
          </div>
          <div className="result-grid">
            {[
              ["ADC Resolution", "12", "bit", "Resolusi penuh 4096 level"],
              ["ADC Range", "0 – 4095", "counts", "Sesuai 0 – 3.3V input"],
              ["PWM Frequency", "2.00", "Hz", "Terukur sesuai kalkulasi"],
              ["Duty Cycle", "50.0", "%", "Default pulse = 250/500"],
              ["Timer Clock", "1.000", "kHz", "16MHz / (PSC+1)"],
              ["SYSCLK", "16.000", "MHz", "HSI internal oscillator"],
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
              ["ADC membaca 0V", "≈ 0", "0 – 50", "✓ Pass"],
              ["ADC membaca 3.3V", "≈ 4095", "4050 – 4095", "✓ Pass"],
              ["Frekuensi PWM", "2.00 Hz", "2.00 Hz", "✓ Pass"],
              ["Duty cycle default", "50%", "50.0%", "✓ Pass"],
              ["TIM1 interrupt", "Aktif", "Terpanggil", "✓ Pass"],
              ["HAL_Tick (SysTick)", "1 ms", "~1 ms", "✓ Pass"],
            ]}
          />
          <hr className="section-divider" />

          <SectionTitle id="analisis" num="8">
            Analisis & Pembahasan
          </SectionTitle>
          <div className="prose">
            <p>
              Sistem berhasil membaca nilai ADC secara continuous dan
              menghasilkan sinyal PWM dengan duty cycle yang dapat
              dikonfigurasi. Beberapa catatan penting dari hasil analisis:
            </p>
            <p>
              <strong>Akurasi ADC:</strong> Dengan resolusi 12-bit dan VREF =
              3.3V, setiap LSB mewakili tegangan{" "}
              <code>3.3 / 4096 ≈ 0.806 mV</code>. Noise pada pengukuran dapat
              diminimalisir dengan rata-rata beberapa sampel (oversampling).
            </p>
            <p>
              <strong>Frekuensi PWM:</strong> Nilai 2 Hz dipilih untuk kemudahan
              verifikasi visual (LED akan berkedip terlihat mata). Untuk
              aplikasi real seperti servo, gunakan Period = 19999 dengan PSC =
              15 untuk menghasilkan 50 Hz.
            </p>
            <p>
              <strong>Penggunaan HAL:</strong> HAL Library menyederhanakan
              inisialisasi hardware namun menambah overhead dibandingkan akses
              register langsung (LL Library). Untuk aplikasi time-critical,
              pertimbangkan LL atau akses register langsung.
            </p>
          </div>
          <div className="two-col">
            <div className="info-card">
              <div className="info-card-title">Kelebihan Implementasi</div>
              <p>
                Kode bersih dan mudah dibaca. Penggunaan HAL mempercepat
                development. Konfigurasi CubeMX meminimalisir kesalahan
                inisialisasi peripheral.
              </p>
            </div>
            <div className="info-card">
              <div className="info-card-title">Area Pengembangan</div>
              <p>
                Penambahan UART untuk debug output. Mapping ADC ke duty cycle
                secara proporsional. DMA untuk ADC agar tidak blocking.
                Kalibrasi ADC internal.
              </p>
            </div>
          </div>
          <hr className="section-divider" />

          <SectionTitle id="kesimpulan" num="9">
            Kesimpulan
          </SectionTitle>
          <div className="prose">
            <p>
              Proyek <strong>sbmproject</strong> berhasil mendemonstrasikan
              implementasi sistem ADC-to-PWM berbasis STM32F401CCUx. Seluruh
              peripheral yang dikonfigurasi — ADC1, TIM1, NVIC, dan RCC —
              berfungsi sesuai dengan spesifikasi yang ditetapkan dalam file
              konfigurasi CubeMX.
            </p>
            <p>
              Sistem ini menjadi fondasi yang solid untuk pengembangan lebih
              lanjut seperti kontrol motor servo, sistem otomasi berbasis
              sensor, atau aplikasi IoT embedded. Dengan menambahkan pemetaan
              ADC ke duty cycle secara dinamis, sistem dapat berfungsi sebagai
              kontroler analog-digital yang responsif.
            </p>
          </div>
          <InfoBox type="info">
            Proyek ini tersedia secara publik di{" "}
            <strong>github.com/dnday/sbmproject</strong> dan dapat dikembangkan
            lebih lanjut dengan menambahkan peripheral komunikasi (UART, I2C,
            SPI) atau konektivitas wireless.
          </InfoBox>
          <hr className="section-divider" />

          <SectionTitle id="referensi" num="10">
            Referensi
          </SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              [
                "RM0368",
                "STM32F401xB/C/D/E Reference Manual — STMicroelectronics, 2023",
              ],
              ["DS9716", "STM32F401xC/xE Datasheet — STMicroelectronics, 2023"],
              ["UM1724", "STM32 Nucleo-64 boards user manual"],
              [
                "AN4776",
                "General-purpose timer cookbook for STM32 microcontrollers",
              ],
              [
                "HAL",
                "Description of STM32F4 HAL and low-layer drivers — UM1725",
              ],
              [
                "CubeMX",
                "STM32CubeMX for STM32 configuration and initialization — UM1718",
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
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {page === "dashboard" ? (
        <Dashboard onGoToDocs={() => setPage("docs")} />
      ) : (
        <DocsPage onBack={() => setPage("dashboard")} />
      )}
    </>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);

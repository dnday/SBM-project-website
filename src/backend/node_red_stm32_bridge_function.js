// Node-RED Function Node: STM32CubeMonitor -> consolidated websocket payload
// Input frame expected from STM32CubeMonitor:
// msg.payload.variablename
// msg.payload.variabledata[] (latest sample at tail.y)

const p = msg.payload || {};
const name = p.variablename;
const data = p.variabledata;

if (typeof name !== "string") {
  return null;
}
if (!Array.isArray(data) || data.length === 0) {
  return null;
}

const latest = data[data.length - 1];
const y = Number(latest?.y);
if (!Number.isFinite(y)) {
  return null;
}

const state = context.get("stm32State") || {
  mode: 0,
  var1: 0,
  adc_value: 0,
  leds: Array(8).fill(0),
  ts: Date.now(),
};

if (name === "mode") {
  state.mode = Math.max(0, Math.min(2, Math.round(y)));
} else if (name === "var1") {
  state.var1 = y;
} else if (name === "adc_value") {
  state.adc_value = Math.max(0, Math.min(4095, Math.round(y)));
} else if (name === "adc") {
  state.adc_value = Math.max(0, Math.min(4095, Math.round(y)));
} else {
  if (name === "led_status") {
    // Support packed LED bitfield in one variable.
    const bits = Math.trunc(y);
    state.leds = Array.from({ length: 8 }, (_, idx) =>
      (bits >> idx) & 1 ? 1 : 0,
    );
  } else {
    // Support per-index variables: led_status[0], led_status1, etc.
    const m = name.match(/^led_status(?:\[(\d+)\]|(\d+))$/);
    if (m) {
      const idx = Number(m[1] ?? m[2]);
      if (idx >= 0 && idx < 8) {
        state.leds[idx] = y ? 1 : 0;
      }
    } else {
      return null;
    }
  }
}

state.ts = Date.now();
context.set("stm32State", state);

msg.payload = {
  mode: state.mode,
  var1: state.var1,
  adc_value: state.adc_value,
  leds: state.leds.slice(),
  signal: state.adc_value > 0 ? state.adc_value : Math.round(state.var1),
  ts: state.ts,
};

return msg;

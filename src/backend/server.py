"""
SBM Monitor — Backend Server
=============================
Menghubungkan ST-Link/SWD ke browser via WebSocket.
Membaca register ADC1 & TIM1 dari STM32F401CCUx secara real-time.

Arsitektur:
  [STM32 via SWD] ──pyocd──► [ProbeThread] ──state──► [WebSocket /ws] ──► [Browser]
                                                         [REST   /write] ◄── [Browser slider]

Jalankan:
  pip install -r requirements.txt
  python server.py

Koneksi frontend (ws://localhost:8765/ws)
"""

import asyncio
import json
import logging
import threading
import time
from typing import List, Optional

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ── Logging ─────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-7s  %(name)s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("sbm")

# ── STM32F401 Register Addresses ─────────────────────────────────────────────
# ADC1 (base 0x40012000)
ADC1_SR   = 0x40012000  # Status register
ADC1_DR   = 0x4001204C  # Data register [11:0] = conversion result

# TIM1 (base 0x40010000)
TIM1_CR1  = 0x40010000  # Control register 1
TIM1_PSC  = 0x40010028  # Prescaler
TIM1_ARR  = 0x4001002C  # Auto-reload register (period)
TIM1_RCR  = 0x40010030  # Repetition counter
TIM1_CCR1 = 0x40010034  # Capture/Compare 1 (pulse)

# RCC (for clock verification)
RCC_CFGR  = 0x40023808  # Clock config register

# ── Shared State ─────────────────────────────────────────────────────────────
_state: dict = {
    "connected": False,
    "adc":       0,
    "psc":       15999,
    "period":    499,
    "pulse":     250,
    "uptime":    0,
    "error":     None,
    "probe_name": None,
}
_lock         = threading.Lock()
_connected_at: Optional[float] = None
_session      = None          # pyocd session (shared across threads)

# ── Utility ──────────────────────────────────────────────────────────────────
def _snap() -> dict:
    """Thread-safe state snapshot with computed uptime."""
    with _lock:
        s = dict(_state)
    s["uptime"] = int(time.time() - _connected_at) if (_connected_at and s["connected"]) else 0
    return s


def _update(**kwargs):
    with _lock:
        _state.update(kwargs)


def _close_session(sess):
    try:
        sess.close()
    except Exception:
        pass


# ── Probe Monitor (background thread) ────────────────────────────────────────
def _probe_loop():
    """
    Continuously:
      1. Detect if an ST-Link probe is connected to USB.
      2. Open a pyocd session in 'attach' mode (non-intrusive — MCU keeps running).
      3. Poll ADC1_DR and TIM1 registers every 250 ms.
      4. On disconnect/error, tear down and wait until re-plugged.
    """
    global _session, _connected_at

    while True:
        # ── Phase 1: Detect probe ──────────────────────────────────────────
        try:
            from pyocd.probe.aggregator import DebugProbeAggregator  # lazy import
            try:
                probes = DebugProbeAggregator.get_all_connected_probes(blocking=False)
            except TypeError:
                probes = DebugProbeAggregator.get_all_connected_probes()
        except ImportError:
            log.error("pyocd tidak terinstall! Jalankan: pip install pyocd")
            _update(connected=False, error="pyocd not installed — run: pip install pyocd")
            time.sleep(5)
            continue
        except Exception as exc:
            _update(connected=False, error=f"USB scan error: {exc}")
            time.sleep(2)
            continue

        if not probes:
            was_connected = _state["connected"]
            _update(connected=False, error="Menunggu ST-Link… Tancapkan kabel USB ST-Link.")
            if was_connected:
                log.info("ST-Link dicabut.")
            if _session:
                _close_session(_session)
                _session = None
                _connected_at = None
            time.sleep(0.8)
            continue

        # ── Phase 2: Open session ──────────────────────────────────────────
        if _session is None:
            probe_id = probes[0].unique_id
            probe_desc = getattr(probes[0], 'description', probe_id)
            log.info(f"ST-Link terdeteksi: {probe_desc} — menyambung ke STM32F401CCUx…")
            try:
                from pyocd.core.helpers import ConnectHelper
                _session = ConnectHelper.session_with_chosen_probe(
                    target_override="stm32f401cc",
                    connect_mode="attach",   # attach tanpa halt — MCU tetap berjalan
                    auto_unlock=False,
                    options={"hide_programming_progress": True},
                )
                _session.open()
                _connected_at = time.time()
                _update(
                    connected=True,
                    error=None,
                    probe_name=probe_desc,
                )
                log.info("Terhubung ke STM32F401CCUx via SWD.")
            except Exception as exc:
                log.warning(f"Gagal membuka session: {exc}")
                _update(connected=False, error=f"Gagal konek: {exc}")
                if _session:
                    _close_session(_session)
                    _session = None
                time.sleep(3)
                continue

        # ── Phase 3: Read registers ───────────────────────────────────────
        try:
            target = _session.target

            # ADC1_DR bits [11:0] = latest conversion result
            adc_raw  = target.read32(ADC1_DR)  & 0x0FFF

            # TIM1 register reads
            psc_val  = target.read32(TIM1_PSC) & 0xFFFF
            arr_val  = target.read32(TIM1_ARR) & 0xFFFF
            ccr1_val = target.read32(TIM1_CCR1)& 0xFFFF

            _update(
                connected=True,
                adc=int(adc_raw),
                psc=int(psc_val),
                period=int(arr_val),
                pulse=int(ccr1_val),
                error=None,
            )

        except Exception as exc:
            log.warning(f"Register read error: {exc}")
            _update(connected=False, error=f"Read error: {exc}")
            _close_session(_session)
            _session = None
            _connected_at = None
            time.sleep(2)
            continue

        time.sleep(0.25)  # polling ~4 Hz


# ── FastAPI App ──────────────────────────────────────────────────────────────
app = FastAPI(title="SBM Monitor Backend", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_ws_clients: List[WebSocket] = []


@app.on_event("startup")
async def _startup():
    t = threading.Thread(target=_probe_loop, daemon=True)
    t.start()
    log.info("SBM Backend siap — WebSocket: ws://localhost:8765/ws")


# ── WebSocket: push data ke browser setiap 300 ms ───────────────────────────
@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    _ws_clients.append(ws)
    log.info(f"Browser terhubung. Aktif: {len(_ws_clients)}")
    try:
        while True:
            payload = _snap()
            await ws.send_text(json.dumps(payload))
            await asyncio.sleep(0.3)
    except (WebSocketDisconnect, Exception):
        pass
    finally:
        if ws in _ws_clients:
            _ws_clients.remove(ws)
        log.info(f"Browser terputus. Aktif: {len(_ws_clients)}")


# ── REST: tulis register PWM dari slider ────────────────────────────────────
class WriteCmd(BaseModel):
    register: str   # "pulse" | "period"
    value:    int


@app.post("/write")
def write_register(cmd: WriteCmd):
    """
    Browser slider → tulis TIM1_CCR1 (pulse) atau TIM1_ARR (period) ke STM32.
    MCU akan langsung merasakan perubahan duty cycle / periode PWM.
    """
    global _session
    if not _state.get("connected") or _session is None:
        return {"ok": False, "reason": "not connected"}

    try:
        target = _session.target
        if cmd.register == "pulse":
            # Klem pulse ≤ period agar duty ≤ 100%
            period = _state["period"]
            val = max(0, min(cmd.value, period))
            target.write32(TIM1_CCR1, val)
            _update(pulse=val)
            log.info(f"TIM1_CCR1 ← {val}")
        elif cmd.register == "period":
            val = max(99, min(cmd.value, 0xFFFF))
            target.write32(TIM1_ARR, val)
            # Juga klem pulse jika perlu
            pulse = min(_state["pulse"], val)
            target.write32(TIM1_CCR1, pulse)
            _update(period=val, pulse=pulse)
            log.info(f"TIM1_ARR ← {val}, TIM1_CCR1 ← {pulse}")
        else:
            return {"ok": False, "reason": "unknown register"}
        return {"ok": True, "value": val}
    except Exception as exc:
        log.warning(f"Write error: {exc}")
        return {"ok": False, "reason": str(exc)}


# ── Health check ─────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return _snap()


# ── Entry point ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8765,
        reload=False,
        log_level="warning",   # suppress uvicorn noise; kita pakai logger sendiri
    )

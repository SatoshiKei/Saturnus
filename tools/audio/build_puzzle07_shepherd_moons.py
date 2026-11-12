#!/usr/bin/env python3
"""
Puzzle 07 — LUAS PASTORAS
Processa os 3 MP3s de rádio do grupo, corta por turnos, aplica textura RF,
distribui bursts numa captura ~4 min e gera dataset + assets runtime.

Uso:
  python tools/audio/build_puzzle07_shepherd_moons.py
"""

from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np

try:
    from pydub import AudioSegment
    from pydub.effects import compress_dynamic_range
except ImportError:
    raise SystemExit("pip install pydub")

try:
    import soundfile as sf
except ImportError:
    raise SystemExit("pip install soundfile")

try:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
except ImportError:
    plt = None

ROOT = Path(__file__).resolve().parents[2]
SRC_DIR = ROOT / "src" / "assets" / "audios" / "p7"
OUT_DIR = ROOT / "tools" / "audio" / "out"
PUBLIC_DIR = ROOT / "public" / "assets" / "audio" / "forensic" / "puzzle07"
DEBUG_DIR = OUT_DIR / "puzzle07_debug"

SR = 44100
SEED = 4071707
CAPTURE_SEC = 240.0  # 4:00

FREQ_A = 462.525
FREQ_B = 462.575
FREQ_C = 462.625
FREQ_MIN = 462.480
FREQ_MAX = 462.670

CHANNEL_FILES = {
    "A": "Capangas do Valter - Track A.mp3",
    "B": "Capangas do Valter - Secret Track B.mp3",
    "C": "Capangas do Valter - Track C.mp3",
}


def load_mono(path: Path) -> AudioSegment:
    seg = AudioSegment.from_file(path)
    return seg.set_channels(1).set_frame_rate(SR)


def to_np(seg: AudioSegment) -> np.ndarray:
    samples = np.array(seg.get_array_of_samples(), dtype=np.float64)
    if seg.channels > 1:
        samples = samples.reshape((-1, seg.channels)).mean(axis=1)
    return samples / (1 << (8 * seg.sample_width - 1))


def from_np(x: np.ndarray) -> AudioSegment:
    clipped = np.clip(x, -1.0, 1.0)
    pcm = (clipped * 32767.0).astype(np.int16)
    return AudioSegment(pcm.tobytes(), frame_rate=SR, sample_width=2, channels=1)


def detect_turns(seg: AudioSegment, min_ms: int = 600, silence_ms: int = 280, thresh_db: float = -38.0):
    """Corta por silêncio natural — não reescreve falas."""
    chunks = []
    # pydub silence detect
    from pydub.silence import detect_nonsilent

    ranges = detect_nonsilent(seg, min_silence_len=silence_ms, silence_thresh=thresh_db, seek_step=10)
    for start, end in ranges:
        if end - start < min_ms:
            continue
        # pad leve
        s = max(0, start - 40)
        e = min(len(seg), end + 60)
        chunks.append((s, e, seg[s:e]))
    if not chunks:
        chunks.append((0, len(seg), seg))
    return chunks


def radio_process(seg: AudioSegment, channel: str, rng: np.random.Generator) -> AudioSegment:
    """Textura de rádio portátil — inteligível."""
    # Band-pass estreito via high/low
    out = seg.high_pass_filter(300).low_pass_filter(3400 if channel != "B" else 3000)
    # Compressão
    try:
        out = compress_dynamic_range(out, threshold=-18.0, ratio=4.0, attack=5.0, release=50.0)
    except Exception:
        out = out.compress_dynamic_range()
    # Nível
    target = -14.0 if channel != "B" else -18.5
    change = target - out.dBFS
    out = out.apply_gain(change)
    # Ruído RF discreto
    n = to_np(out)
    noise = rng.normal(0, 1, len(n))
    # lowpass noise
    kernel = np.ones(9) / 9
    noise = np.convolve(noise, kernel, mode="same")
    noise_db = -32 if channel != "B" else -28
    n = n + noise * (10 ** (noise_db / 20))
    # Squelch envelopes
    attack = int(0.018 * SR)
    release = int(0.045 * SR)
    env = np.ones(len(n))
    if attack > 0:
        env[:attack] = np.linspace(0.05, 1, attack)
    if release > 0 and release < len(n):
        env[-release:] = np.linspace(1, 0.08, release)
    n *= env
    # Dropouts leves só no canal B
    if channel == "B":
        pos = 0
        while pos < len(n):
            gap = int(rng.integers(int(0.8 * SR), int(2.2 * SR)))
            drop = int(rng.integers(int(0.012 * SR), int(0.035 * SR)))
            i0 = pos + gap
            if i0 >= len(n):
                break
            i1 = min(len(n), i0 + drop)
            n[i0:i1] *= 0.15
            pos = i1
    # Distortion leve
    n = np.tanh(n * 1.15) / math.tanh(1.15)
    peak = np.max(np.abs(n)) + 1e-9
    if peak > 0.95:
        n *= 0.95 / peak
    return from_np(n)


def schedule_bursts(turns: dict[str, list], rng: np.random.Generator) -> list[dict]:
    """
    Distribui turnos A/C densos e B intermitente ao longo da captura.
    Determinístico via seed.
    """
    # Embaralhar ordem de uso dos turnos com seed
    a_turns = list(turns["A"])
    b_turns = list(turns["B"])
    c_turns = list(turns["C"])
    # Repetir A/C se preciso para preencher captura
    while len(a_turns) < 8:
        a_turns += turns["A"]
    while len(c_turns) < 8:
        c_turns += turns["C"]
    # Usar todos os turnos B uma vez (e só uma)
    b_list = list(b_turns)

    events: list[dict] = []
    t = 8.0
    ai = ci = bi = 0
    # Alternar A/C com B intercalado
    pattern = ["A", "C", "A", "B", "C", "A", "B", "C", "A", "B", "C", "A", "B", "C", "A", "C", "B", "A", "C"]
    for kind in pattern:
        if t > CAPTURE_SEC - 12:
            break
        if kind == "A":
            src = a_turns[ai % len(a_turns)]
            ai += 1
            power = 0.92 + float(rng.uniform(-0.04, 0.04))
            freq = FREQ_A
            ch = "A"
        elif kind == "C":
            src = c_turns[ci % len(c_turns)]
            ci += 1
            power = 0.90 + float(rng.uniform(-0.05, 0.04))
            freq = FREQ_C
            ch = "C"
        else:
            if bi >= len(b_list):
                # espaçar com A se B acabou
                src = a_turns[ai % len(a_turns)]
                ai += 1
                power = 0.9
                freq = FREQ_A
                ch = "A"
            else:
                src = b_list[bi]
                bi += 1
                power = 0.42 + float(rng.uniform(-0.05, 0.06))
                freq = FREQ_B
                ch = "B"
        dur = len(src["audio"]) / 1000.0
        gap = float(rng.uniform(2.2, 5.5))
        if ch == "B":
            gap = float(rng.uniform(4.0, 8.0))
        events.append(
            {
                "id": f"burst_{ch}_{len(events):02d}",
                "channelId": ch,
                "centerMhz": freq,
                "startSec": round(t, 3),
                "durationSec": round(dur, 3),
                "power": round(power, 3),
                "turnIndex": src["index"],
                "srcStartMs": src["startMs"],
                "srcEndMs": src["endMs"],
                "_audio": src["audio"],
            }
        )
        t += dur + gap
    # Garantir que todos os turnos B foram usados
    while bi < len(b_list) and t < CAPTURE_SEC - 6:
        src = b_list[bi]
        bi += 1
        dur = len(src["audio"]) / 1000.0
        events.append(
            {
                "id": f"burst_B_{len(events):02d}",
                "channelId": "B",
                "centerMhz": FREQ_B,
                "startSec": round(t, 3),
                "durationSec": round(dur, 3),
                "power": round(0.4 + float(rng.uniform(0, 0.08)), 3),
                "turnIndex": src["index"],
                "srcStartMs": src["startMs"],
                "srcEndMs": src["endMs"],
                "_audio": src["audio"],
            }
        )
        t += dur + float(rng.uniform(3.5, 6.5))
    events.sort(key=lambda e: e["startSec"])
    return events


def build_mix(events: list[dict], channels: set[str], bleed_b: float = 0.0) -> np.ndarray:
    n = int(CAPTURE_SEC * SR)
    mix = np.zeros(n, dtype=np.float64)
    for ev in events:
        ch = ev["channelId"]
        if ch not in channels and not (ch == "B" and bleed_b > 0):
            continue
        audio = to_np(ev["_audio"])
        gain = 1.0
        if ch == "B" and "B" not in channels:
            gain = bleed_b
        elif ch == "B":
            gain = 0.85
        i0 = int(ev["startSec"] * SR)
        i1 = min(n, i0 + len(audio))
        if i0 >= n:
            continue
        mix[i0:i1] += audio[: i1 - i0] * gain
    peak = np.max(np.abs(mix)) + 1e-9
    if peak > 0.95:
        mix *= 0.95 / peak
    return mix.astype(np.float32)


def build_waterfall(events: list[dict], cols: int = 96, rows: int = 160) -> dict:
    """rows = time (topo=passado / bottom=agora no display invertido), cols = freq."""
    values = np.zeros((rows, cols), dtype=np.float64)
    for r in range(rows):
        t = (r + 0.5) / rows * CAPTURE_SEC
        for c in range(cols):
            mhz = FREQ_MIN + (c + 0.5) / cols * (FREQ_MAX - FREQ_MIN)
            # noise floor
            values[r, c] = 0.04 + 0.02 * math.sin(r * 0.17 + c * 0.11)
        for ev in events:
            if t < ev["startSec"] or t > ev["startSec"] + ev["durationSec"]:
                continue
            # Gaussian around channel center
            sigma = 0.008 if ev["channelId"] != "B" else 0.006
            for c in range(cols):
                mhz = FREQ_MIN + (c + 0.5) / cols * (FREQ_MAX - FREQ_MIN)
                d = abs(mhz - ev["centerMhz"])
                w = math.exp(-(d * d) / (2 * sigma * sigma))
                values[r, c] = max(values[r, c], ev["power"] * w)
    # normalize
    values = np.clip(values, 0, 1)
    return {
        "cols": cols,
        "rows": rows,
        "freqMinMhz": FREQ_MIN,
        "freqMaxMhz": FREQ_MAX,
        "durationSec": CAPTURE_SEC,
        "values": values.reshape(-1).round(4).tolist(),
    }


def write_debug_waterfall(path: Path, wf: dict, events: list[dict]) -> None:
    if plt is None:
        return
    grid = np.array(wf["values"]).reshape(wf["rows"], wf["cols"])
    fig, ax = plt.subplots(figsize=(10, 7))
    ax.imshow(
        grid,
        origin="upper",
        aspect="auto",
        extent=[FREQ_MIN, FREQ_MAX, CAPTURE_SEC, 0],
        cmap="inferno",
        vmin=0,
        vmax=1,
    )
    ax.axvline(FREQ_A, color="cyan", lw=0.7, alpha=0.5)
    ax.axvline(FREQ_B, color="lime", lw=0.5, alpha=0.35, linestyle="--")
    ax.axvline(FREQ_C, color="cyan", lw=0.7, alpha=0.5)
    ax.set_xlabel("Frequency (MHz)")
    ax.set_ylabel("Time (s)")
    ax.set_title("INTERCEPT_0511_RF_CAPTURE · waterfall DEBUG")
    fig.tight_layout()
    fig.savefig(path, dpi=140)
    plt.close(fig)


def main() -> None:
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    DEBUG_DIR.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(SEED)

    turns: dict[str, list] = {}
    for ch, name in CHANNEL_FILES.items():
        path = SRC_DIR / name
        if not path.exists():
            raise FileNotFoundError(path)
        raw = load_mono(path)
        detected = detect_turns(raw)
        processed = []
        for i, (s, e, chunk) in enumerate(detected):
            radio = radio_process(chunk, ch, rng)
            processed.append({"index": i, "startMs": s, "endMs": e, "audio": radio})
            # write turn preview
            turn_path = DEBUG_DIR / f"turn_{ch}_{i:02d}.wav"
            sf.write(str(turn_path), to_np(radio).astype(np.float32), SR)
        turns[ch] = processed
        print(f"Channel {ch}: {len(processed)} turns from {name} ({len(raw)/1000:.1f}s)")

    events = schedule_bursts(turns, rng)
    print(f"Scheduled {len(events)} bursts over {CAPTURE_SEC:.0f}s")

    # Write per-burst WAVs
    bursts_meta = []
    for ev in events:
        fname = f"{ev['id']}.wav"
        public = PUBLIC_DIR / fname
        audio = to_np(ev["_audio"]).astype(np.float32)
        sf.write(str(public), audio, SR)
        meta = {k: v for k, v in ev.items() if k != "_audio"}
        meta["audioSrc"] = f"/assets/audio/forensic/puzzle07/{fname}"
        bursts_meta.append(meta)

    # Capture mix: A+C audible, B barely (bleed) — player must extract B
    mix_known = build_mix(events, {"A", "C"}, bleed_b=0.04)
    mix_b = build_mix(events, {"B"})
    sf.write(str(PUBLIC_DIR / "INTERCEPT_0511_RF_CAPTURE.wav"), mix_known, SR)
    sf.write(str(PUBLIC_DIR / "DERIVED_CHANNEL_462_575.wav"), mix_b, SR)
    sf.write(str(OUT_DIR / "puzzle07_capture.wav"), mix_known, SR)
    sf.write(str(OUT_DIR / "puzzle07_hidden.wav"), mix_b, SR)

    wf = build_waterfall(events)
    write_debug_waterfall(DEBUG_DIR / "waterfall.png", wf, events)

    summary = {
        "seed": SEED,
        "captureId": "INTERCEPT_0511_RF_CAPTURE",
        "durationSec": CAPTURE_SEC,
        "sampleRate": SR,
        "frequencies": {"A": FREQ_A, "B": FREQ_B, "C": FREQ_C},
        "freqRangeMhz": [FREQ_MIN, FREQ_MAX],
        "knownChannels": ["A", "C"],
        "hiddenChannel": "B",
        "assets": {ch: CHANNEL_FILES[ch] for ch in CHANNEL_FILES},
        "turnCounts": {ch: len(turns[ch]) for ch in turns},
        "bursts": bursts_meta,
        "waterfall": wf,
        "expectedToken": "G17N",
        "expectedTime": "23:40",
        "expectedLocation": "Galpão 17 — Pátio Norte",
        "extractToleranceMhz": 0.018,
        "idealBandwidthMhz": 0.022,
        "minBandwidthMhz": 0.012,
        "maxBandwidthMhz": 0.045,
        "publicDir": str(PUBLIC_DIR.relative_to(ROOT)),
        "debugDir": str(DEBUG_DIR.relative_to(ROOT)),
    }
    (OUT_DIR / "puzzle07_timing.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    # Slim TS-friendly dump without huge waterfall duplicate path
    (PUBLIC_DIR / "capture_meta.json").write_text(
        json.dumps({k: v for k, v in summary.items() if k != "waterfall"}, indent=2),
        encoding="utf-8",
    )
    (PUBLIC_DIR / "waterfall.json").write_text(json.dumps(wf), encoding="utf-8")
    # JSON consumido pelo dataset TS (Vite importa JSON).
    ts_dir = ROOT / "src" / "forensic" / "puzzles"
    ts_dir.mkdir(parents=True, exist_ok=True)
    (ts_dir / "puzzle07Waterfall.json").write_text(json.dumps(wf), encoding="utf-8")
    slim = {
        k: summary[k]
        for k in [
            "durationSec",
            "frequencies",
            "freqRangeMhz",
            "knownChannels",
            "hiddenChannel",
            "expectedToken",
            "expectedTime",
            "expectedLocation",
            "extractToleranceMhz",
            "idealBandwidthMhz",
            "minBandwidthMhz",
            "maxBandwidthMhz",
            "turnCounts",
            "seed",
        ]
    }
    slim["bursts"] = bursts_meta
    (ts_dir / "puzzle07Meta.json").write_text(json.dumps(slim, indent=2), encoding="utf-8")
    print(json.dumps({
        "durationSec": CAPTURE_SEC,
        "bursts": len(bursts_meta),
        "B": sum(1 for e in bursts_meta if e["channelId"] == "B"),
        "A": sum(1 for e in bursts_meta if e["channelId"] == "A"),
        "C": sum(1 for e in bursts_meta if e["channelId"] == "C"),
        "freqs": [FREQ_A, FREQ_B, FREQ_C],
    }, indent=2))


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Puzzle 06 — HEXÁGONO
Sintetiza seis WAVs com padrões espectrais I/V (algarismos romanos).

UNK_01 IV, UNK_02 VIII, UNK_03 I, UNK_04 V, UNK_05 II, UNK_06 VI
→ PIN 481526

Uso:
  python tools/audio/build_puzzle06_hexagon.py
"""

from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np

try:
    import soundfile as sf
except ImportError:
    print("pip install soundfile")
    raise

try:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
except ImportError:
    plt = None

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "tools" / "audio" / "out"
PUBLIC_DIR = ROOT / "public" / "assets" / "audio" / "forensic" / "puzzle06"
DEBUG_DIR = OUT_DIR / "puzzle06_debug"

SR = 44100
SEED = 4061106
# Faixa dos símbolos
F_HI = 4400.0
F_MID = 1900.0
F_LO = 1600.0
F_TOP = 4800.0

DURATIONS = {
    "UNK_01": 6.8,
    "UNK_02": 8.4,
    "UNK_03": 5.1,
    "UNK_04": 7.3,
    "UNK_05": 5.9,
    "UNK_06": 7.8,
}

# Ordem temporal dos motivos (esquerda→direita no espectrograma)
# IV: I V | VIII: V I I I | I: I | V: V | II: I I | VI: V I
SYMBOLS = {
    "UNK_01": ["I", "V"],
    "UNK_02": ["V", "I", "I", "I"],
    "UNK_03": ["I"],
    "UNK_04": ["V"],
    "UNK_05": ["I", "I"],
    "UNK_06": ["V", "I"],
}

TEXTURE = {
    "UNK_01": "electrical",
    "UNK_02": "metallic",
    "UNK_03": "airy",
    "UNK_04": "pulsing",
    "UNK_05": "granular",
    "UNK_06": "unstable",
}


def db(x: float) -> float:
    return 10.0 ** (x / 20.0)


def fade(n: int, attack: int, release: int) -> np.ndarray:
    env = np.ones(n, dtype=np.float64)
    if attack > 0:
        env[:attack] = np.linspace(0, 1, attack)
    if release > 0:
        env[-release:] = np.linspace(1, 0, release)
    return env


def make_I(rng: np.random.Generator, variant: int = 0) -> np.ndarray:
    """Transiente curto de banda larga — linha vertical no espectrograma."""
    dur = 0.022 + rng.uniform(-0.004, 0.006) + variant * 0.0015
    n = max(8, int(dur * SR))
    noise = rng.normal(0, 1, n)
    # Ênfase na banda 1.6–4.8 kHz via ressonadores
    t = np.arange(n) / SR
    carriers = (
        np.sin(2 * np.pi * 2200 * t)
        + 0.7 * np.sin(2 * np.pi * 3100 * t)
        + 0.5 * np.sin(2 * np.pi * 4100 * t)
    )
    click = noise * 0.55 + carriers * 0.45
    # Envelope explosivo
    tau = 0.006 + rng.uniform(0, 0.003)
    env = np.exp(-t / tau) * fade(n, 2, max(4, n // 5))
    gain = db(-9 + rng.uniform(-1.5, 1.5))
    # Micro reverb (delay curto)
    out = click * env * gain
    d = int(0.012 * SR) + variant * 20
    if d < n:
        delayed = np.zeros_like(out)
        delayed[d:] = out[:-d] * (0.18 + 0.04 * (variant % 3))
        out = out + delayed
    return out.astype(np.float64)


def chirp(f0: float, f1: float, dur: float, gain: float) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    # Instantaneous phase for linear chirp
    k = (f1 - f0) / max(dur, 1e-9)
    phase = 2 * np.pi * (f0 * t + 0.5 * k * t * t)
    return (np.sin(phase) * fade(n, int(0.004 * SR), int(0.008 * SR)) * gain).astype(np.float64)


def make_V(rng: np.random.Generator, variant: int = 0) -> np.ndarray:
    """Dois chirps formando V: 4400→1900→4400."""
    f_hi = F_HI + rng.uniform(-80, 120) + variant * 15
    f_mid = F_MID + rng.uniform(-60, 80) - variant * 10
    half = 0.095 + rng.uniform(-0.01, 0.015)
    g = db(-11 + rng.uniform(-1.2, 1.0))
    down = chirp(f_hi, f_mid, half, g)
    up = chirp(f_mid, f_hi, half, g * 0.95)
    # Overlap ligeiro no centro
    overlap = int(0.012 * SR)
    total = len(down) + len(up) - overlap
    out = np.zeros(total, dtype=np.float64)
    out[: len(down)] += down
    out[len(down) - overlap :] += up
    # Harmônico fraco
    harm = chirp(f_hi * 0.5, f_mid * 0.5, half, g * 0.22)
    harm2 = chirp(f_mid * 0.5, f_hi * 0.5, half, g * 0.2)
    h = np.zeros_like(out)
    h[: len(harm)] += harm
    h[len(harm) - overlap : len(harm) - overlap + len(harm2)] += harm2
    out = out + h[: len(out)]
    # Cauda tonal curta (não broadband — evita parecer um I)
    tail_n = int(0.028 * SR)
    t = np.arange(tail_n) / SR
    tail = np.sin(2 * np.pi * f_hi * t) * np.exp(-t / 0.01) * db(-26)
    out = np.concatenate([out, tail])
    return out


def place(buf: np.ndarray, frag: np.ndarray, at_sec: float) -> None:
    i0 = int(at_sec * SR)
    i1 = min(len(buf), i0 + len(frag))
    if i0 >= len(buf) or i1 <= i0:
        return
    buf[i0:i1] += frag[: i1 - i0]


def texture_electrical(n: int, rng: np.random.Generator) -> np.ndarray:
    t = np.arange(n) / SR
    hum = np.sin(2 * np.pi * 60 * t) * db(-22)
    hum += 0.4 * np.sin(2 * np.pi * 120 * t) * db(-26)
    mod = 1 + 0.15 * np.sin(2 * np.pi * (0.7 + rng.uniform(0, 0.4)) * t)
    hiss = rng.normal(0, 1, n)
    # Lowpass-ish: integrate-ish via cumulative smoothing
    for _ in range(3):
        hiss = np.convolve(hiss, np.ones(9) / 9, mode="same")
    return hum * mod + hiss * db(-34)


def texture_metallic(n: int, rng: np.random.Generator) -> np.ndarray:
    t = np.arange(n) / SR
    partials = [220, 330, 550, 880]
    sig = np.zeros(n)
    for i, f in enumerate(partials):
        sig += np.sin(2 * np.pi * (f + rng.uniform(-2, 2)) * t) * db(-28 - i * 2)
        # Ring
        if i == 1:
            env = 0.5 + 0.5 * np.sin(2 * np.pi * 1.3 * t)
            sig += np.sin(2 * np.pi * 1100 * t) * env * db(-32)
    noise = rng.normal(0, 1, n)
    for _ in range(2):
        noise = np.convolve(noise, np.ones(5) / 5, mode="same")
    # Sparse echoes
    out = sig + noise * db(-36)
    d = int(0.08 * SR)
    delayed = np.zeros_like(out)
    delayed[d:] = out[:-d] * 0.22
    return out + delayed


def texture_airy(n: int, rng: np.random.Generator) -> np.ndarray:
    noise = rng.normal(0, 1, n)
    # High-shelf emphasis via difference
    hip = np.diff(noise, prepend=noise[0])
    for _ in range(2):
        noise = np.convolve(noise, np.ones(21) / 21, mode="same")
    return noise * db(-30) + hip * db(-38)


def texture_pulsing(n: int, rng: np.random.Generator) -> np.ndarray:
    t = np.arange(n) / SR
    pulse_rate = 2.4 + rng.uniform(-0.2, 0.3)
    env = (0.55 + 0.45 * np.sin(2 * np.pi * pulse_rate * t)) ** 2
    bass = np.sin(2 * np.pi * 55 * t) * env * db(-20)
    mid = np.sin(2 * np.pi * 110 * t) * env * db(-26)
    grit = rng.normal(0, 1, n)
    for _ in range(4):
        grit = np.convolve(grit, np.ones(15) / 15, mode="same")
    # Manter energia de textura abaixo da banda dos símbolos (~1.6 kHz)
    for _ in range(6):
        grit = np.convolve(grit, np.ones(31) / 31, mode="same")
    return bass + mid + grit * env * db(-34)


def texture_granular(n: int, rng: np.random.Generator) -> np.ndarray:
    out = np.zeros(n)
    # Irregular grains below symbol band
    pos = 0
    while pos < n:
        gdur = int(rng.uniform(0.008, 0.03) * SR)
        gap = int(rng.uniform(0.02, 0.08) * SR)
        f = rng.uniform(180, 900)
        t = np.arange(gdur) / SR
        grain = np.sin(2 * np.pi * f * t) * fade(gdur, gdur // 4, gdur // 3) * db(-28)
        i1 = min(n, pos + gdur)
        out[pos:i1] += grain[: i1 - pos]
        pos += gdur + gap
    noise = rng.normal(0, 1, n) * db(-36)
    return out + noise


def texture_unstable(n: int, rng: np.random.Generator) -> np.ndarray:
    t = np.arange(n) / SR
    f0 = 90 + 8 * np.sin(2 * np.pi * 0.35 * t) + 3 * np.sin(2 * np.pi * 1.1 * t)
    phase = 2 * np.pi * np.cumsum(f0) / SR
    drone = np.sin(phase) * db(-22)
    ring = np.sin(2 * np.pi * 640 * t) * np.exp(-0.15 * (t % 1.7)) * db(-30)
    return drone + ring + rng.normal(0, 1, n) * db(-38)


TEXTURE_FN = {
    "electrical": texture_electrical,
    "metallic": texture_metallic,
    "airy": texture_airy,
    "pulsing": texture_pulsing,
    "granular": texture_granular,
    "unstable": texture_unstable,
}


def symbol_window(duration: float, count: int) -> tuple[float, float]:
    """Janela central para colocar os símbolos, com margem de intro/cauda."""
    intro = min(1.1, duration * 0.18)
    outro = min(0.9, duration * 0.14)
    start = intro
    end = duration - outro
    if end - start < count * 0.35:
        start = 0.4
        end = duration - 0.35
    return start, end


def build_file(name: str, rng: np.random.Generator) -> tuple[np.ndarray, dict]:
    dur = DURATIONS[name]
    n = int(dur * SR)
    buf = np.zeros(n, dtype=np.float64)
    tex = TEXTURE[name]
    buf += TEXTURE_FN[tex](n, rng)

    motifs = SYMBOLS[name]
    w0, w1 = symbol_window(dur, len(motifs))
    span = max(0.2, w1 - w0)
    # Espaçamento uniforme dos motivos
    if len(motifs) == 1:
        times = [w0 + span * 0.35]
    else:
        times = [w0 + span * (0.12 + 0.76 * i / (len(motifs) - 1)) for i in range(len(motifs))]

    placed = []
    for i, kind in enumerate(motifs):
        if kind == "I":
            frag = make_I(rng, variant=i + hash(name) % 5)
        else:
            frag = make_V(rng, variant=i + hash(name) % 4)
        # Amp jitter
        frag = frag * (0.92 + rng.uniform(0, 0.16))
        place(buf, frag, times[i])
        placed.append({"kind": kind, "timeSec": round(times[i], 3), "durSec": round(len(frag) / SR, 3)})

    # Soft limiter
    peak = np.max(np.abs(buf)) + 1e-9
    if peak > 0.95:
        buf *= 0.95 / peak
    meta = {
        "id": name,
        "durationSec": round(dur, 3),
        "texture": tex,
        "symbol": "".join(motifs) if name != "UNK_02" else "VIII",
        "roman": {
            "UNK_01": "IV",
            "UNK_02": "VIII",
            "UNK_03": "I",
            "UNK_04": "V",
            "UNK_05": "II",
            "UNK_06": "VI",
        }[name],
        "digit": {"UNK_01": "4", "UNK_02": "8", "UNK_03": "1", "UNK_04": "5", "UNK_05": "2", "UNK_06": "6"}[
            name
        ],
        "motifs": placed,
        "symbolBandHz": [F_LO, F_TOP],
    }
    # Fix roman display for composed
    meta["symbol"] = meta["roman"]
    return buf.astype(np.float32), meta


def write_debug_spectrogram(path: Path, audio: np.ndarray, title: str) -> None:
    if plt is None:
        return
    nperseg = 1024
    noverlap = 768
    # Manual STFT magnitude
    hop = nperseg - noverlap
    window = np.hanning(nperseg)
    cols = max(1, (len(audio) - nperseg) // hop + 1)
    spec = np.zeros((nperseg // 2 + 1, cols))
    for c in range(cols):
        i0 = c * hop
        frame = audio[i0 : i0 + nperseg] * window
        if len(frame) < nperseg:
            frame = np.pad(frame, (0, nperseg - len(frame)))
        mag = np.abs(np.fft.rfft(frame))
        spec[:, c] = mag
    spec_db = 20 * np.log10(spec + 1e-10)
    freqs = np.fft.rfftfreq(nperseg, 1 / SR)
    times = np.arange(cols) * hop / SR
    # Focus display 0–6 kHz
    fmax = 6000
    fmask = freqs <= fmax
    fig, ax = plt.subplots(figsize=(10, 4))
    ax.imshow(
        spec_db[fmask],
        origin="lower",
        aspect="auto",
        extent=[times[0], times[-1] if len(times) else 1, 0, fmax],
        cmap="magma",
        vmin=np.percentile(spec_db[fmask], 40),
        vmax=np.percentile(spec_db[fmask], 99.5),
    )
    ax.set_title(title)
    ax.set_xlabel("Time (s)")
    ax.set_ylabel("Hz")
    ax.axhline(F_LO, color="cyan", lw=0.5, alpha=0.4)
    ax.axhline(F_TOP, color="cyan", lw=0.5, alpha=0.4)
    fig.tight_layout()
    fig.savefig(path, dpi=140)
    plt.close(fig)


def band_energy(audio: np.ndarray, f0: float, f1: float) -> float:
    nperseg = 2048
    window = np.hanning(min(nperseg, len(audio)))
    frame = audio[: len(window)] * window
    mag = np.abs(np.fft.rfft(frame, n=nperseg))
    freqs = np.fft.rfftfreq(nperseg, 1 / SR)
    mask = (freqs >= f0) & (freqs <= f1)
    return float(np.mean(mag[mask] ** 2))


def main() -> None:
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    DEBUG_DIR.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(SEED)

    files_meta = []
    for name in ["UNK_01", "UNK_02", "UNK_03", "UNK_04", "UNK_05", "UNK_06"]:
        audio, meta = build_file(name, rng)
        wav_public = PUBLIC_DIR / f"{name}.wav"
        wav_out = OUT_DIR / f"puzzle06_{name}.wav"
        sf.write(str(wav_public), audio, SR, subtype="PCM_16")
        sf.write(str(wav_out), audio, SR, subtype="PCM_16")
        write_debug_spectrogram(DEBUG_DIR / f"{name}_spectrogram.png", audio, f"{name} · {meta['roman']}")
        meta["bandEnergy_1k6_4k8"] = round(band_energy(audio, F_LO, F_TOP), 6)
        meta["bandEnergy_low"] = round(band_energy(audio, 40, 800), 6)
        meta["path"] = str(wav_public.relative_to(ROOT))
        files_meta.append(meta)
        print(f"{name} {meta['durationSec']}s {meta['roman']} → {wav_public}")

    summary = {
        "seed": SEED,
        "sampleRate": SR,
        "expectedPin": "481526",
        "symbolBandHz": [F_LO, F_TOP],
        "vSweepHz": [F_HI, F_MID, F_HI],
        "files": files_meta,
        "debugDir": str(DEBUG_DIR.relative_to(ROOT)),
    }
    (OUT_DIR / "puzzle06_timing.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps({"expectedPin": "481526", "files": [(f["id"], f["roman"], f["durationSec"]) for f in files_meta]}, indent=2))


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Puzzle 10 — Ordem dos Anéis: sirene compartilhada + fingerprints + frame patterns."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np

try:
    from pydub import AudioSegment
except ImportError:
    raise SystemExit("pip install pydub")

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "public" / "assets" / "audio" / "forensic" / "puzzle10"
P10_SRC = ROOT / "src" / "assets" / "audios" / "p10"
P10_PUB = ROOT / "public" / "assets" / "block08" / "rings" / "p10"
TS_META = ROOT / "src" / "forensic" / "puzzles" / "puzzle10Meta.json"
SIREN_SRC = P10_SRC / "police-siren.mp3"
SR = 44100
SEED = 4101010
SIREN_CLIP_SEC = 2.4


def write_wav(path: Path, x: np.ndarray) -> None:
    import wave

    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def load_siren_clip() -> np.ndarray:
    if not SIREN_SRC.exists():
        raise SystemExit(f"Missing siren asset: {SIREN_SRC}")
    seg = AudioSegment.from_file(SIREN_SRC)
    seg = seg.set_channels(1).set_frame_rate(SR).set_sample_width(2)
    x = np.array(seg.get_array_of_samples(), dtype=np.float64) / 32768.0
    n = min(len(x), int(SIREN_CLIP_SEC * SR))
    x = x[:n]
    peak = float(np.max(np.abs(x))) or 1.0
    x = x / peak * 0.42
    fade = max(1, int(0.04 * SR))
    x[:fade] *= np.linspace(0, 1, fade)
    x[-fade:] *= np.linspace(1, 0, fade)
    return x


def bed(n: int, rng: np.random.Generator) -> np.ndarray:
    x = rng.normal(0, 0.03, n)
    for _ in range(3):
        x = np.convolve(x, np.ones(9) / 9, mode="same")
    return x


def env(x: np.ndarray, start: float, dur: float) -> list[float]:
    hop = int(0.02 * SR)
    a = int(start * SR)
    b = a + int(dur * SR)
    seg = x[a:b]
    out = []
    for i in range(0, max(1, len(seg) - hop), hop):
        out.append(float(np.sqrt(np.mean(seg[i : i + hop] ** 2))))
    return out


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    P10_PUB.mkdir(parents=True, exist_ok=True)
    for f in P10_SRC.glob("*.png"):
        (P10_PUB / f.name).write_bytes(f.read_bytes())

    rng = np.random.default_rng(SEED)
    siren = load_siren_clip()

    L = bed(int(12 * SR), rng)
    s0 = int(4.2 * SR)
    L[s0 : s0 + len(siren)] += siren

    S = bed(int(10 * SR), rng)
    s1 = int(2.8 * SR)
    S[s1 : s1 + len(siren)] += siren * 0.9

    write_wav(PUBLIC / "livia_protest_clip.wav", L)
    write_wav(PUBLIC / "samuel_phone_clip.wav", S)
    write_wav(PUBLIC / "siren_signature.wav", siren)

    meta = {
        "seed": SEED,
        "sirenPattern": "police-siren",
        "sirenAsset": "src/assets/audios/p10/police-siren.mp3",
        "liviaSirenStartSec": 4.2,
        "samuelSirenStartSec": 2.8,
        "liviaEnv": env(L, 4.0, 2.0),
        "samuelEnv": env(S, 2.6, 2.0),
        "wrongEnv": env(bed(int(8 * SR), rng), 1.0, 2.0),
        "framePattern": "bright-twoBands-partialDark-bright",
        "framePatternB": [0.82, 0.81, 0.55, 0.54, 0.33, 0.52, 0.80],
        "framePatternC": [0.79, 0.80, 0.53, 0.55, 0.31, 0.50, 0.78],
        "framePatternNoise": [0.4, 0.2, 0.7, 0.1, 0.9, 0.3, 0.5],
        "fingerprintThreshold": 0.85,
        "frameThreshold": 0.85,
        "cameras": ["CAM 03", "CAM 07", "CAM 11"],
        "missingSegment": "CAM11_SEG_1279",
        "timings": {"CAM03": "21:14:08", "CAM07": "21:14:31", "CAM11": "21:15:02"},
        "assetsRoot": "/assets/block08/rings/p10/",
    }
    TS_META.write_text(json.dumps(meta), encoding="utf-8")
    (PUBLIC / "capture_meta.json").write_text(json.dumps(meta), encoding="utf-8")
    print(json.dumps({"copied": len(list(P10_PUB.glob('*.png'))), "sirenSec": round(len(siren)/SR, 2)}, indent=2))


if __name__ == "__main__":
    main()

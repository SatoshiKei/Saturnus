#!/usr/bin/env python3
"""Puzzle 11 — Rotação de Saturno: Train Sounds → referência + misturas de rádio."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np

try:
    from pydub import AudioSegment
except ImportError:
    raise SystemExit("pip install pydub")

ROOT = Path(__file__).resolve().parents[2]
TRAIN = ROOT / "src" / "assets" / "audios" / "p11" / "Train Sounds.mp3"
PUBLIC = ROOT / "public" / "assets" / "audio" / "forensic" / "puzzle11"
DEBUG = ROOT / "tools" / "audio" / "out" / "puzzle11_debug"
TS_META = ROOT / "src" / "forensic" / "puzzles" / "puzzle11Meta.json"
SR = 22050
SEED = 4111111


def to_mono(path: Path, start_ms: int, dur_ms: int) -> np.ndarray:
    seg = AudioSegment.from_file(path)[start_ms : start_ms + dur_ms]
    seg = seg.set_channels(1).set_frame_rate(SR).set_sample_width(2)
    x = np.array(seg.get_array_of_samples(), dtype=np.float64) / 32768.0
    return x


def write_wav(path: Path, x: np.ndarray) -> None:
    import wave

    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def bandpass_approx(x: np.ndarray, lo: float, hi: float) -> np.ndarray:
    # crude FIR via successive difference / smoothing
    y = x.copy()
    k = max(1, int(SR / hi))
    y = np.convolve(y, np.ones(k) / k, mode="same")
    # high-ish by subtracting heavy smooth
    k2 = max(1, int(SR / max(lo, 80)))
    low = np.convolve(x, np.ones(k2) / k2, mode="same")
    return y - 0.35 * low


def radio_compress(x: np.ndarray) -> np.ndarray:
    y = np.tanh(x * 2.4) * 0.55
    noise = np.random.default_rng(SEED).normal(0, 0.02, len(y))
    return y + noise


def env(x: np.ndarray, hop: int = int(0.04 * SR)) -> list[float]:
    out = []
    for i in range(0, max(1, len(x) - hop), hop):
        out.append(float(np.sqrt(np.mean(x[i : i + hop] ** 2))))
    return out


def main() -> None:
    if not TRAIN.exists():
        raise SystemExit(f"Missing {TRAIN}")
    PUBLIC.mkdir(parents=True, exist_ok=True)
    DEBUG.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(SEED)

    # Use a mid segment with sustained train character (~12s)
    ref = to_mono(TRAIN, 8000, 12000)
    write_wav(PUBLIC / "train_reference_clean.wav", ref)

    distant = bandpass_approx(ref * 0.35, 200, 2500)
    distant = radio_compress(distant * 0.7)
    write_wav(PUBLIC / "train_distant_radio_reference.wav", distant)

    # VTR-14 radio: squelch + dispatch ambience + distant train buried
    n = len(distant)
    amb = rng.normal(0, 0.04, n)
    for _ in range(2):
        amb = np.convolve(amb, np.ones(7) / 7, mode="same")
    # short tone bursts (radio)
    for t0 in (1.2, 3.5, 7.0):
        i = int(t0 * SR)
        burst = np.sin(2 * np.pi * 1000 * np.arange(int(0.08 * SR)) / SR) * 0.15
        amb[i : i + len(burst)] += burst
    v14 = radio_compress(amb * 0.5 + distant * 0.85)
    write_wav(PUBLIC / "vtr14_radio_window.wav", v14)

    # VTR-08: similar radio but different ambient (no train)
    amb8 = rng.normal(0, 0.045, n)
    amb8 = np.convolve(amb8, np.ones(11) / 11, mode="same")
    v08 = radio_compress(amb8)
    write_wav(PUBLIC / "vtr08_radio_window.wav", v08)

    # VTR-21: traffic hiss, no train fingerprint
    amb21 = rng.normal(0, 0.05, n)
    amb21 += np.sin(2 * np.pi * 120 * np.arange(n) / SR) * 0.02
    v21 = radio_compress(amb21)
    write_wav(PUBLIC / "vtr21_radio_window.wav", v21)

    meta = {
        "seed": SEED,
        "sampleRate": SR,
        "trainAsset": str(TRAIN.relative_to(ROOT)),
        "crossingId": "PN-NORTE-03",
        "crossingLabel": "Passagem de nível Norte — setor auxiliar",
        "trainWindow": {"occupy": "01:12", "clear": "01:18"},
        "cadIncident": {
            "id": "CAD-1847",
            "label": "Veículo em chamas no acostamento — possível ocupante",
            "time": "01:21",
            "priority": "urgent",
            "sector": "Via auxiliar norte / acostamento km 4",
        },
        "fingerprintThreshold": 0.72,
        "env": {
            "reference": env(distant),
            "vtr14": env(v14),
            "vtr08": env(v08),
            "vtr21": env(v21),
        },
        "audio": {
            "reference": "/assets/audio/forensic/puzzle11/train_distant_radio_reference.wav",
            "clean": "/assets/audio/forensic/puzzle11/train_reference_clean.wav",
            "vtr14": "/assets/audio/forensic/puzzle11/vtr14_radio_window.wav",
            "vtr08": "/assets/audio/forensic/puzzle11/vtr08_radio_window.wav",
            "vtr21": "/assets/audio/forensic/puzzle11/vtr21_radio_window.wav",
        },
    }
    TS_META.write_text(json.dumps(meta), encoding="utf-8")
    (PUBLIC / "capture_meta.json").write_text(json.dumps(meta), encoding="utf-8")
    (DEBUG / "meta.json").write_text(json.dumps({k: v for k, v in meta.items() if k != "env"}, indent=2), encoding="utf-8")
    print(json.dumps({"ok": True, "samples": len(ref), "vtr14Env": len(meta["env"]["vtr14"])}, indent=2))


if __name__ == "__main__":
    main()

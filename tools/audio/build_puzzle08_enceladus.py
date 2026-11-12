#!/usr/bin/env python3
"""
Puzzle 08 — ENCELADUS
8 ciclos hospitalares repetitivos; ciclo 6 contém a fala da Renata.
Diferença (ciclo − padrão comum) revela “Ricardo”.

Uso:
  python tools/audio/build_puzzle08_enceladus.py
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np

try:
    from pydub import AudioSegment
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
VOICE = ROOT / "src" / "assets" / "audios" / "p8" / "Renata - Ricardo.mp3"
OUT = ROOT / "tools" / "audio" / "out"
PUBLIC = ROOT / "public" / "assets" / "audio" / "forensic" / "puzzle08"
DEBUG = OUT / "puzzle08_debug"

SR = 44100
SEED = 4080808
N_CYCLES = 8
CYCLE_SEC = 6.0
ANOMALY = 5  # 0-based → ciclo 6
DURATION = N_CYCLES * CYCLE_SEC  # 48 s
# “Ricardo” ~ início da frase (ajuste fino no envelope)
RICARDO_END_SEC = 0.85


def load_mono(path: Path) -> np.ndarray:
    seg = AudioSegment.from_file(path).set_channels(1).set_frame_rate(SR)
    x = np.array(seg.get_array_of_samples(), dtype=np.float64)
    return x / (1 << (8 * seg.sample_width - 1))


def db(v: float) -> float:
    return 10 ** (v / 20)


def fade(n: int, a: int, r: int) -> np.ndarray:
    e = np.ones(n, dtype=np.float64)
    if a > 0:
        e[:a] = np.linspace(0, 1, a)
    if r > 0:
        e[-r:] = np.linspace(1, 0, r)
    return e


def make_cycle(rng: np.random.Generator, variant: int) -> np.ndarray:
    n = int(CYCLE_SEC * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)

    # Room tone / ventilação (variação discreta)
    noise = rng.normal(0, 1, n)
    for _ in range(4):
        noise = np.convolve(noise, np.ones(21) / 21, mode="same")
    out += noise * db(-33 + rng.uniform(-0.4, 0.4))

    # Hum elétrico
    out += np.sin(2 * np.pi * (60 + rng.uniform(-0.15, 0.15)) * t) * db(-27)
    out += np.sin(2 * np.pi * 120 * t) * db(-33)

    # Pulso/bip periódico (~0.4 s)
    bip_t0 = 0.35 + variant * 0.002 + rng.uniform(-0.004, 0.004)
    bip_n = int(0.12 * SR)
    i0 = int(bip_t0 * SR)
    bt = np.arange(bip_n) / SR
    bip = np.sin(2 * np.pi * (1800 + rng.uniform(-40, 40)) * bt) * fade(bip_n, 40, 200) * db(-16)
    out[i0 : i0 + bip_n] += bip[: max(0, min(bip_n, n - i0))]

    # Ruído mecânico curto (~1.1 s)
    m0 = int((1.05 + rng.uniform(-0.02, 0.02)) * SR)
    mn = int(0.18 * SR)
    mech = rng.normal(0, 1, mn)
    mech = np.convolve(mech, np.ones(5) / 5, mode="same")
    mech *= fade(mn, 20, 80) * db(-20)
    # ressonância
    mt = np.arange(mn) / SR
    mech += np.sin(2 * np.pi * 420 * mt) * fade(mn, 10, 60) * db(-24)
    out[m0 : m0 + mn] += mech[: max(0, min(mn, n - m0))]

    # Segundo evento (~3.2 s)
    e0 = int((3.15 + rng.uniform(-0.015, 0.015)) * SR)
    en = int(0.09 * SR)
    et = np.arange(en) / SR
    ev = np.sin(2 * np.pi * (920 + rng.uniform(-20, 20)) * et) * fade(en, 15, 100) * db(-18)
    out[e0 : e0 + en] += ev[: max(0, min(en, n - e0))]

    # Clique leve (~4.6 s)
    c0 = int((4.55 + rng.uniform(-0.01, 0.01)) * SR)
    cn = int(0.025 * SR)
    click = rng.normal(0, 1, cn) * np.exp(-np.arange(cn) / (0.006 * SR)) * db(-22)
    out[c0 : c0 + cn] += click[: max(0, min(cn, n - c0))]

    # Ganho leve por ciclo
    out *= 0.96 + rng.uniform(0, 0.05)
    return out.astype(np.float64)


def place(buf: np.ndarray, frag: np.ndarray, at: float) -> None:
    i0 = int(at * SR)
    i1 = min(len(buf), i0 + len(frag))
    if i1 > i0:
        buf[i0:i1] += frag[: i1 - i0]


def main() -> None:
    if not VOICE.exists():
        raise SystemExit(f"Asset da Renata ausente: {VOICE}")

    PUBLIC.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    DEBUG.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(SEED)

    voice = load_mono(VOICE)
    # Normalizar voz — “Ricardo” audível no residual; não destruir correlação dos eventos
    voice = voice / (np.max(np.abs(voice)) + 1e-9) * db(-11)

    cycles = [make_cycle(rng, i) for i in range(N_CYCLES)]
    # Ciclo anômalo: fala + máscara não-recorrente sobre o restante
    anom = cycles[ANOMALY].copy()
    voice_at = 1.55  # após bip+mech, no “intervalo”
    place(anom, voice, voice_at)
    # Máscara não-recorrente a partir de ~Ricardo_end (cobre resto da frase)
    mask_start = voice_at + RICARDO_END_SEC
    # Máscara cobre o resto da frase, mas deixa room tone final livre p/ correlação
    mask_n = int(2.6 * SR)
    mask = rng.normal(0, 1, mask_n)
    for _ in range(2):
        mask = np.convolve(mask, np.ones(7) / 7, mode="same")
    mt = np.arange(mask_n) / SR
    mask += 0.35 * np.sin(2 * np.pi * 1100 * mt)
    mask *= fade(mask_n, 200, 400) * db(-20)
    place(anom, mask, mask_start)
    cycles[ANOMALY] = anom

    # Master
    master = np.concatenate(cycles)
    peak = np.max(np.abs(master)) + 1e-9
    if peak > 0.95:
        master *= 0.95 / peak
        cycles = [c * (0.95 / peak) for c in cycles]
        master = np.concatenate(cycles)

    # Padrão comum = média dos ciclos normais
    normals = [cycles[i] for i in range(N_CYCLES) if i != ANOMALY]
    # Alinhar por comprimento
    L = min(len(c) for c in normals)
    stack = np.stack([c[:L] for c in normals], axis=0)
    common = np.median(stack, axis=0)
    # Residual ideal
    residual = cycles[ANOMALY][:L] - common
    # Soft gate residual fora da janela da voz (opcional limpeza DEBUG)
    residual_out = residual.copy()
    peak_r = np.max(np.abs(residual_out)) + 1e-9
    residual_out = residual_out / peak_r * 0.7

    sf.write(str(PUBLIC / "p08_enceladus_final.wav"), master.astype(np.float32), SR)
    sf.write(str(PUBLIC / "AUD_0008.wav"), master.astype(np.float32), SR)
    sf.write(str(OUT / "puzzle08_final.wav"), master.astype(np.float32), SR)
    sf.write(str(DEBUG / "common_pattern.wav"), common.astype(np.float32), SR)
    sf.write(str(DEBUG / "cycle_anomaly.wav"), cycles[ANOMALY].astype(np.float32), SR)
    sf.write(str(DEBUG / "residual_ideal.wav"), residual_out.astype(np.float32), SR)
    for i, c in enumerate(cycles):
        sf.write(str(DEBUG / f"cycle_{i+1:02d}.wav"), c.astype(np.float32), SR)

    # Also public residual for playback after solve (derived)
    sf.write(str(PUBLIC / "p08_residual_preview.wav"), residual_out.astype(np.float32), SR)

    # Difference scores: residual RMS / common RMS (normais baixos; anômalo alto)
    common_rms = float(np.sqrt(np.mean(common**2)) + 1e-9)
    scores = []
    for i, c in enumerate(cycles):
        r = c[:L] - common
        score = float(np.sqrt(np.mean(r**2)) / common_rms)
        scores.append(round(score, 4))

    # Envelope templates for Find Similar:
    # features só nas janelas dos eventos periódicos (antes/fora do núcleo da fala),
    # para o ciclo 6 continuar correlacionável (~8 matches) sem fakear o áudio.
    hop = int(0.02 * SR)
    # Evitar 1.55–~5.0 s no FEATURE (voz + máscara no ciclo 6).
    structure_windows = (
        (0.15, 0.65),
        (0.90, 1.45),
        (5.35, 5.95),
    )

    def pattern_envelope(c: np.ndarray) -> list[float]:
        env: list[float] = []
        for a, b in structure_windows:
            i0 = int(a * SR)
            i1 = int(b * SR)
            seg = c[i0:i1]
            for j in range(0, max(0, len(seg) - hop), hop):
                env.append(float(np.sqrt(np.mean(seg[j : j + hop] ** 2))))
        return env

    templates = [pattern_envelope(c) for c in cycles]

    boundaries = [
        {"index": i, "startSec": round(i * CYCLE_SEC, 3), "endSec": round((i + 1) * CYCLE_SEC, 3)}
        for i in range(N_CYCLES)
    ]

    meta = {
        "seed": SEED,
        "voiceAsset": str(VOICE.relative_to(ROOT)),
        "durationSec": DURATION,
        "cycleSec": CYCLE_SEC,
        "cycleCount": N_CYCLES,
        "anomalyCycleIndex": ANOMALY,
        "anomalyCycleNumber": ANOMALY + 1,
        "ricardoWindowSec": [voice_at, voice_at + RICARDO_END_SEC],
        "differenceScores": scores,
        "boundaries": boundaries,
        "envelopeHopSec": 0.02,
        "envelopes": templates,
        "findSimilar": {
            "minSelectionSec": 4.2,
            "maxSelectionSec": 7.5,
            "correlationThreshold": 0.68,
            "expectedMatches": N_CYCLES,
        },
        "commonPattern": {
            "minNormalCycles": 5,
            "anomalyPenalty": True,
        },
        "difference": {
            "minQuality": 0.55,
            "ricardoClarityThreshold": 0.62,
            "requireAnomalyTarget": True,
            "requireCleanReference": True,
        },
        "recoveredSpeech": "Ricardo",
        "publicFinal": "public/assets/audio/forensic/puzzle08/p08_enceladus_final.wav",
        "publicUiName": "AUD_0008.wav",
    }
    (OUT / "puzzle08_timing.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    (PUBLIC / "capture_meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")

    # TS-friendly slim (without huge nothing — envelopes ok)
    ts_dir = ROOT / "src" / "forensic" / "puzzles"
    slim = {k: meta[k] for k in meta if k != "envelopes"}
    slim["envelopes"] = templates
    (ts_dir / "puzzle08Meta.json").write_text(json.dumps(slim), encoding="utf-8")

    if plt:
        fig, ax = plt.subplots(figsize=(12, 3))
        ax.plot(np.arange(len(master)) / SR, master, lw=0.4, color="0.3")
        for b in boundaries:
            ax.axvline(b["startSec"], color="cyan", lw=0.5, alpha=0.5)
        ax.axvspan(ANOMALY * CYCLE_SEC, (ANOMALY + 1) * CYCLE_SEC, color="orange", alpha=0.15)
        ax.set_title("ENCELADUS master · cycle 6 anomalous")
        ax.set_xlabel("Time (s)")
        fig.tight_layout()
        fig.savefig(DEBUG / "master_waveform.png", dpi=120)
        plt.close(fig)

        fig, ax = plt.subplots(figsize=(10, 4))
        for i, c in enumerate(cycles):
            ax.plot(np.arange(L) / SR, c[:L] + i * 0.35, lw=0.6, alpha=0.85)
        ax.set_title("Stacked cycles (offset)")
        fig.tight_layout()
        fig.savefig(DEBUG / "stack_overlay.png", dpi=120)
        plt.close(fig)

    print(
        json.dumps(
            {
                "durationSec": DURATION,
                "cycles": N_CYCLES,
                "anomaly": ANOMALY + 1,
                "scores": scores,
                "voice": str(VOICE),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()

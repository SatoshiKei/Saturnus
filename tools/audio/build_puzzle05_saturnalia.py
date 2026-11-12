#!/usr/bin/env python3
"""
Puzzle 05 — SATURNALIA
Divide a reportagem master em 10 slots de buffer circular.

Mapeamento cronológico → slot físico:
  seg 1→06, 2→07, 3→08, 4→09, 5→00, 6→01, 7→02, 8→03, 9→04, 10→05

Uso:
  python tools/audio/build_puzzle05_saturnalia.py
"""

from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path

import numpy as np

try:
    from pydub import AudioSegment
except ImportError:
    print("Dependência ausente: pydub\n  pip install pydub")
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[2]
SRC_DIR = ROOT / "src" / "assets" / "audios" / "p5"
OUT_DIR = ROOT / "tools" / "audio" / "out"
PUBLIC_DIR = ROOT / "public" / "assets" / "audio" / "forensic" / "puzzle05"
MASTER_PUBLIC = PUBLIC_DIR / "livia_maralto_master.mp3"

# Ordem cronológica dos slots (next-write = 06 ⇒ conteúdo mais antigo em 06)
CHRONO_TO_SLOT = [6, 7, 8, 9, 0, 1, 2, 3, 4, 5]
N_SLOTS = 10
SAMPLE_RATE = 44100
# Janela para evitar corte no meio da palavra (±250 ms)
SNAP_WINDOW_MS = 250


def find_master() -> Path:
    files = list(SRC_DIR.glob("*.mp3")) + list(SRC_DIR.glob("*.wav"))
    for f in files:
        name = f.name.lower()
        if "livia" in name or "maralto" in name or "repor" in name:
            return f
    raise FileNotFoundError(f"Master não encontrado em {SRC_DIR}")


def to_mono(seg: AudioSegment) -> AudioSegment:
    return seg.set_channels(1).set_frame_rate(SAMPLE_RATE)


def energy_envelope(seg: AudioSegment, hop_ms: int = 10) -> np.ndarray:
    samples = np.array(seg.get_array_of_samples(), dtype=np.float64)
    if seg.channels > 1:
        samples = samples.reshape((-1, seg.channels)).mean(axis=1)
    hop = max(1, int(SAMPLE_RATE * hop_ms / 1000))
    n = len(samples) - (len(samples) % hop)
    if n <= 0:
        return np.array([0.0])
    frames = samples[:n].reshape(-1, hop)
    return np.sqrt((frames * frames).mean(axis=1) + 1e-12)


def snap_cut_ms(seg: AudioSegment, target_ms: int, window_ms: int = SNAP_WINDOW_MS) -> int:
    """Aproxima o corte do alvo para o ponto de menor energia na janela."""
    if target_ms <= 0 or target_ms >= len(seg):
        return max(0, min(len(seg), target_ms))
    lo = max(0, target_ms - window_ms)
    hi = min(len(seg), target_ms + window_ms)
    window = seg[lo:hi]
    if len(window) < 20:
        return target_ms
    env = energy_envelope(window, hop_ms=5)
    hop_ms = 5
    idx = int(np.argmin(env))
    return lo + idx * hop_ms


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    master_path = find_master()
    master = to_mono(AudioSegment.from_file(master_path))
    total_ms = len(master)
    duration_sec = total_ms / 1000.0

    # Cópia preservada do master (não destrutiva sobre a fonte)
    shutil.copy2(master_path, MASTER_PUBLIC)
    master.export(OUT_DIR / "puzzle05_master.wav", format="wav")

    ideal = total_ms / N_SLOTS
    cuts = [0]
    for i in range(1, N_SLOTS):
        target = int(round(ideal * i))
        cuts.append(snap_cut_ms(master, target))
    cuts.append(total_ms)
    # Garantir monotonia
    for i in range(1, len(cuts)):
        if cuts[i] <= cuts[i - 1]:
            cuts[i] = min(total_ms, cuts[i - 1] + 1)

    # segmentos cronológicos 0..9
    chrono_segments: list[AudioSegment] = []
    chrono_meta: list[dict] = []
    for i in range(N_SLOTS):
        a, b = cuts[i], cuts[i + 1]
        piece = master[a:b]
        chrono_segments.append(piece)
        chrono_meta.append(
            {
                "chronoIndex": i + 1,
                "startMs": a,
                "endMs": b,
                "durationSec": round((b - a) / 1000.0, 3),
                "slot": CHRONO_TO_SLOT[i],
            }
        )

    slot_files: dict[str, str] = {}
    for meta, piece in zip(chrono_meta, chrono_segments):
        slot = meta["slot"]
        name = f"RC_SLOT_{slot:02d}"
        wav_out = OUT_DIR / f"{name}.wav"
        mp3_out = PUBLIC_DIR / f"{name}.mp3"
        piece.export(wav_out, format="wav")
        piece.export(mp3_out, format="mp3", bitrate="192k")
        slot_files[name] = str(mp3_out.relative_to(ROOT))

    # Duração por slot físico 00..09
    by_slot = {m["slot"]: m for m in chrono_meta}
    slot_durations = {
        f"RC_SLOT_{s:02d}": by_slot[s]["durationSec"] for s in range(N_SLOTS)
    }

    meta = {
        "master": str(master_path.relative_to(ROOT)),
        "masterPublic": str(MASTER_PUBLIC.relative_to(ROOT)),
        "durationSec": round(duration_sec, 3),
        "slotCount": N_SLOTS,
        "nextWriteSlot": 6,
        "physicalExportOrder": [f"RC_SLOT_{s:02d}" for s in range(N_SLOTS)],
        "chronologicalOrder": [f"RC_SLOT_{s:02d}" for s in CHRONO_TO_SLOT],
        "chronoToSlot": CHRONO_TO_SLOT,
        "chronoSegments": chrono_meta,
        "slotDurationsSec": slot_durations,
        "outputs": slot_files,
        "note": "Master never modified in place; PUBLIC copy + slot exports only.",
    }
    meta_path = OUT_DIR / "puzzle05_timing.json"
    meta_path.write_text(json.dumps(meta, indent=2), encoding="utf-8")
    print(json.dumps(meta, indent=2))


if __name__ == "__main__":
    main()

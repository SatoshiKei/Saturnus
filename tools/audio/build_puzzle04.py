#!/usr/bin/env python3
"""
Puzzle 04 — JANUS E EPIMETHEUS
Gera Fonte B (feed limpo da mesa) a partir da mesma música + DJ do Puzzle 03.
Fonte A reutiliza a captura de celular do Puzzle 03 (sem duplicar produção).

Uso:
  python tools/audio/build_puzzle04.py

Dependências:
  pip install numpy scipy pydub
  FFmpeg no PATH
"""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np

try:
    from pydub import AudioSegment
    from pydub.effects import compress_dynamic_range, high_pass_filter, low_pass_filter
except ImportError:
    print("Dependência ausente: pydub\n  pip install pydub")
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[2]
SRC_DIR = ROOT / "src" / "assets" / "audios" / "p3"
OUT_DIR = ROOT / "tools" / "audio" / "out"
PUBLIC_DIR = ROOT / "public" / "assets" / "audio" / "forensic" / "puzzle04"
P03_PUBLIC = ROOT / "public" / "assets" / "audio" / "forensic" / "puzzle03"
P03_PHONE = OUT_DIR / "puzzle03_phone_capture.wav"
P03_PUBLIC_WAV = P03_PUBLIC / "rec_vtx_old_01.wav"


def _find_asset(patterns: list[str]) -> Path:
    files = list(SRC_DIR.glob("*.mp3")) + list(SRC_DIR.glob("*.wav"))
    for pat in patterns:
        for f in files:
            if pat.lower() in f.name.lower():
                return f
    raise FileNotFoundError(f"Asset not found for {patterns} in {SRC_DIR}")


MUSIC_ASSET = _find_asset(["give-me-everything", "hardtekk", "dark-triad"])
DJ_ASSET = _find_asset(["dj -"])

DURATION = 180.0
DJ_START = 72.0
PRE_DJ_BPM = 126.0
POST_DJ_BPM = 128.0
NATIVE_BPM = 128.0
MUSIC_GAIN = -3.0
DJ_GAIN = -1.0
DUCK_AMOUNT = 0.38
DUCK_ATTACK = 0.1
DUCK_RELEASE = 0.45
SAMPLE_RATE = 44100
MUSIC_PRE_SRC_START = 28.0
MUSIC_POST_SRC_START = 95.0
EXPECTED_OFFSET_SEC = 450.0


def db_to_gain(db: float) -> float:
    return 10.0 ** (db / 20.0)


def apply_gain(seg: AudioSegment, db: float) -> AudioSegment:
    return seg + db


def ensure_mono(seg: AudioSegment) -> AudioSegment:
    return seg.set_channels(1).set_frame_rate(SAMPLE_RATE)


def ffmpeg_atempo(seg: AudioSegment, tempo: float) -> AudioSegment:
    if abs(tempo - 1.0) < 1e-4:
        return seg
    tmp_in = OUT_DIR / "_p04_in.wav"
    tmp_out = OUT_DIR / "_p04_out.wav"
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    seg.export(tmp_in, format="wav")
    factors: list[float] = []
    t = tempo
    while t < 0.5:
        factors.append(0.5)
        t /= 0.5
    while t > 2.0:
        factors.append(2.0)
        t /= 2.0
    factors.append(t)
    filt = ",".join(f"atempo={f:.8f}" for f in factors)
    cmd = ["ffmpeg", "-y", "-i", str(tmp_in), "-filter:a", filt, str(tmp_out)]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr)
        raise RuntimeError("ffmpeg atempo failed")
    out = AudioSegment.from_wav(tmp_out)
    tmp_in.unlink(missing_ok=True)
    tmp_out.unlink(missing_ok=True)
    return ensure_mono(out)


def duck_envelope(n: int, sr: int, dj_start: float, dj_dur: float) -> np.ndarray:
    t = np.arange(n) / sr
    env = np.ones(n, dtype=np.float64)
    end = dj_start + dj_dur
    for i, ti in enumerate(t):
        if ti < dj_start:
            continue
        if ti < dj_start + DUCK_ATTACK:
            a = (ti - dj_start) / max(1e-6, DUCK_ATTACK)
            env[i] = 1.0 - a * (1.0 - DUCK_AMOUNT)
        elif ti <= end:
            env[i] = DUCK_AMOUNT
        elif ti < end + DUCK_RELEASE:
            r = (ti - end) / max(1e-6, DUCK_RELEASE)
            env[i] = DUCK_AMOUNT + r * (1.0 - DUCK_AMOUNT)
    return env


def seg_to_float(seg: AudioSegment) -> np.ndarray:
    samples = np.array(seg.get_array_of_samples(), dtype=np.float64)
    if seg.channels > 1:
        samples = samples.reshape((-1, seg.channels)).mean(axis=1)
    peak = float(1 << (8 * seg.sample_width - 1))
    return samples / peak


def float_to_seg(x: np.ndarray, sr: int = SAMPLE_RATE) -> AudioSegment:
    x = np.clip(x, -1.0, 1.0)
    pcm = (x * 32767.0).astype(np.int16)
    return AudioSegment(pcm.tobytes(), frame_rate=sr, sample_width=2, channels=1)


def desk_color(seg: AudioSegment) -> AudioSegment:
    """Feed direto da mesa: limpo, pouca reverberação, sem crowd."""
    x = ensure_mono(seg)
    x = high_pass_filter(x, 40)
    x = low_pass_filter(x, 16000)
    x = compress_dynamic_range(x, threshold=-20.0, ratio=2.2, attack=6.0, release=90.0)
    arr = seg_to_float(x)
    # micro delay seco (cabo/mesa), sem sala
    delay = int(0.006 * SAMPLE_RATE)
    colored = arr.copy()
    colored[delay:] += 0.04 * arr[:-delay]
    peak = np.max(np.abs(colored)) + 1e-9
    if peak > 0.95:
        colored *= 0.95 / peak
    return float_to_seg(colored)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    for p in (MUSIC_ASSET, DJ_ASSET):
        if not p.exists():
            print(f"Asset ausente: {p}")
            sys.exit(1)

    music = ensure_mono(AudioSegment.from_file(MUSIC_ASSET))
    dj = ensure_mono(AudioSegment.from_file(DJ_ASSET))
    dj_dur = len(dj) / 1000.0
    dj_end = DJ_START + dj_dur
    pre_len = DJ_START
    post_start = dj_end - 2.5
    post_len = max(0.0, DURATION - post_start)

    stretch = PRE_DJ_BPM / NATIVE_BPM
    pre_src_needed = pre_len * stretch
    pre_native = music[
        int(MUSIC_PRE_SRC_START * 1000) : int((MUSIC_PRE_SRC_START + pre_src_needed + 2) * 1000)
    ]
    pre = ffmpeg_atempo(pre_native, stretch)[: int(pre_len * 1000)]
    post_native = music[
        int(MUSIC_POST_SRC_START * 1000) : int((MUSIC_POST_SRC_START + post_len + 4) * 1000)
    ]
    post = post_native[: int(post_len * 1000)]

    total_ms = int(DURATION * 1000)
    bed = AudioSegment.silent(duration=total_ms, frame_rate=SAMPLE_RATE).overlay(pre, position=0)
    mid_native_start = MUSIC_PRE_SRC_START + pre_src_needed
    mid = music[int(mid_native_start * 1000) : int((mid_native_start + dj_dur + 4) * 1000)]
    mid = ffmpeg_atempo(mid, stretch)[: int((dj_dur + 1) * 1000)]
    transition_ms = 3500
    mid_part = mid[: max(0, len(mid) - transition_ms)]
    if len(mid_part) > 0:
        bed = bed.overlay(mid_part, position=int(DJ_START * 1000))
    post_pad = AudioSegment.silent(duration=total_ms, frame_rate=SAMPLE_RATE).overlay(
        post, position=int(post_start * 1000)
    )
    bed_arr = seg_to_float(bed)
    post_arr = seg_to_float(post_pad)
    n = min(len(bed_arr), len(post_arr), int(DURATION * SAMPLE_RATE))
    bed_arr = bed_arr[:n]
    post_arr = post_arr[:n]
    t0 = int((dj_end - transition_ms / 1000.0) * SAMPLE_RATE)
    t1 = int(dj_end * SAMPLE_RATE)
    t0 = max(0, min(n - 1, t0))
    t1 = max(t0 + 1, min(n, t1))
    for i in range(t0, t1):
        a = (i - t0) / (t1 - t0)
        bed_arr[i] = (1 - a) * bed_arr[i] + a * post_arr[i]
    bed_arr[t1:] = post_arr[t1:]

    env = duck_envelope(n, SAMPLE_RATE, DJ_START, dj_dur)
    music_ducked = bed_arr * env * db_to_gain(MUSIC_GAIN)

    dj_proc = apply_gain(dj, DJ_GAIN)
    dj_proc = high_pass_filter(dj_proc, 120)
    dj_proc = low_pass_filter(dj_proc, 12000)
    dj_proc = compress_dynamic_range(dj_proc, threshold=-18.0, ratio=2.5, attack=4.0, release=50.0)
    dj_arr = np.zeros(n, dtype=np.float64)
    dj_samples = seg_to_float(dj_proc)
    start_i = int(DJ_START * SAMPLE_RATE)
    end_i = min(n, start_i + len(dj_samples))
    dj_arr[start_i:end_i] = dj_samples[: end_i - start_i]
    # eco mínimo de mesa (sem sala)
    delay = int(0.012 * SAMPLE_RATE)
    if end_i + delay < n:
        dj_arr[start_i + delay : end_i + delay] += 0.06 * dj_samples[: end_i - start_i]

    mix = music_ducked + dj_arr
    peak = np.max(np.abs(mix)) + 1e-9
    if peak > 0.95:
        mix *= 0.95 / peak

    desk = desk_color(float_to_seg(mix))

    phone_src = P03_PHONE if P03_PHONE.exists() else P03_PUBLIC_WAV
    if not phone_src.exists():
        print(
            "Fonte A ausente: rode tools/audio/build_puzzle03.py antes "
            f"(esperado {P03_PHONE} ou {P03_PUBLIC_WAV})"
        )
        sys.exit(1)

    phone_out = OUT_DIR / "puzzle04_phone_source.wav"
    desk_out = OUT_DIR / "puzzle04_desk_source.wav"
    public_phone = PUBLIC_DIR / "puzzle04_phone_source.wav"
    public_desk = PUBLIC_DIR / "puzzle04_desk_source.wav"
    public_desk_mp3 = PUBLIC_DIR / "puzzle04_desk_source.mp3"
    meta_path = OUT_DIR / "puzzle04_timing.json"

    shutil.copy2(phone_src, phone_out)
    desk.export(desk_out, format="wav")
    shutil.copy2(phone_out, public_phone)
    desk.export(public_desk, format="wav")
    desk.export(public_desk_mp3, format="mp3", bitrate="192k")

    meta = {
        "durationSec": round(DURATION, 3),
        "djStartSec": round(DJ_START, 3),
        "djEndSec": round(dj_end, 3),
        "djDurationSec": round(dj_dur, 3),
        "expectedOffsetSec": EXPECTED_OFFSET_SEC,
        "inUniverseMusicLabel": "Mechanical Groove",
        "syncEvent": "DJ voice + 126→128 transition",
        "sourceA": {
            "role": "phone ambient",
            "clock": "external messaging / real",
            "fileStartReal": "01:22:18",
            "djEventReal": "01:23:30",
            "externalStamp": "WA_MEDIA_RX 01:25:18 ↔ file end",
            "timelineOriginSec": EXPECTED_OFFSET_SEC,
        },
        "sourceB": {
            "role": "desk feed",
            "clock": "Vertice local",
            "fileStartVertice": "01:14:48",
            "djEventVertice": "01:16:00",
            "timelineOriginSec": 0.0,
        },
        "setLog": {
            "levelsTransitionVertice": "01:16:00",
            "correctedReal": "01:23:30",
        },
        "assets": {
            "music": str(MUSIC_ASSET.relative_to(ROOT)),
            "dj": str(DJ_ASSET.relative_to(ROOT)),
            "phoneReusedFrom": str(phone_src.relative_to(ROOT)),
        },
        "outputs": {
            "phone": str(phone_out.relative_to(ROOT)),
            "desk": str(desk_out.relative_to(ROOT)),
            "publicPhone": str(public_phone.relative_to(ROOT)),
            "publicDesk": str(public_desk.relative_to(ROOT)),
            "publicDeskMp3": str(public_desk_mp3.relative_to(ROOT)),
        },
    }
    meta_path.write_text(json.dumps(meta, indent=2), encoding="utf-8")
    print(json.dumps(meta, indent=2))


if __name__ == "__main__":
    main()

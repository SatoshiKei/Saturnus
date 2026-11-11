#!/usr/bin/env python3
"""
Puzzle 03 — ANÉIS
Monta gravação de balada (celular) a partir de música + DJ + crowd.

Uso:
  python tools/audio/build_puzzle03.py

Dependências:
  pip install numpy scipy pydub
  FFmpeg no PATH
"""

from __future__ import annotations

import json
import math
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

# ---------------------------------------------------------------------------
# Paths / assets
# ---------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parents[2]
SRC_DIR = ROOT / "src" / "assets" / "audios" / "p3"
OUT_DIR = ROOT / "tools" / "audio" / "out"
PUBLIC_DIR = ROOT / "public" / "assets" / "audio" / "forensic" / "puzzle03"

def _find_asset(patterns: list[str]) -> Path:
    """Resolve asset by substring (handles accented filenames on Windows)."""
    files = list(SRC_DIR.glob("*.mp3")) + list(SRC_DIR.glob("*.wav"))
    for pat in patterns:
        for f in files:
            if pat.lower() in f.name.lower():
                return f
    raise FileNotFoundError(f"Asset not found for {patterns} in {SRC_DIR}")


MUSIC_ASSET = _find_asset(["give-me-everything", "hardtekk", "dark-triad"])
DJ_ASSET = _find_asset(["dj -"])
CROWD_ASSET = _find_asset(["club-crowd", "crowd"])

# ---------------------------------------------------------------------------
# Configurável
# ---------------------------------------------------------------------------
DURATION = 180.0  # 3:00
DJ_START = 72.0

PRE_DJ_BPM = 126.0
POST_DJ_BPM = 128.0
# Faixa base ~128 BPM; pré = time-stretch para 126.
NATIVE_BPM = 128.0

MUSIC_GAIN = -4.0  # dB overlay adjustment before phone chain
DJ_GAIN = -2.0
CROWD_GAIN = -18.0

DUCK_AMOUNT = 0.42  # linear residual gain during DJ (grave/music)
DUCK_ATTACK = 0.12
DUCK_RELEASE = 0.55

RANDOM_SEED = 2031103
SAMPLE_RATE = 44100

# Trechos da música (segundos no asset nativo ~128 BPM)
MUSIC_PRE_SRC_START = 28.0
MUSIC_POST_SRC_START = 95.0


def db_to_gain(db: float) -> float:
    return 10.0 ** (db / 20.0)


def apply_gain(seg: AudioSegment, db: float) -> AudioSegment:
    return seg + db


def ensure_mono(seg: AudioSegment) -> AudioSegment:
    return seg.set_channels(1).set_frame_rate(SAMPLE_RATE)


def ffmpeg_atempo(seg: AudioSegment, tempo: float) -> AudioSegment:
    """Time-stretch preserving pitch via FFmpeg atempo."""
    if abs(tempo - 1.0) < 1e-4:
        return seg
    tmp_in = OUT_DIR / "_p03_in.wav"
    tmp_out = OUT_DIR / "_p03_out.wav"
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    seg.export(tmp_in, format="wav")
    # atempo range 0.5–2.0; chain if needed
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
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(tmp_in),
        "-filter:a",
        filt,
        str(tmp_out),
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr)
        raise RuntimeError("ffmpeg atempo failed")
    out = AudioSegment.from_wav(tmp_out)
    tmp_in.unlink(missing_ok=True)
    tmp_out.unlink(missing_ok=True)
    return ensure_mono(out)


def loop_to_length(seg: AudioSegment, length_ms: int, rng: np.random.Generator) -> AudioSegment:
    if len(seg) <= 0:
        return AudioSegment.silent(duration=length_ms, frame_rate=SAMPLE_RATE)
    chunks: list[AudioSegment] = []
    remaining = length_ms
    while remaining > 0:
        offset = int(rng.integers(0, max(1, len(seg) // 4)))
        piece = seg[offset:]
        if len(piece) < 800:
            piece = seg
        take = min(len(piece), remaining)
        chunk = piece[:take]
        # tiny gain jitter
        chunk = chunk + float(rng.uniform(-1.2, 1.2))
        chunks.append(chunk)
        remaining -= take
        # crossfade between loops
        if remaining > 0 and chunks:
            fade = min(180, take // 4)
            chunks[-1] = chunks[-1].fade_out(fade)
    out = chunks[0]
    for c in chunks[1:]:
        out = out.append(c.fade_in(120), crossfade=120)
    return out[:length_ms]


def duck_envelope(n: int, sr: int, dj_start: float, dj_dur: float) -> np.ndarray:
    t = np.arange(n) / sr
    env = np.ones(n, dtype=np.float64)
    attack = DUCK_ATTACK
    release = DUCK_RELEASE
    end = dj_start + dj_dur
    for i, ti in enumerate(t):
        if ti < dj_start:
            continue
        if ti < dj_start + attack:
            a = (ti - dj_start) / max(1e-6, attack)
            env[i] = 1.0 - a * (1.0 - DUCK_AMOUNT)
        elif ti <= end:
            env[i] = DUCK_AMOUNT
        elif ti < end + release:
            r = (ti - end) / max(1e-6, release)
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
    return AudioSegment(
        pcm.tobytes(),
        frame_rate=sr,
        sample_width=2,
        channels=1,
    )


def phone_color(seg: AudioSegment) -> AudioSegment:
    """Moderada coloração de celular — beat permanece mensurável."""
    x = ensure_mono(seg)
    x = high_pass_filter(x, 90)
    x = low_pass_filter(x, 7800)
    x = compress_dynamic_range(x, threshold=-18.0, ratio=3.5, attack=8.0, release=80.0)
    # Soft saturate
    arr = seg_to_float(x)
    arr = np.tanh(arr * 1.35) * 0.92
    # Mild room coloration: short comb
    delay = int(0.018 * SAMPLE_RATE)
    colored = arr.copy()
    colored[delay:] += 0.12 * arr[:-delay]
    peak = np.max(np.abs(colored)) + 1e-9
    if peak > 0.98:
        colored *= 0.98 / peak
    out = float_to_seg(colored)
    return out


def measure_bpm_proxy(seg: AudioSegment, expect: float) -> float:
    """Proxy simples: correlaciona envelope com grade de BPM esperado ±1.5."""
    arr = np.abs(seg_to_float(seg))
    # downsample envelope
    win = max(1, SAMPLE_RATE // 100)
    env = arr[: len(arr) - (len(arr) % win)].reshape(-1, win).mean(axis=1)
    env = env - env.mean()
    best_bpm = expect
    best_score = -1e9
    for bpm in np.linspace(expect - 1.5, expect + 1.5, 61):
        period = 60.0 / bpm
        step = period * 100  # env at 100 Hz
        phase_scores = []
        for ph in np.linspace(0, step, 8, endpoint=False):
            idx = (np.arange(len(env)) + ph) % step
            # prefer peaks near beat
            w = np.cos(2 * math.pi * idx / step)
            phase_scores.append(float(np.dot(env, w)))
        score = max(phase_scores)
        if score > best_score:
            best_score = score
            best_bpm = float(bpm)
    return round(best_bpm, 2)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(RANDOM_SEED)

    for p in (MUSIC_ASSET, DJ_ASSET, CROWD_ASSET):
        if not p.exists():
            print(f"Asset ausente: {p}")
            sys.exit(1)

    music = ensure_mono(AudioSegment.from_file(MUSIC_ASSET))
    dj = ensure_mono(AudioSegment.from_file(DJ_ASSET))
    crowd = ensure_mono(AudioSegment.from_file(CROWD_ASSET))

    dj_dur = len(dj) / 1000.0
    dj_end = DJ_START + dj_dur
    pre_len = DJ_START
    post_start = dj_end - 2.5  # overlap/crossfade into post during late DJ
    post_len = max(0.0, DURATION - post_start)

    # Pré: trecho nativo → stretch 128→126
    stretch = PRE_DJ_BPM / NATIVE_BPM  # < 1 → slower → longer
    pre_src_needed = pre_len * stretch  # seconds of native to yield pre_len after stretch
    pre_native = music[
        int(MUSIC_PRE_SRC_START * 1000) : int((MUSIC_PRE_SRC_START + pre_src_needed + 2) * 1000)
    ]
    pre_stretched = ffmpeg_atempo(pre_native, stretch)
    pre = pre_stretched[: int(pre_len * 1000)]

    # Pós: nativo ~128
    post_native = music[
        int(MUSIC_POST_SRC_START * 1000) : int((MUSIC_POST_SRC_START + post_len + 4) * 1000)
    ]
    # slight atempo to lock near 128 if needed (identity)
    post = post_native[: int(post_len * 1000)]

    # Build music bed with crossfade through DJ window
    total_ms = int(DURATION * 1000)
    bed = AudioSegment.silent(duration=total_ms, frame_rate=SAMPLE_RATE)
    bed = bed.overlay(pre, position=0)
    # During DJ: continue music (ducked later in float domain)
    mid_native_start = MUSIC_PRE_SRC_START + pre_src_needed
    mid = music[int(mid_native_start * 1000) : int((mid_native_start + dj_dur + 4) * 1000)]
    mid = ffmpeg_atempo(mid, stretch)[: int((dj_dur + 1) * 1000)]
    # Blend mid into 128 near end of DJ
    transition_ms = 3500
    mid_part = mid[: max(0, len(mid) - transition_ms)]
    if len(mid_part) > 0:
        bed = bed.overlay(mid_part, position=int(DJ_START * 1000))
    # Crossfade mid→post
    xf_pos = int((dj_end - transition_ms / 1000.0) * 1000)
    xf_pos = max(0, xf_pos)
    post_pad = AudioSegment.silent(duration=total_ms, frame_rate=SAMPLE_RATE).overlay(
        post, position=int(post_start * 1000)
    )
    # Manual crossfade region
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

    # Duck music under DJ
    env = duck_envelope(n, SAMPLE_RATE, DJ_START, dj_dur)
    music_ducked = bed_arr * env * db_to_gain(MUSIC_GAIN)

    # DJ on PA-ish
    dj_proc = apply_gain(dj, DJ_GAIN)
    dj_proc = high_pass_filter(dj_proc, 180)
    dj_proc = low_pass_filter(dj_proc, 5500)
    dj_proc = compress_dynamic_range(dj_proc, threshold=-16.0, ratio=4.0, attack=5.0, release=60.0)
    dj_arr = np.zeros(n, dtype=np.float64)
    dj_samples = seg_to_float(dj_proc)
    start_i = int(DJ_START * SAMPLE_RATE)
    end_i = min(n, start_i + len(dj_samples))
    dj_arr[start_i:end_i] = dj_samples[: end_i - start_i]
    # short reverb tail
    delay = int(0.045 * SAMPLE_RATE)
    if end_i + delay < n:
        dj_arr[start_i + delay : end_i + delay] += 0.18 * dj_samples[: end_i - start_i]

    # Crowd
    crowd_loop = loop_to_length(crowd, total_ms, rng)
    crowd_arr = seg_to_float(apply_gain(crowd_loop, CROWD_GAIN))
    if len(crowd_arr) < n:
        crowd_arr = np.pad(crowd_arr, (0, n - len(crowd_arr)))
    crowd_arr = crowd_arr[:n]
    # bump slightly during DJ
    for i in range(start_i, min(n, end_i + int(1.5 * SAMPLE_RATE))):
        crowd_arr[i] *= 1.25

    if len(music_ducked) < n:
        music_ducked = np.pad(music_ducked, (0, n - len(music_ducked)))
    music_ducked = music_ducked[:n]
    if len(dj_arr) < n:
        dj_arr = np.pad(dj_arr, (0, n - len(dj_arr)))
    dj_arr = dj_arr[:n]

    mix = music_ducked + dj_arr + crowd_arr
    peak = np.max(np.abs(mix)) + 1e-9
    if peak > 0.95:
        mix *= 0.95 / peak

    reference = float_to_seg(mix)
    phone = phone_color(reference)

    # Measure tempos on clean-ish regions
    pre_region = phone[int(8 * 1000) : int((DJ_START - 4) * 1000)]
    post_region = phone[int((dj_end + 6) * 1000) : int((dj_end + 40) * 1000)]
    actual_pre = measure_bpm_proxy(pre_region, PRE_DJ_BPM)
    actual_post = measure_bpm_proxy(post_region, POST_DJ_BPM)

    ref_path = OUT_DIR / "puzzle03_reference_mix.wav"
    phone_path = OUT_DIR / "puzzle03_phone_capture.wav"
    final_mp3 = OUT_DIR / "puzzle03_final.mp3"
    public_mp3 = PUBLIC_DIR / "rec_vtx_old_01_final.mp3"
    public_wav = PUBLIC_DIR / "rec_vtx_old_01.wav"
    meta_path = OUT_DIR / "puzzle03_timing.json"

    reference.export(ref_path, format="wav")
    phone.export(phone_path, format="wav")
    phone.export(final_mp3, format="mp3", bitrate="192k")
    phone.export(public_wav, format="wav")
    phone.export(public_mp3, format="mp3", bitrate="192k")

    meta = {
        "durationSec": round(DURATION, 3),
        "djStartSec": round(DJ_START, 3),
        "djEndSec": round(dj_end, 3),
        "djDurationSec": round(dj_dur, 3),
        "targetPreBpm": PRE_DJ_BPM,
        "targetPostBpm": POST_DJ_BPM,
        "actualPreTempo": actual_pre,
        "actualPostTempo": actual_post,
        "duckAmount": DUCK_AMOUNT,
        "assets": {
            "music": str(MUSIC_ASSET.relative_to(ROOT)),
            "dj": str(DJ_ASSET.relative_to(ROOT)),
            "crowd": str(CROWD_ASSET.relative_to(ROOT)),
        },
        "outputs": {
            "reference": str(ref_path.relative_to(ROOT)),
            "phoneCapture": str(phone_path.relative_to(ROOT)),
            "finalMp3": str(final_mp3.relative_to(ROOT)),
            "publicMp3": str(public_mp3.relative_to(ROOT)),
            "publicWav": str(public_wav.relative_to(ROOT)),
        },
    }
    meta_path.write_text(json.dumps(meta, indent=2), encoding="utf-8")
    print(json.dumps(meta, indent=2))


if __name__ == "__main__":
    main()

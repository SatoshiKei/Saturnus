#!/usr/bin/env python3
"""
Puzzle 01 — Divisão de Cassini
Gera a gravação degradada (~44 s) a partir dos cinco MP3 de Mariana.

Uso:
  python tools/audio/build_puzzle01.py

Dependências:
  pip install numpy scipy pydub
  FFmpeg no PATH (leitura/exportação MP3)
"""

from __future__ import annotations

import hashlib
import os
import sys
import wave
from pathlib import Path

import numpy as np

try:
    from scipy import signal
except ImportError:
    print("Dependência ausente: scipy\n  pip install scipy")
    sys.exit(1)

try:
    from pydub import AudioSegment
except ImportError:
    print("Dependência ausente: pydub\n  pip install pydub")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parents[2]
SRC_DIR = ROOT / "src" / "assets" / "audios" / "p1"
OUT_DIR = ROOT / "tools" / "audio" / "out"

# Correspondência determinada pelos nomes dos arquivos (apenas o clip de medo
# usa o arquivo `eu sentia medo` — único MP3 restante e o único sobre medo;
# o conteúdo afirmado pelo projeto é a frase `eu estava com medo`).
CLIPS: dict[str, Path] = {
    "escute isso até o fim": SRC_DIR / "mariana escute isso ate o fim.mp3",
    "desde aquela noite": SRC_DIR / "mariana - desde aquela noite.mp3",
    # Único MP3 de medo; nome no disco = "sentia", frase canônica = "eu estava com medo".
    "eu estava com medo": SRC_DIR / "mariana - eu sentia medo.mp3",
    "eu estava confusa": SRC_DIR / "mariana - eu estava confusa.mp3",
    "eu não lembro": SRC_DIR / "mariana - eu nao lembro.mp3",
}

# ---------------------------------------------------------------------------
# Parâmetros calibráveis
# ---------------------------------------------------------------------------
DURATION_SECONDS = 44.0
RANDOM_SEED = 481526

# Timestamps nominais (podem ser empurrados se a fala anterior encostar)
CLIP_STARTS: dict[str, float] = {
    "escute isso até o fim": 4.0,
    "desde aquela noite": 12.5,
    "eu estava com medo": 22.0,
    "eu estava confusa": 29.5,
    "eu não lembro": 38.5,
}

# Voz mais baixa nos trechos difíceis; o compressor telefônico não deve “abrir” tudo.
CLIP_TARGET_DBFS: dict[str, float] = {
    "escute isso até o fim": -34.0,
    "desde aquela noite": -37.0,
    "eu estava com medo": -26.0,
    "eu estava confusa": -30.0,
    # Raw: presença de voz, frase NÃO claramente entendida (degradação leve vs resto fácil).
    "eu não lembro": -28.0,
}

# Nível absoluto da senoide 1700 Hz durante o clip (None = só cama global).
# Precisa competir/superar a voz nos trechos difíceis para o notch importar.
CLIP_LOCAL_TONE_DBFS: dict[str, float | None] = {
    "escute isso até o fim": -20.0,
    "desde aquela noite": -18.0,
    "eu estava com medo": -30.0,
    "eu estava confusa": -22.0,
    "eu não lembro": -19.0,
}

# Noise band-limited contínuo sob o clip inteiro (mascaramento de fundo local).
CLIP_UNDERLAY_NOISE_DBFS: dict[str, float | None] = {
    "escute isso até o fim": -24.0,
    "desde aquela noite": -22.0,
    "eu estava com medo": -32.0,
    "eu estava confusa": -27.0,
    "eu não lembro": -23.0,
}

# Bursts locais: (start_frac, end_frac, dBFS) — mais altos que a voz nos difíceis.
CLIP_LOCAL_BURSTS: dict[str, list[tuple[float, float, float]]] = {
    "escute isso até o fim": [
        (0.00, 0.18, -16.0),
        (0.30, 0.48, -17.0),
        (0.55, 0.72, -16.5),
        (0.80, 0.98, -17.5),
    ],
    "desde aquela noite": [
        (0.00, 0.22, -14.0),
        (0.25, 0.48, -15.0),
        (0.50, 0.72, -14.5),
        (0.75, 0.98, -15.5),
    ],
    "eu estava com medo": [
        (0.25, 0.55, -22.0),
    ],
    "eu estava confusa": [
        (0.20, 0.42, -18.0),
        (0.55, 0.80, -19.0),
    ],
    "eu não lembro": [
        (0.00, 0.22, -16.0),
        (0.28, 0.52, -17.0),
        (0.58, 0.82, -16.5),
        (0.85, 0.98, -17.5),
    ],
}

# Dropouts curtos nas bordas / sílabas (frações).
CLIP_EDGE_DROPOUTS: dict[str, list[tuple[float, float]]] = {
    "escute isso até o fim": [(0.00, 0.06), (0.40, 0.46), (0.94, 1.00)],
    "desde aquela noite": [(0.00, 0.08), (0.35, 0.42), (0.60, 0.68), (0.92, 1.00)],
    "eu estava com medo": [(0.00, 0.04), (0.96, 1.00)],
    "eu estava confusa": [(0.00, 0.05), (0.48, 0.54), (0.95, 1.00)],
    "eu não lembro": [(0.00, 0.08), (0.40, 0.48), (0.92, 1.00)],
}

WHITE_NOISE_DBFS = -32.0
PINK_NOISE_DBFS = -38.0
TONE_FREQ = 1700.0
TONE_DBFS = -35.0
HUM_60_DBFS = -48.0
HUM_120_DBFS = -54.0

BURST_REGIONS = [
    (1.1, 1.6),
    (7.8, 8.6),
    (16.0, 17.2),
    (19.0, 19.5),
    (26.3, 27.0),
    (33.8, 34.6),
    (41.6, 42.5),
]
BURST_DBFS_RANGE = (-27.0, -24.0)

N_CLICKS = 14
CLICK_MS_RANGE = (3, 15)
N_DROPOUTS = 8
DROPOUT_MS_RANGE = (50, 180)

N_JUNK_FRAGMENTS = 48
JUNK_MS_RANGE = (40, 120)
# Lixo vocal nas bordas; nos clips difíceis também no miolo (sem formar palavra).
JUNK_ON_SPEECH_EDGE = True
JUNK_SPEECH_EDGE_FRAC = 0.18
JUNK_ON_HARD_CLIP_MID = True
JUNK_HARD_PHRASES = (
    "escute isso até o fim",
    "desde aquela noite",
    "eu estava confusa",
    "eu não lembro",
)

PHONE_LOW_HZ = 300.0
PHONE_HIGH_HZ = 3400.0
OUTPUT_SAMPLE_RATE = 16_000
WORK_SAMPLE_RATE = 44_100  # mix interna antes do downsample telefônico

# Compressor mais suave — evita “abrir” falas baixas e anular o mascaramento.
COMP_THRESHOLD_DB = -18.0
COMP_RATIO = 2.0
COMP_ATTACK_MS = 10.0
COMP_RELEASE_MS = 120.0
SOFT_CLIP_DRIVE = 1.12
FINAL_PEAK_DBFS = -1.0

EPS = 1e-12


# ---------------------------------------------------------------------------
# Utilidades de nível
# ---------------------------------------------------------------------------
def dbfs(x: np.ndarray) -> float:
    rms = np.sqrt(np.mean(np.square(x.astype(np.float64))) + EPS)
    return float(20.0 * np.log10(rms + EPS))


def peak_dbfs(x: np.ndarray) -> float:
    p = float(np.max(np.abs(x)) + EPS)
    return float(20.0 * np.log10(p))


def scale_to_dbfs(x: np.ndarray, target_db: float) -> np.ndarray:
    cur = dbfs(x)
    gain = 10.0 ** ((target_db - cur) / 20.0)
    return (x * gain).astype(np.float64)


def file_sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 16), b""):
            h.update(chunk)
    return h.hexdigest()


# ---------------------------------------------------------------------------
# I/O
# ---------------------------------------------------------------------------
def load_mono(path: Path, sr: int) -> np.ndarray:
    seg = AudioSegment.from_file(path)
    seg = seg.set_channels(1).set_frame_rate(sr).set_sample_width(2)
    samples = np.array(seg.get_array_of_samples(), dtype=np.float64) / 32768.0
    return samples


def write_wav_pcm16(path: Path, x: np.ndarray, sr: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    clipped = np.clip(x, -1.0, 1.0)
    pcm = (clipped * 32767.0).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())


def write_mp3(path: Path, x: np.ndarray, sr: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    clipped = np.clip(x, -1.0, 1.0)
    pcm = (clipped * 32767.0).astype(np.int16)
    seg = AudioSegment(
        pcm.tobytes(),
        frame_rate=sr,
        sample_width=2,
        channels=1,
    )
    seg.export(str(path), format="mp3", bitrate="128k")


# ---------------------------------------------------------------------------
# Ruído / tons
# ---------------------------------------------------------------------------
def white_noise(n: int, rng: np.random.Generator) -> np.ndarray:
    return rng.standard_normal(n).astype(np.float64)


def pinkish_noise(n: int, rng: np.random.Generator, sr: int) -> np.ndarray:
    """Ruído branco filtrado em passa-baixa (aproximação pink-ish / LF)."""
    x = rng.standard_normal(n).astype(np.float64)
    # Butterworth low-pass ~800 Hz
    sos = signal.butter(2, 800.0, btype="low", fs=sr, output="sos")
    y = signal.sosfilt(sos, x)
    return y


def sine(n: int, freq: float, sr: int) -> np.ndarray:
    t = np.arange(n, dtype=np.float64) / sr
    return np.sin(2.0 * np.pi * freq * t)


# ---------------------------------------------------------------------------
# Processamento
# ---------------------------------------------------------------------------
def soft_clip(x: np.ndarray, drive: float = 1.15) -> np.ndarray:
    return np.tanh(x * drive) / np.tanh(drive)


def compress(
    x: np.ndarray,
    sr: int,
    threshold_db: float,
    ratio: float,
    attack_ms: float,
    release_ms: float,
) -> np.ndarray:
    """Compressor envelope-follower (loop NumPy em blocos curtos — determinístico)."""
    thr = 10.0 ** (threshold_db / 20.0)
    atk = np.exp(-1.0 / max(sr * attack_ms / 1000.0, 1.0))
    rel = np.exp(-1.0 / max(sr * release_ms / 1000.0, 1.0))
    abs_x = np.abs(x)
    env = np.empty_like(abs_x)
    e = 0.0
    # Ainda sequencial no envelope (causal), mas sem boxing Python por amostra via list.
    for i in range(len(abs_x)):
        a = abs_x[i]
        coeff = atk if a > e else rel
        e = coeff * e + (1.0 - coeff) * a
        env[i] = e
    over = np.maximum(env / thr, 1.0)
    gain = over ** (-(1.0 - 1.0 / ratio))
    gain = np.where(env > thr, gain, 1.0)
    return x * gain


def phone_bandpass(x: np.ndarray, sr: int, low: float, high: float) -> np.ndarray:
    # Butterworth ordem 4 — inclinação razoável, sem brick-wall
    sos = signal.butter(4, [low, high], btype="band", fs=sr, output="sos")
    return signal.sosfiltfilt(sos, x)


def resample_mono(x: np.ndarray, sr_in: int, sr_out: int) -> np.ndarray:
    if sr_in == sr_out:
        return x.astype(np.float64)
    n_out = int(round(len(x) * sr_out / sr_in))
    return signal.resample(x, n_out).astype(np.float64)


def overlay(dst: np.ndarray, src: np.ndarray, start: int) -> None:
    if start >= len(dst) or start + len(src) <= 0:
        return
    a = max(0, start)
    b = min(len(dst), start + len(src))
    sa = a - start
    sb = sa + (b - a)
    dst[a:b] += src[sa:sb]


def protected_mask(n: int, regions: list[tuple[float, float]], sr: int, pad_s: float = 0.05) -> np.ndarray:
    """True onde NÃO se deve aplicar dropout (falas protegidas)."""
    m = np.zeros(n, dtype=bool)
    for t0, t1 in regions:
        a = max(0, int((t0 - pad_s) * sr))
        b = min(n, int((t1 + pad_s) * sr))
        m[a:b] = True
    return m


# ---------------------------------------------------------------------------
# Pipeline
# ---------------------------------------------------------------------------
def resolve_starts(durations: dict[str, float]) -> dict[str, float]:
    order = list(CLIP_STARTS.keys())
    starts = {k: float(CLIP_STARTS[k]) for k in order}
    for i in range(len(order) - 1):
        cur = order[i]
        nxt = order[i + 1]
        end = starts[cur] + durations[cur]
        gap = 0.15
        if end + gap > starts[nxt]:
            new_start = end + gap
            print(
                f"  ! ajuste de timeline: '{nxt}' "
                f"{starts[nxt]:.2f}s → {new_start:.2f}s "
                f"(fala anterior termina em {end:.2f}s)"
            )
            starts[nxt] = new_start
    # Garantir que o último cabe em DURATION
    last = order[-1]
    if starts[last] + durations[last] > DURATION_SECONDS - 0.05:
        overflow = starts[last] + durations[last] - (DURATION_SECONDS - 0.05)
        print(f"  ! aviso: último clip ultrapassa duração em {overflow:.2f}s (mantido)")
    return starts


def make_junk_pool(clips: dict[str, np.ndarray], rng: np.random.Generator, sr: int) -> list[np.ndarray]:
    pool: list[np.ndarray] = []
    for arr in clips.values():
        if len(arr) < int(0.05 * sr):
            continue
        # Preferir zonas de energia média (transientes / consoantes), evitar silêncio
        win = max(1, int(0.02 * sr))
        energy = np.convolve(arr * arr, np.ones(win) / win, mode="same")
        thr = np.percentile(energy, 40)
        candidates = np.where(energy > thr)[0]
        if len(candidates) < 10:
            candidates = np.arange(len(arr))
        for _ in range(8):
            ms = float(rng.uniform(*JUNK_MS_RANGE))
            length = max(1, int(ms * sr / 1000.0))
            if length >= len(arr):
                continue
            center = int(rng.choice(candidates))
            start = max(0, min(center - length // 2, len(arr) - length))
            frag = arr[start : start + length].copy()
            if rng.random() < 0.45:
                frag = frag[::-1]
            if rng.random() < 0.55:
                # pitch mínimo só no lixo: resample leve ±4%
                factor = float(rng.uniform(0.96, 1.04))
                new_len = max(1, int(len(frag) / factor))
                frag = signal.resample(frag, new_len)
            # nível baixo de lixo
            frag = scale_to_dbfs(frag, float(rng.uniform(-34.0, -28.0)))
            pool.append(frag.astype(np.float64))
    return pool


def clamp_burst_ms(start_frac: float, end_frac: float, dur_s: float) -> tuple[float, float]:
    """Garante bursts locais entre ~80–350 ms sem cobrir a fala inteira."""
    span = max(0.0, end_frac - start_frac)
    ms = span * dur_s * 1000.0
    if ms < 80.0 and dur_s > 0.1:
        need = 80.0 / (dur_s * 1000.0)
        mid = 0.5 * (start_frac + end_frac)
        start_frac = max(0.0, mid - need / 2)
        end_frac = min(1.0, mid + need / 2)
    if ms > 350.0 and dur_s > 0.1:
        need = 350.0 / (dur_s * 1000.0)
        mid = 0.5 * (start_frac + end_frac)
        start_frac = max(0.0, mid - need / 2)
        end_frac = min(1.0, mid + need / 2)
    # Nunca cobrir > 55% de um clip isoladamente via um único burst
    if end_frac - start_frac > 0.55:
        mid = 0.5 * (start_frac + end_frac)
        start_frac = mid - 0.275
        end_frac = mid + 0.275
    return start_frac, end_frac


def bandlimited_noise(n: int, rng: np.random.Generator, sr: int) -> np.ndarray:
    """Noise broadband com leve ênfase na banda da fala (mascara sem ser silêncio)."""
    x = rng.standard_normal(n).astype(np.float64)
    sos = signal.butter(2, [400.0, 3200.0], btype="band", fs=sr, output="sos")
    return signal.sosfilt(sos, x)


def apply_local_speech_masking(
    mix: np.ndarray,
    debug: np.ndarray,
    starts: dict[str, float],
    durations: dict[str, float],
    sr: int,
    rng: np.random.Generator,
) -> dict[str, dict]:
    """Bursts + tom local + dropouts de borda sobre as falas. Retorna stats por frase."""
    stats: dict[str, dict] = {}
    for phrase in CLIP_STARTS:
        t0 = starts[phrase]
        dur = durations[phrase]
        n_clip = max(1, int(dur * sr))
        abs_start = int(t0 * sr)
        masked_samples = 0
        bursts_done = 0

        # Underlay contínuo sob o clip (compete com a voz sem apagar o clip inteiro)
        under_db = CLIP_UNDERLAY_NOISE_DBFS.get(phrase)
        if under_db is not None:
            under = scale_to_dbfs(bandlimited_noise(n_clip, rng, sr), under_db)
            fade = min(int(0.03 * sr), n_clip // 6)
            if fade > 0:
                under[:fade] *= np.linspace(0, 1, fade)
                under[-fade:] *= np.linspace(1, 0, fade)
            overlay(mix, under, abs_start)
            overlay(debug, under, abs_start)
            masked_samples += n_clip // 2  # underlay conta como mascaramento parcial

        # Interferência tonal local (nível absoluto)
        local_tone = CLIP_LOCAL_TONE_DBFS.get(phrase)
        if local_tone is not None:
            tone = scale_to_dbfs(sine(n_clip, TONE_FREQ, sr), local_tone)
            fade = min(int(0.04 * sr), n_clip // 5)
            if fade > 0:
                tone[:fade] *= np.linspace(0, 1, fade)
                tone[-fade:] *= np.linspace(1, 0, fade)
            overlay(mix, tone, abs_start)
            overlay(debug, tone, abs_start)

        for a_frac, b_frac, level in CLIP_LOCAL_BURSTS.get(phrase, []):
            a_frac, b_frac = clamp_burst_ms(a_frac, b_frac, dur)
            a = int(a_frac * n_clip)
            b = int(b_frac * n_clip)
            if b <= a:
                continue
            level_j = level + float(rng.uniform(-0.6, 0.6))
            burst = scale_to_dbfs(bandlimited_noise(b - a, rng, sr), level_j)
            fade = min(int(0.012 * sr), (b - a) // 4)
            if fade > 0:
                burst[:fade] *= np.linspace(0, 1, fade)
                burst[-fade:] *= np.linspace(1, 0, fade)
            overlay(mix, burst, abs_start + a)
            overlay(debug, burst, abs_start + a)
            masked_samples += b - a
            bursts_done += 1

        for a_frac, b_frac in CLIP_EDGE_DROPOUTS.get(phrase, []):
            a = int(a_frac * n_clip)
            b = int(b_frac * n_clip)
            if b <= a:
                continue
            gain = float(rng.uniform(0.03, 0.12))
            mix[abs_start + a : abs_start + b] *= gain
            debug[abs_start + a : abs_start + b] *= gain
            masked_samples += b - a

        pct = min(100.0, 100.0 * masked_samples / max(n_clip, 1))
        stats[phrase] = {
            "bursts": bursts_done,
            "masked_s": masked_samples / sr,
            "masked_pct": pct,
            "tone_boost_db": (local_tone - TONE_DBFS) if local_tone is not None else 0.0,
            "tone_local_dbfs": local_tone if local_tone is not None else TONE_DBFS,
            "underlay_dbfs": under_db,
        }
    return stats


def verify(
    final: np.ndarray,
    sr: int,
    starts: dict[str, float],
    durations: dict[str, float],
    source_hashes: dict[str, str],
) -> None:
    print("\n--- verificação técnica ---")
    dur = len(final) / sr
    print(f"duração final: {dur:.3f}s (alvo ~{DURATION_SECONDS})")
    assert abs(dur - DURATION_SECONDS) < 0.35, "duração fora da faixa"
    print("canais: mono")
    print(f"sample rate: {sr} Hz")
    assert sr == OUTPUT_SAMPLE_RATE
    pk = peak_dbfs(final)
    print(f"peak: {pk:.2f} dBFS")
    assert pk <= -0.5 + 1e-6, f"peak muito alto: {pk}"
    # clipping digital duro massivo
    hard = np.mean(np.abs(final) >= 0.999)
    print(f"fração perto de full-scale: {hard * 100:.3f}%")
    assert hard < 0.01, "clipping duro excessivo"

    for phrase, t0 in starts.items():
        t1 = t0 + durations[phrase]
        print(f"clip OK: '{phrase}' @ {t0:.2f}–{t1:.2f}s")

    for phrase, path in CLIPS.items():
        h = file_sha256(path)
        assert h == source_hashes[phrase], f"arquivo original alterado: {path.name}"
    print("originais intactos (SHA-256)")

    # linha tonal ~1700 Hz
    n_fft = 4096
    freqs, psd = signal.welch(final, fs=sr, nperseg=min(n_fft, len(final)))
    idx = int(np.argmin(np.abs(freqs - TONE_FREQ)))
    band = psd[max(0, idx - 2) : idx + 3]
    neighborhood = np.median(psd[np.logical_and(freqs > 1400, freqs < 2000)])
    tone_power = float(np.max(band))
    print(f"energia ~{TONE_FREQ:.0f} Hz / vizinhança: {tone_power / (neighborhood + EPS):.2f}x")
    assert tone_power > neighborhood * 1.5, "linha tonal 1700 Hz não evidente"

    # energia principalmente na banda telefônica
    in_band = np.sum(psd[np.logical_and(freqs >= PHONE_LOW_HZ, freqs <= PHONE_HIGH_HZ)])
    total = np.sum(psd) + EPS
    ratio = float(in_band / total)
    print(f"energia na banda {PHONE_LOW_HZ:.0f}–{PHONE_HIGH_HZ:.0f} Hz: {ratio * 100:.1f}%")
    assert ratio > 0.55, "pouca energia na banda telefônica"
    print("verificação OK")


def main() -> None:
    print("Puzzle 01 — Divisão de Cassini\n")
    rng = np.random.default_rng(RANDOM_SEED)
    sr = WORK_SAMPLE_RATE
    n = int(DURATION_SECONDS * sr)

    print("[1/5] carregando clips...")
    for phrase, path in CLIPS.items():
        if not path.is_file():
            print(f"ERRO: clip não encontrado para '{phrase}':\n  {path}")
            sys.exit(1)

    source_hashes = {p: file_sha256(path) for p, path in CLIPS.items()}
    raw_clips: dict[str, np.ndarray] = {}
    norm_clips: dict[str, np.ndarray] = {}
    orig_db: dict[str, float] = {}
    norm_db: dict[str, float] = {}
    durations: dict[str, float] = {}

    for phrase, path in CLIPS.items():
        arr = load_mono(path, sr)
        # trim silêncio extremo leve nas pontas (sem cortar a fala)
        abs_a = np.abs(arr)
        thr = max(1e-4, np.max(abs_a) * 0.01)
        nz = np.where(abs_a > thr)[0]
        if len(nz):
            arr = arr[nz[0] : nz[-1] + 1]
        raw_clips[phrase] = arr
        orig_db[phrase] = dbfs(arr)
        target = CLIP_TARGET_DBFS[phrase]
        norm = scale_to_dbfs(arr, target)
        norm_clips[phrase] = norm
        norm_db[phrase] = dbfs(norm)
        durations[phrase] = len(norm) / sr

    print("[2/5] montando timeline...")
    starts = resolve_starts(durations)

    for phrase in CLIP_STARTS:
        print(
            f"\n  frase: {phrase}\n"
            f"  arquivo: {CLIPS[phrase].name}\n"
            f"  duração: {durations[phrase]:.3f}s\n"
            f"  timestamp inicial: {starts[phrase]:.2f}s\n"
            f"  RMS original: {orig_db[phrase]:.2f} dBFS\n"
            f"  RMS após normalização: {norm_db[phrase]:.2f} dBFS "
            f"(alvo {CLIP_TARGET_DBFS[phrase]:.1f})"
        )

    # Reference clean (só vozes normalizadas)
    clean = np.zeros(n, dtype=np.float64)
    for phrase, arr in norm_clips.items():
        overlay(clean, arr, int(starts[phrase] * sr))

    # Debug: vozes + mascaramento local (sem cama global)
    voice_mask_debug = clean.copy()

    # Cama de ruído (nível global inalterado — dificuldade vem do mascaramento local)
    bed = np.zeros(n, dtype=np.float64)
    bed += scale_to_dbfs(white_noise(n, rng), WHITE_NOISE_DBFS)
    bed += scale_to_dbfs(pinkish_noise(n, rng, sr), PINK_NOISE_DBFS)
    bed += scale_to_dbfs(sine(n, TONE_FREQ, sr), TONE_DBFS)
    bed += scale_to_dbfs(sine(n, 60.0, sr), HUM_60_DBFS)
    bed += scale_to_dbfs(sine(n, 120.0, sr), HUM_120_DBFS)

    mix = bed.copy()
    for phrase, arr in norm_clips.items():
        overlay(mix, arr, int(starts[phrase] * sr))

    print("\n[3/5] adicionando interferências...")
    speech_regions = [(starts[p], starts[p] + durations[p]) for p in starts]
    # Protege só o miolo das falas (bordas podem receber dropout/lixo)
    protected = protected_mask(n, speech_regions, sr, pad_s=-0.02)

    mask_stats = apply_local_speech_masking(
        mix, voice_mask_debug, starts, durations, sr, rng
    )

    # Bursts globais (intervalos)
    for i, (t0, t1) in enumerate(BURST_REGIONS):
        a = int(t0 * sr)
        b = int(t1 * sr)
        # não cobrir integralmente falas
        for s0, s1 in speech_regions:
            if t0 <= s0 and t1 >= s1:
                print(f"  ! burst {t0}-{t1} cobriria fala; encurtando")
                mid = (s0 + s1) / 2
                if t0 < mid:
                    b = int(s0 * sr)
                else:
                    a = int(s1 * sr)
        if b <= a:
            continue
        level = float(rng.uniform(*BURST_DBFS_RANGE))
        burst = scale_to_dbfs(white_noise(b - a, rng), level)
        fade = min(int(0.02 * sr), (b - a) // 4)
        if fade > 0:
            burst[:fade] *= np.linspace(0, 1, fade)
            burst[-fade:] *= np.linspace(1, 0, fade)
        overlay(mix, burst, a)

    # Clicks
    for _ in range(N_CLICKS):
        ms = float(rng.uniform(*CLICK_MS_RANGE))
        length = max(1, int(ms * sr / 1000.0))
        pos = int(rng.integers(0, max(1, n - length)))
        amp = float(rng.uniform(0.15, 0.55))
        click = rng.standard_normal(length) * amp
        click *= np.hanning(length)
        overlay(mix, click, pos)

    # Dropouts (entre falas / bordas)
    for _ in range(N_DROPOUTS):
        ms = float(rng.uniform(*DROPOUT_MS_RANGE))
        length = max(1, int(ms * sr / 1000.0))
        for _try in range(40):
            pos = int(rng.integers(0, max(1, n - length)))
            if not protected[pos : pos + length].any():
                mix[pos : pos + length] *= float(rng.uniform(0.02, 0.12))
                break

    # Lixo vocal — preencher intervalos (menos “ilhas” óbvias)
    junk_pool = make_junk_pool(raw_clips, rng, sr)
    if junk_pool:
        gaps: list[tuple[int, int]] = []
        cursor = 0
        ordered = sorted(starts.items(), key=lambda kv: kv[1])
        for phrase, t0 in ordered:
            a = int(t0 * sr)
            if a - cursor > int(0.08 * sr):
                gaps.append((cursor, a))
            cursor = int((t0 + durations[phrase]) * sr)
        if n - cursor > int(0.08 * sr):
            gaps.append((cursor, n))

        for i in range(N_JUNK_FRAGMENTS):
            frag = junk_pool[i % len(junk_pool)]
            if not gaps:
                break
            g0, g1 = gaps[i % len(gaps)]
            if g1 - g0 <= len(frag) + 10:
                continue
            pos = int(rng.integers(g0, g1 - len(frag)))
            if protected[pos : pos + len(frag)].any():
                continue
            overlay(mix, frag, pos)

        if JUNK_ON_SPEECH_EDGE:
            for phrase, t0 in ordered:
                n_clip = max(1, int(durations[phrase] * sr))
                edge = max(1, int(JUNK_SPEECH_EDGE_FRAC * n_clip))
                abs0 = int(t0 * sr)
                for _ in range(3):
                    frag = junk_pool[int(rng.integers(0, len(junk_pool)))]
                    if len(frag) > edge:
                        frag = frag[:edge]
                    if rng.random() < 0.5:
                        pos = abs0
                    else:
                        pos = abs0 + max(0, n_clip - len(frag))
                    overlay(mix, frag * float(rng.uniform(0.45, 0.85)), pos)
                # Clips difíceis: lixo também no miolo (microfragmentos, sem palavra)
                if JUNK_ON_HARD_CLIP_MID and phrase in JUNK_HARD_PHRASES:
                    for _ in range(4):
                        frag = junk_pool[int(rng.integers(0, len(junk_pool)))]
                        max_len = max(1, int(0.09 * sr))
                        if len(frag) > max_len:
                            frag = frag[:max_len]
                        if n_clip <= len(frag) + 4:
                            continue
                        pos = abs0 + int(rng.integers(edge, max(edge + 1, n_clip - len(frag) - edge)))
                        overlay(mix, frag * float(rng.uniform(0.55, 1.0)), pos)

    pre_phone = mix.copy()

    print("[4/5] aplicando cadeia telefônica...")
    mix16 = resample_mono(mix, sr, OUTPUT_SAMPLE_RATE)
    clean16 = resample_mono(clean, sr, OUTPUT_SAMPLE_RATE)
    pre16 = resample_mono(pre_phone, sr, OUTPUT_SAMPLE_RATE)
    debug16 = resample_mono(voice_mask_debug, sr, OUTPUT_SAMPLE_RATE)
    n16 = int(DURATION_SECONDS * OUTPUT_SAMPLE_RATE)

    def fit(x: np.ndarray) -> np.ndarray:
        if len(x) < n16:
            y = np.zeros(n16, dtype=np.float64)
            y[: len(x)] = x
            return y
        return x[:n16]

    mix16 = fit(mix16)
    clean16 = fit(clean16)
    pre16 = fit(pre16)
    debug16 = fit(debug16)

    phoned = phone_bandpass(mix16, OUTPUT_SAMPLE_RATE, PHONE_LOW_HZ, PHONE_HIGH_HZ)
    phoned = compress(
        phoned,
        OUTPUT_SAMPLE_RATE,
        COMP_THRESHOLD_DB,
        COMP_RATIO,
        COMP_ATTACK_MS,
        COMP_RELEASE_MS,
    )
    phoned = soft_clip(phoned, SOFT_CLIP_DRIVE)
    pk = peak_dbfs(phoned)
    phoned *= 10.0 ** ((FINAL_PEAK_DBFS - pk) / 20.0)

    # Debug também em cadeia telefônica leve (mesma banda), sem cama global
    debug_out = phone_bandpass(debug16, OUTPUT_SAMPLE_RATE, PHONE_LOW_HZ, PHONE_HIGH_HZ)
    dpk = peak_dbfs(debug_out)
    if dpk > FINAL_PEAK_DBFS:
        debug_out *= 10.0 ** ((FINAL_PEAK_DBFS - dpk) / 20.0)

    print("[5/5] exportando...")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_clean = OUT_DIR / "puzzle01_reference_clean.wav"
    out_pre = OUT_DIR / "puzzle01_pre_phone.wav"
    out_wav = OUT_DIR / "puzzle01_final.wav"
    out_mp3 = OUT_DIR / "puzzle01_final.mp3"
    out_debug = OUT_DIR / "puzzle01_voice_mask_debug.wav"

    write_wav_pcm16(out_clean, clean16, OUTPUT_SAMPLE_RATE)
    write_wav_pcm16(out_pre, pre16, OUTPUT_SAMPLE_RATE)
    write_wav_pcm16(out_wav, phoned, OUTPUT_SAMPLE_RATE)
    write_mp3(out_mp3, phoned, OUTPUT_SAMPLE_RATE)
    write_wav_pcm16(out_debug, debug_out, OUTPUT_SAMPLE_RATE)

    print("\n--- log de dificuldade ---")
    print(f"Tom 1700 Hz global: {TONE_DBFS:.1f} dBFS")
    for phrase in CLIP_STARTS:
        st = mask_stats[phrase]
        under = st.get("underlay_dbfs")
        tone_txt = (
            f"{st['tone_local_dbfs']:.1f} dBFS (Δ {st['tone_boost_db']:+.1f} vs global)"
            if st["tone_boost_db"] != 0.0 or CLIP_LOCAL_TONE_DBFS.get(phrase) is not None
            else "só cama global"
        )
        print(
            f"\nFrase: {phrase}\n"
            f"Timestamp: {starts[phrase]:.2f}s\n"
            f"Target RMS: {CLIP_TARGET_DBFS[phrase]:.1f} dBFS "
            f"(medido {norm_db[phrase]:.2f})\n"
            f"Interferência tonal local: {tone_txt}\n"
            f"Underlay local: {f'{under:.1f} dBFS' if under is not None else 'nenhum'}\n"
            f"Quantidade de bursts: {st['bursts']}\n"
            f"Duração total mascarada: {st['masked_s']:.3f}s\n"
            f"Percentual aproximado da fala afetado: {st['masked_pct']:.1f}%"
        )

    print("\nDuração:", f"{len(phoned) / OUTPUT_SAMPLE_RATE:.3f}s")
    print("Peak:", f"{peak_dbfs(phoned):.2f} dBFS")
    print("RMS aproximado:", f"{dbfs(phoned):.2f} dBFS")
    print("Arquivos gerados:")
    for p in (out_clean, out_pre, out_wav, out_mp3, out_debug):
        print(f"  {p.relative_to(ROOT)}  ({p.stat().st_size} bytes)")

    verify(phoned, OUTPUT_SAMPLE_RATE, starts, durations, source_hashes)

    for phrase, path in CLIPS.items():
        assert file_sha256(path) == source_hashes[phrase]

    print("\nPronto.")


if __name__ == "__main__":
    # Windows consoles (cp932/cp1252) quebram em hífen tipográfico / acentos.
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
    except Exception:
        pass
    main()

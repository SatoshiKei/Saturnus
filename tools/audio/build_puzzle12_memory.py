#!/usr/bin/env python3
"""Puzzle 12 — MEMÓRIA: mensagem final composta a partir do full clean de Mariana + assinaturas do caso."""

from __future__ import annotations

import hashlib
import json
import time
from datetime import datetime, timezone
from pathlib import Path

import numpy as np

try:
    from pydub import AudioSegment
except ImportError:
    raise SystemExit("pip install pydub")

ROOT = Path(__file__).resolve().parents[2]
P1_SRC = ROOT / "src" / "assets" / "audios" / "p1"
CLEAN_MASTER = ROOT / "tools" / "audio" / "out" / "puzzle01_reference_clean.wav"
EMERGENCY = ROOT / "public" / "assets" / "audio" / "forensic" / "puzzle01" / "p01_corrupted_base.wav"
P01_CLIP = ROOT / "public" / "assets" / "audio" / "forensic" / "puzzle01" / "p01_mariana_01_escute.mp3"
ENCELADUS = ROOT / "public" / "assets" / "audio" / "forensic" / "puzzle08" / "p08_enceladus_final.wav"
ENCELADUS_RES = ROOT / "public" / "assets" / "audio" / "forensic" / "puzzle08" / "p08_residual_preview.wav"
CASSINI_DERIVED = ROOT / "public" / "assets" / "audio" / "forensic" / "puzzle09" / "stream_b_reconstructed.wav"
CASSINI_CAPTURE = ROOT / "public" / "assets" / "audio" / "forensic" / "puzzle09" / "stream_b_capture_order.wav"
PCAP = ROOT / "public" / "assets" / "audio" / "forensic" / "puzzle09" / "hv_session_capture.pcap"

PUBLIC = ROOT / "public" / "assets" / "audio" / "forensic" / "puzzle12"
DEBUG = ROOT / "tools" / "audio" / "out" / "puzzle12_debug"
META_TS = ROOT / "src" / "forensic" / "puzzles" / "puzzle12Meta.json"

SR = 22050
SEED = 4121212

# Canonical regions (seconds) — apartment → emergency → enceladus → cassini-derived
REGIONS = {
    "A": (0.4, 2.1),
    "B": (3.0, 3.8),
    "C": (5.2, 6.5),
    "D": (7.0, 8.4),
}

CLIPS = [
    P1_SRC / "mariana escute isso até o fim.mp3",
    P1_SRC / "mariana - desde aquela noite.mp3",
    P1_SRC / "mariana - eu sentia medo.mp3",
    P1_SRC / "mariana - eu estava confusa.mp3",
    P1_SRC / "mariana - eu não lembro.mp3",
]


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 16), b""):
            h.update(chunk)
    return h.hexdigest()


def load_mono(path: Path, start_ms: int = 0, dur_ms: int | None = None) -> np.ndarray:
    seg = AudioSegment.from_file(path)
    if dur_ms is not None:
        seg = seg[start_ms : start_ms + dur_ms]
    elif start_ms:
        seg = seg[start_ms:]
    seg = seg.set_channels(1).set_frame_rate(SR).set_sample_width(2)
    return np.array(seg.get_array_of_samples(), dtype=np.float64) / 32768.0


def write_wav(path: Path, x: np.ndarray) -> None:
    import wave

    path.parent.mkdir(parents=True, exist_ok=True)
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def env(x: np.ndarray, hop: int = int(0.04 * SR)) -> list[float]:
    out = []
    for i in range(0, max(1, len(x) - hop), hop):
        out.append(float(np.sqrt(np.mean(x[i : i + hop] ** 2))))
    return out


def pearson(a: list[float] | np.ndarray, b: list[float] | np.ndarray) -> float:
    a = np.asarray(a, dtype=np.float64)
    b = np.asarray(b, dtype=np.float64)
    n = min(len(a), len(b))
    if n < 4:
        return 0.0
    a, b = a[:n], b[:n]
    ma, mb = a.mean(), b.mean()
    da, db = a - ma, b - mb
    den = np.sqrt((da * da).sum() * (db * db).sum())
    return float(0.0 if den < 1e-12 else (da * db).sum() / den)


def crossfade_concat(parts: list[np.ndarray], gap_ms: int = 180, fade_ms: int = 40) -> np.ndarray:
    gap = np.zeros(int(SR * gap_ms / 1000.0))
    fade = max(1, int(SR * fade_ms / 1000.0))
    out = parts[0].copy()
    for p in parts[1:]:
        if len(out) > fade and len(p) > fade:
            out[-fade:] *= np.linspace(1, 0, fade)
            head = p[:fade] * np.linspace(0, 1, fade)
            out = np.concatenate([out[:-fade], out[-fade:] + head, p[fade:]])
        else:
            out = np.concatenate([out, gap, p])
        out = np.concatenate([out, gap * 0.35])
    return out


def apply_reverb(x: np.ndarray, delays_ms=(28, 51, 79), gains=(0.28, 0.18, 0.11)) -> np.ndarray:
    y = x.copy()
    for d_ms, g in zip(delays_ms, gains):
        d = int(SR * d_ms / 1000.0)
        if d >= len(y):
            continue
        delayed = np.zeros_like(y)
        delayed[d:] = y[:-d] * g
        y = y + delayed
    return y * 0.82


def hvac_bed(n: int, rng: np.random.Generator) -> np.ndarray:
    t = np.arange(n) / SR
    bed = 0.012 * np.sin(2 * np.pi * 58 * t)
    bed += 0.008 * np.sin(2 * np.pi * 117 * t)
    bed += rng.normal(0, 0.006, n)
    k = max(1, int(SR / 400))
    return np.convolve(bed, np.ones(k) / k, mode="same")


def band_limit(x: np.ndarray, lo: float, hi: float) -> np.ndarray:
    k = max(1, int(SR / hi))
    y = np.convolve(x, np.ones(k) / k, mode="same")
    k2 = max(1, int(SR / max(lo, 60)))
    low = np.convolve(x, np.ones(k2) / k2, mode="same")
    return y - 0.4 * low


def inject(dst: np.ndarray, src: np.ndarray, start_s: float, gain: float) -> np.ndarray:
    i0 = int(start_s * SR)
    n = min(len(src), len(dst) - i0)
    if n <= 0:
        return dst
    out = dst.copy()
    fade = min(int(0.04 * SR), n // 4)
    window = np.ones(n)
    if fade > 1:
        window[:fade] = np.linspace(0, 1, fade)
        window[-fade:] = np.linspace(1, 0, fade)
    out[i0 : i0 + n] += src[:n] * gain * window
    return out


def slice_s(x: np.ndarray, a: float, b: float) -> np.ndarray:
    return x[int(a * SR) : int(b * SR)].copy()


def main() -> None:
    rng = np.random.default_rng(SEED)
    PUBLIC.mkdir(parents=True, exist_ok=True)
    DEBUG.mkdir(parents=True, exist_ok=True)

    for p in [CLEAN_MASTER, EMERGENCY, ENCELADUS, CASSINI_DERIVED, CASSINI_CAPTURE, *CLIPS]:
        if not p.exists():
            raise SystemExit(f"Missing required asset: {p}")

    # --- Vocal carrier: concatenate original phrase clips (no TTS) ---
    parts = []
    for clip in CLIPS:
        x = load_mono(clip)
        # trim leading/trailing near-silence
        thr = 0.01
        nz = np.where(np.abs(x) > thr)[0]
        if len(nz):
            x = x[max(0, nz[0] - int(0.05 * SR)) : min(len(x), nz[-1] + int(0.08 * SR))]
        parts.append(x)
    voice = crossfade_concat(parts, gap_ms=160, fade_ms=35)
    # Target ~9.2 s so regions A–D fit with a short tail
    target = int(9.2 * SR)
    if len(voice) > target:
        voice = voice[:target]
    else:
        voice = np.pad(voice, (0, target - len(voice)))

    # Normalize loudness gently
    peak = np.max(np.abs(voice)) or 1.0
    voice = voice / peak * 0.72

    # Copy clean carrier for debug / comparison
    write_wav(PUBLIC / "memory_carrier_clean.wav", voice)
    write_wav(DEBUG / "carrier_clean.wav", voice)

    # --- Apartment room reference from silent floor of emergency (apartment call) ---
    emg = load_mono(EMERGENCY, 0, 4000)
    # low-energy ambient
    ambient = band_limit(emg, 40, 800) * 0.55
    ambient = apply_reverb(ambient, delays_ms=(32, 58, 94), gains=(0.32, 0.2, 0.12))
    if len(ambient) < int(2.5 * SR):
        ambient = np.tile(ambient, int(np.ceil(2.5 * SR / max(1, len(ambient)))))[: int(2.5 * SR)]
    apt_ref = ambient[: int(2.0 * SR)] + hvac_bed(int(2.0 * SR), rng)
    write_wav(PUBLIC / "apartment_room_reference.wav", apt_ref * 0.9)
    write_wav(DEBUG / "source_comparison_A.wav", apt_ref)

    # --- Emergency fingerprint snippet (escute stem + phone band) ---
    esc = load_mono(P01_CLIP)
    esc = band_limit(esc, 300, 3400) * 0.85
    # take ~0.8s distinctive portion
    if len(esc) > int(0.9 * SR):
        esc = esc[int(0.1 * SR) : int(1.0 * SR)]
    write_wav(PUBLIC / "emergency_fingerprint_reference.wav", esc)
    write_wav(DEBUG / "source_comparison_B.wav", esc)

    # --- Enceladus periodic residual (6 s cycle → 1 kHz ticks) ---
    enc = load_mono(ENCELADUS_RES if ENCELADUS_RES.exists() else ENCELADUS, 0, 8000)
    n_enc = int(1.4 * SR)
    # Take a high-energy band slice and lock a 6 s-family pulse onto it
    enc_band = band_limit(enc, 700, 1600)
    if len(enc_band) < n_enc:
        enc_band = np.tile(enc_band, int(np.ceil(n_enc / max(1, len(enc_band)))))[:n_enc]
    else:
        # pick densest window
        hop = int(0.05 * SR)
        best_i, best_e = 0, -1.0
        for i in range(0, len(enc_band) - n_enc, hop):
            e = float(np.sqrt(np.mean(enc_band[i : i + n_enc] ** 2)))
            if e > best_e:
                best_e, best_i = e, i
        enc_band = enc_band[best_i : best_i + n_enc]
    t = np.arange(n_enc) / SR
    pulse = 0.08 * np.sin(2 * np.pi * 1000 * t) * (0.55 + 0.45 * np.sin(2 * np.pi * (1 / 6.0) * t))
    enc_sig = enc_band * 0.7 + pulse
    peak_e = np.max(np.abs(enc_sig)) or 1.0
    enc_sig = enc_sig / peak_e * 0.55
    write_wav(PUBLIC / "enceladus_pattern_reference.wav", enc_sig)
    write_wav(DEBUG / "source_comparison_C.wav", enc_sig)

    # --- Cassini DERIVED: difference vs capture-order = reconstruction-only artifact ---
    derived = load_mono(CASSINI_DERIVED)
    capture = load_mono(CASSINI_CAPTURE)
    n_min = min(len(derived), len(capture))
    diff = derived[:n_min] - capture[:n_min]
    win = int(1.5 * SR)
    hop = int(0.05 * SR)
    best_i, best_e = 0, -1.0
    for i in range(0, max(1, n_min - win), hop):
        e = float(np.sqrt(np.mean(diff[i : i + win] ** 2)))
        if e > best_e:
            best_e, best_i = e, i
    art = diff[best_i : best_i + win].copy()
    if float(np.max(np.abs(art))) < 1e-4:
        # fallback: concealment ticks unique to derived reconstruction
        frame = int(0.04 * SR)
        art = np.zeros(win)
        src = derived[best_i : best_i + win]
        for k in range(0, win - 2 * frame, frame * 3):
            art[k : k + frame] = src[k : k + frame] * 0.8
            art[k + frame : k + 2 * frame] = src[k : k + frame] * 0.8
    peak_a = np.max(np.abs(art)) or 1.0
    art = art / peak_a * 0.5
    cap_contrast = capture[best_i : best_i + win].copy()
    write_wav(PUBLIC / "cassini_derived_artifact_reference.wav", art)
    write_wav(DEBUG / "source_comparison_D.wav", art)
    write_wav(PUBLIC / "cassini_capture_order_contrast.wav", cap_contrast)

    # --- Compose final message ---
    carrier = voice.copy()
    final = voice.copy()
    a0, a1 = REGIONS["A"]
    # Inject apartment room reference (residual tracks apt_ref); light wet for ear
    ai0, ai1 = int(a0 * SR), int(a1 * SR)
    wet = apply_reverb(final[ai0:ai1].copy(), delays_ms=(34, 61, 97), gains=(0.12, 0.08, 0.05))
    final[ai0:ai1] = final[ai0:ai1] * 0.7 + wet * 0.3
    final = inject(final, apt_ref, a0, gain=0.9)
    for edge_s in (a0, a1):
        e = int(edge_s * SR)
        if 4 < e < len(final) - 4:
            final[e - 2 : e + 2] += rng.normal(0, 0.004, 4)

    b0, b1 = REGIONS["B"]
    final = inject(final, esc, b0, gain=0.55)
    bi0, bi1 = int(b0 * SR), int(b1 * SR)
    final[bi0:bi1] = band_limit(final[bi0:bi1], 280, 3400) * 1.05

    c0, c1 = REGIONS["C"]
    final = inject(final, enc_sig, c0, gain=0.5)

    d0, d1 = REGIONS["D"]
    final = inject(final, art[: int((d1 - d0) * SR)], d0, gain=0.55)

    peak = np.max(np.abs(final)) or 1.0
    final = final / peak * 0.78

    write_wav(PUBLIC / "memory_final_message.wav", final)
    write_wav(DEBUG / "final_message.wav", final)

    # Isolated regions + residuals (final − carrier) for reliable fingerprints
    residual = final - carrier[: len(final)]
    for key, (s0, s1) in REGIONS.items():
        write_wav(DEBUG / f"isolated_region_{key}.wav", slice_s(final, s0, s1))
        write_wav(PUBLIC / f"region_{key}_window.wav", slice_s(final, s0, s1))
        write_wav(DEBUG / f"residual_region_{key}.wav", slice_s(residual, s0, s1))

    # Hashes / timestamps for derived impossibility
    derived_hash = sha256_file(CASSINI_DERIVED)
    pcap_hash = sha256_file(PCAP) if PCAP.exists() else None
    derived_mtime = CASSINI_DERIVED.stat().st_mtime
    derived_created = datetime.fromtimestamp(derived_mtime, tz=timezone.utc).isoformat()
    final_created = datetime.now(timezone.utc).isoformat()
    final_hash = sha256_file(PUBLIC / "memory_final_message.wav")

    # Signature layers actually embedded (Search Case Media fingerprints these)
    def windowed(src: np.ndarray, start: float, end: float) -> np.ndarray:
        n = int((end - start) * SR)
        x = src[:n].copy()
        if len(x) < n:
            x = np.pad(x, (0, n - len(x)))
        fade = min(int(0.04 * SR), max(1, n // 4))
        w = np.ones(n)
        if fade > 1:
            w[:fade] = np.linspace(0, 1, fade)
            w[-fade:] = np.linspace(1, 0, fade)
        return x * w

    sig_A = windowed(apt_ref, a0, a1)
    sig_B = windowed(esc, b0, b1)
    sig_C = windowed(enc_sig, c0, c1)
    sig_D = windowed(art, d0, d1)

    env_sig_A = env(sig_A)
    env_sig_B = env(sig_B)
    env_sig_C = env(sig_C)
    env_sig_D = env(sig_D)
    env_res_A = env(slice_s(residual, a0, a1))
    env_res_B = env(slice_s(residual, b0, b1))
    env_res_C = env(slice_s(residual, c0, c1))
    env_res_D = env(slice_s(residual, d0, d1))
    env_apt = env(apt_ref)
    env_emg = env(esc)
    env_enc = env(enc_sig)
    env_der = env(art)
    env_cap = env(cap_contrast)
    env_full = env(final)
    env_final_A = env(slice_s(final, a0, a1))
    env_final_B = env(slice_s(final, b0, b1))
    env_final_C = env(slice_s(final, c0, c1))
    env_final_D = env(slice_s(final, d0, d1))

    scores = {
        "A_apartment": pearson(env_sig_A, env_apt),
        "B_emergency": pearson(env_sig_B, env_emg),
        "C_enceladus": pearson(env_sig_C, env_enc),
        "D_cassini_derived": pearson(env_sig_D, env_der),
        "D_vs_capture_order": pearson(env_sig_D, env_cap),
        "residualA_apartment": pearson(env_res_A, env_apt),
        "residualB_emergency": pearson(env_res_B, env_emg),
        "residualC_enceladus": pearson(env_res_C, env_enc),
        "residualD_cassini_derived": pearson(env_res_D, env_der),
        "residualD_vs_capture_order": pearson(env_res_D, env_cap),
    }

    meta = {
        "seed": SEED,
        "sampleRate": SR,
        "durationSec": round(len(final) / SR, 3),
        "carrier": {
            "kind": "puzzle01_phrase_clips_concat",
            "cleanMaster": str(CLEAN_MASTER.relative_to(ROOT)),
            "clips": [str(c.relative_to(ROOT)) for c in CLIPS],
            "noTts": True,
        },
        "regions": {
            "A": {"start": a0, "end": a1, "source": "apartment", "label": "Apartamento de Mariana"},
            "B": {"start": b0, "end": b1, "source": "emergency", "label": "Chamada de emergência 08:03"},
            "C": {"start": c0, "end": c1, "source": "enceladus", "label": "Enceladus / padrão hospitalar"},
            "D": {
                "start": d0,
                "end": d1,
                "source": "cassini_derived",
                "label": "Cassini-Huygens — output derivado",
            },
        },
        "fingerprintThreshold": 0.55,
        "wideSelectionMaxSec": 2.6,
        "scores": scores,
        "env": {
            "final": env_full,
            "regionA": env_final_A,
            "regionB": env_final_B,
            "regionC": env_final_C,
            "regionD": env_final_D,
            "residualA": env_res_A,
            "residualB": env_res_B,
            "residualC": env_res_C,
            "residualD": env_res_D,
            "signatureA": env_sig_A,
            "signatureB": env_sig_B,
            "signatureC": env_sig_C,
            "signatureD": env_sig_D,
            "apartment": env_apt,
            "emergency": env_emg,
            "enceladus": env_enc,
            "cassiniDerived": env_der,
            "cassiniCaptureOrder": env_cap,
        },
        "audio": {
            "final": "/assets/audio/forensic/puzzle12/memory_final_message.wav",
            "carrier": "/assets/audio/forensic/puzzle12/memory_carrier_clean.wav",
            "apartment": "/assets/audio/forensic/puzzle12/apartment_room_reference.wav",
            "emergency": "/assets/audio/forensic/puzzle12/emergency_fingerprint_reference.wav",
            "enceladus": "/assets/audio/forensic/puzzle12/enceladus_pattern_reference.wav",
            "cassiniDerived": "/assets/audio/forensic/puzzle12/cassini_derived_artifact_reference.wav",
            "cassiniCaptureOrder": "/assets/audio/forensic/puzzle12/cassini_capture_order_contrast.wav",
        },
        "cassiniDerived": {
            "path": str(CASSINI_DERIVED.relative_to(ROOT)),
            "publicUrl": "/assets/audio/forensic/puzzle09/stream_b_reconstructed.wav",
            "parentPcap": str(PCAP.relative_to(ROOT)) if PCAP.exists() else None,
            "parentPcapUrl": "/assets/audio/forensic/puzzle09/hv_session_capture.pcap",
            "sha256": derived_hash,
            "createdAt": derived_created,
            "mtime": derived_mtime,
            "kind": "derived forensic output",
            "note": "Artifact exists only after bench reconstruction; absent from capture-order stream / raw PCAP audio.",
        },
        "finalMessage": {
            "sha256": final_hash,
            "createdAt": final_created,
            "path": "public/assets/audio/forensic/puzzle12/memory_final_message.wav",
        },
        "pcapSha256": pcap_hash,
    }

    META_TS.write_text(json.dumps(meta), encoding="utf-8")
    (PUBLIC / "capture_meta.json").write_text(json.dumps(meta), encoding="utf-8")
    (DEBUG / "provenance_report.json").write_text(
        json.dumps({k: v for k, v in meta.items() if k != "env"}, indent=2),
        encoding="utf-8",
    )

    print(
        json.dumps(
            {
                "ok": True,
                "durationSec": meta["durationSec"],
                "scores": scores,
                "derivedSha256": derived_hash[:16],
                "finalSha256": final_hash[:16],
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Puzzle 09 — CASSINI-HUYGENS
Dois streams RTP (SSRC distintos) intercalados; Stream B com reordenação.

Uso:
  python tools/audio/build_puzzle09_cassini_huygens.py
"""

from __future__ import annotations

import json
import struct
import wave
from pathlib import Path

import numpy as np

try:
    from pydub import AudioSegment
except ImportError:
    raise SystemExit("pip install pydub")

ROOT = Path(__file__).resolve().parents[2]
ASSET_A = ROOT / "src" / "assets" / "audios" / "p9" / "H.V - Chamado.mp3"
ASSET_B = ROOT / "src" / "assets" / "audios" / "p9" / "H.V - O Omitido.mp3"
OUT = ROOT / "tools" / "audio" / "out"
PUBLIC = ROOT / "public" / "assets" / "audio" / "forensic" / "puzzle09"
DEBUG = OUT / "puzzle09_debug"
TS_META = ROOT / "src" / "forensic" / "puzzles" / "puzzle09Meta.json"

SEED = 4090909
SR_RTP = 8000
FRAME_MS = 40
FRAME_SAMPLES = SR_RTP * FRAME_MS // 1000  # 320
SSRC_A = 0x48A21C30
SSRC_B = 0x91F47B12
SRC_A = "10.20.4.18"
DST_A = "10.20.4.41"
SRC_B = "10.20.4.18"
DST_B = "10.20.7.9"
SEQ_A0 = 1830
SEQ_B0 = 700
RTP_TS_A0 = 96000
RTP_TS_B0 = 48000
# ticks por frame a 8 kHz
RTP_TS_STEP = FRAME_SAMPLES


def linear_to_ulaw(samples: np.ndarray) -> np.ndarray:
    """PCM float [-1,1] → μ-law bytes (G.711)."""
    x = np.clip(samples, -1.0, 1.0)
    sign = (x < 0).astype(np.int32)
    ax = np.abs(x)
    BIAS = 0x84
    CLIP = 32635
    pcm = np.minimum((ax * 32767.0).astype(np.int32), CLIP) + BIAS
    exp = np.zeros(len(pcm), dtype=np.int32)
    for e in range(7, 0, -1):
        exp = np.where((exp == 0) & (pcm >= (0x100 << e)), e, exp)
    mantissa = (pcm >> (exp + 3)) & 0x0F
    ulaw = ~(sign << 7 | exp << 4 | mantissa) & 0xFF
    return ulaw.astype(np.uint8)


def ulaw_to_linear(ulaw: np.ndarray) -> np.ndarray:
    u = (~ulaw.astype(np.int32)) & 0xFF
    sign = u & 0x80
    exp = (u >> 4) & 0x07
    mant = u & 0x0F
    sample = ((mant << 3) + 0x84) << exp
    sample = sample - 0x84
    sample = np.where(sign != 0, -sample, sample)
    return (sample.astype(np.float64) / 32768.0).astype(np.float32)


def load_ulaw_frames(path: Path) -> tuple[np.ndarray, list[np.ndarray]]:
    seg = AudioSegment.from_file(path).set_channels(1).set_frame_rate(SR_RTP).set_sample_width(2)
    raw = np.array(seg.get_array_of_samples(), dtype=np.float64) / 32768.0
    # pad to frame boundary
    n = int(np.ceil(len(raw) / FRAME_SAMPLES) * FRAME_SAMPLES)
    if n > len(raw):
        raw = np.pad(raw, (0, n - len(raw)))
    ulaw = linear_to_ulaw(raw)
    frames = [
        ulaw[i : i + FRAME_SAMPLES]
        for i in range(0, len(ulaw), FRAME_SAMPLES)
        if len(ulaw[i : i + FRAME_SAMPLES]) == FRAME_SAMPLES
    ]
    return ulaw, frames


def write_wav_pcm(path: Path, samples: np.ndarray, sr: int = SR_RTP) -> None:
    pcm = np.clip(samples, -1, 1)
    data = (pcm * 32767.0).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(data.tobytes())


def write_pcap(path: Path, packets: list[dict], payloads: dict[str, list[np.ndarray]]) -> None:
    """PCAP linktype=1 Ethernet, UDP/RTP simplificado."""
    # Global header
    buf = bytearray()
    buf += struct.pack("<IHHIIII", 0xA1B2C3D4, 2, 4, 0, 0, 65535, 1)

    def ip_checksum(header: bytes) -> int:
        if len(header) % 2:
            header += b"\x00"
        s = sum(struct.unpack("!%dH" % (len(header) // 2), header))
        s = (s >> 16) + (s & 0xFFFF)
        s += s >> 16
        return (~s) & 0xFFFF

    def ipv4(a: str) -> bytes:
        return bytes(int(x) for x in a.split("."))

    for p in packets:
        frames = payloads[p["stream"]]
        payload = bytes(frames[p["frame"]])
        # RTP header (12) + payload
        rtp = struct.pack(
            "!BBHII",
            0x80,  # V=2
            0x00,  # PT=0 PCMU
            p["sequence"] & 0xFFFF,
            p["rtpTimestamp"] & 0xFFFFFFFF,
            p["ssrcInt"] & 0xFFFFFFFF,
        ) + payload
        udp_len = 8 + len(rtp)
        udp = struct.pack("!HHHH", 4000 if p["stream"] == "A" else 4002, 5004, udp_len, 0) + rtp
        # IP
        ip_len = 20 + len(udp)
        ip_hdr = struct.pack(
            "!BBHHHBBH4s4s",
            0x45,
            0,
            ip_len,
            p["index"] & 0xFFFF,
            0x4000,
            64,
            17,
            0,
            ipv4(p["source"]),
            ipv4(p["destination"]),
        )
        csum = ip_checksum(ip_hdr)
        ip_hdr = ip_hdr[:10] + struct.pack("!H", csum) + ip_hdr[12:]
        # Ethernet fake
        eth = bytes(14)  # zeros OK for puzzle artifact
        frame = eth + ip_hdr + udp
        ts = p["timeSec"]
        sec = int(ts)
        usec = int(round((ts - sec) * 1_000_000))
        buf += struct.pack("<IIII", sec, usec, len(frame), len(frame))
        buf += frame

    path.write_bytes(bytes(buf))


def local_reorder(indices: list[int], rng: np.random.Generator, intensity: str) -> list[int]:
    """Reordenação local determinística (não reverse total)."""
    out = indices[:]
    n = len(out)
    if intensity == "mild":
        swaps = max(3, n // 80)
        span = 2
    else:
        swaps = max(12, n // 18)
        span = 4
    for _ in range(swaps):
        i = int(rng.integers(0, max(1, n - span)))
        j = i + int(rng.integers(1, span + 1))
        if j < n:
            out[i], out[j] = out[j], out[i]
    # occasional 3-cycle
    if intensity == "heavy":
        for _ in range(max(4, n // 40)):
            i = int(rng.integers(0, max(1, n - 3)))
            a, b, c = out[i], out[i + 1], out[i + 2]
            out[i], out[i + 1], out[i + 2] = b, c, a
    return out


def main() -> None:
    if not ASSET_A.exists() or not ASSET_B.exists():
        raise SystemExit(f"Assets ausentes:\n  {ASSET_A}\n  {ASSET_B}")

    PUBLIC.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    DEBUG.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(SEED)

    _, frames_a = load_ulaw_frames(ASSET_A)
    _, frames_b = load_ulaw_frames(ASSET_B)
    payloads = {"A": frames_a, "B": frames_b}

    # Logical order packets per stream
    logical_a = []
    for i, _ in enumerate(frames_a):
        logical_a.append(
            {
                "stream": "A",
                "frame": i,
                "sequence": SEQ_A0 + i,
                "rtpTimestamp": RTP_TS_A0 + i * RTP_TS_STEP,
                "ssrc": f"{SSRC_A:08X}",
                "ssrcInt": SSRC_A,
                "source": SRC_A,
                "destination": DST_A,
            }
        )
    logical_b = []
    for i, _ in enumerate(frames_b):
        logical_b.append(
            {
                "stream": "B",
                "frame": i,
                "sequence": SEQ_B0 + i,
                "rtpTimestamp": RTP_TS_B0 + i * RTP_TS_STEP,
                "ssrc": f"{SSRC_B:08X}",
                "ssrcInt": SSRC_B,
                "source": SRC_B,
                "destination": DST_B,
            }
        )

    order_a = local_reorder(list(range(len(logical_a))), rng, "mild")
    order_b = local_reorder(list(range(len(logical_b))), rng, "heavy")

    # Arrival times: overlap both streams (~start together, A slightly earlier)
    base = 12.0
    arrivals_a = []
    t = base
    for _ in order_a:
        t += FRAME_MS / 1000.0 + float(rng.uniform(-0.006, 0.006))
        arrivals_a.append(t)
    arrivals_b = []
    t = base + 0.02
    for _ in order_b:
        t += FRAME_MS / 1000.0 + float(rng.uniform(-0.012, 0.018))
        arrivals_b.append(t)

    capture: list[dict] = []
    for rank, li in enumerate(order_a):
        p = dict(logical_a[li])
        p["timeSec"] = round(arrivals_a[rank], 6)
        p["captureOrder"] = -1
        capture.append(p)
    for rank, li in enumerate(order_b):
        p = dict(logical_b[li])
        p["timeSec"] = round(arrivals_b[rank], 6)
        p["captureOrder"] = -1
        capture.append(p)

    capture.sort(key=lambda p: p["timeSec"])
    for i, p in enumerate(capture):
        p["index"] = i
        p["captureOrder"] = i
        p["protocol"] = "RTP"
        p["length"] = 12 + FRAME_SAMPLES
        p["time"] = p["timeSec"]

    # Sequence error counts (capture order within each stream)
    def seq_errors(stream: str) -> int:
        rows = [p for p in capture if p["stream"] == stream]
        err = 0
        for a, b in zip(rows, rows[1:]):
            if b["sequence"] != a["sequence"] + 1:
                err += 1
        return err

    # Reconstruct helpers
    def concat_stream(stream: str, by: str) -> np.ndarray:
        rows = [p for p in capture if p["stream"] == stream]
        if by == "sequence":
            rows = sorted(rows, key=lambda p: p["sequence"])
        elif by == "capture":
            rows = sorted(rows, key=lambda p: p["captureOrder"])
        chunks = [ulaw_to_linear(payloads[stream][p["frame"]]) for p in rows]
        return np.concatenate(chunks) if chunks else np.zeros(1, dtype=np.float32)

    mixed_capture = []
    for p in capture:
        mixed_capture.append(ulaw_to_linear(payloads[p["stream"]][p["frame"]]))
    mixed = np.concatenate(mixed_capture)

    wav_a = concat_stream("A", "sequence")
    wav_b = concat_stream("B", "sequence")
    wav_b_cap = concat_stream("B", "capture")
    wav_a_cap = concat_stream("A", "capture")

    write_wav_pcm(PUBLIC / "stream_a_reconstructed.wav", wav_a)
    write_wav_pcm(PUBLIC / "stream_b_reconstructed.wav", wav_b)
    write_wav_pcm(DEBUG / "stream_a_correct.wav", wav_a)
    write_wav_pcm(DEBUG / "stream_b_correct.wav", wav_b)
    write_wav_pcm(DEBUG / "stream_b_capture_order.wav", wav_b_cap)
    write_wav_pcm(DEBUG / "stream_a_capture_order.wav", wav_a_cap)
    write_wav_pcm(DEBUG / "mixed_capture_order.wav", mixed)
    write_wav_pcm(PUBLIC / "mixed_preview.wav", mixed[: SR_RTP * 8])  # short preview

    # Contiguous μ-law blobs for runtime optional decode
    (PUBLIC / "payload_a.ulaw").write_bytes(b"".join(bytes(f) for f in frames_a))
    (PUBLIC / "payload_b.ulaw").write_bytes(b"".join(bytes(f) for f in frames_b))

    write_pcap(PUBLIC / "hv_session_capture.pcap", capture, payloads)
    (DEBUG / "hv_session_capture.pcap").write_bytes((PUBLIC / "hv_session_capture.pcap").read_bytes())

    # Compact packet dump for DEBUG
    dump_lines = [
        "idx\ttime\tsrc\tdst\tproto\tssrc\tseq\trtp_ts\tlen\tstream\tframe",
    ]
    for p in capture:
        dump_lines.append(
            f"{p['index']}\t{p['timeSec']:.6f}\t{p['source']}\t{p['destination']}\tRTP\t"
            f"{p['ssrc']}\t{p['sequence']}\t{p['rtpTimestamp']}\t{p['length']}\t{p['stream']}\t{p['frame']}"
        )
    (DEBUG / "packet_dump.tsv").write_text("\n".join(dump_lines), encoding="utf-8")

    # Slim packets for TS (no ssrcInt)
    packets_slim = [
        {
            "index": p["index"],
            "timeSec": p["timeSec"],
            "source": p["source"],
            "destination": p["destination"],
            "protocol": "RTP",
            "ssrc": p["ssrc"],
            "sequence": p["sequence"],
            "rtpTimestamp": p["rtpTimestamp"],
            "length": p["length"],
            "stream": p["stream"],
            "frame": p["frame"],
        }
        for p in capture
    ]

    meta = {
        "seed": SEED,
        "codec": "PCMU",
        "sampleRate": SR_RTP,
        "frameMs": FRAME_MS,
        "frameSamples": FRAME_SAMPLES,
        "ssrcA": f"{SSRC_A:08X}",
        "ssrcB": f"{SSRC_B:08X}",
        "seqA0": SEQ_A0,
        "seqB0": SEQ_B0,
        "packetCount": len(packets_slim),
        "streamACount": len(frames_a),
        "streamBCount": len(frames_b),
        "sequenceErrorsA": seq_errors("A"),
        "sequenceErrorsB": seq_errors("B"),
        "jitter": {
            "A": "mild (±6ms arrival, rare local swaps)",
            "B": "heavy (local swaps + 3-cycles, ± arrivals)",
        },
        "assets": {
            "A": str(ASSET_A.relative_to(ROOT)),
            "B": str(ASSET_B.relative_to(ROOT)),
        },
        "publicPcap": "public/assets/audio/forensic/puzzle09/hv_session_capture.pcap",
        "reconstruct": {
            "minOrderQuality": 0.9,
            "requireStreamA": True,
            "requireStreamB": True,
        },
        "audio": {
            "streamA": "/assets/audio/forensic/puzzle09/stream_a_reconstructed.wav",
            "streamB": "/assets/audio/forensic/puzzle09/stream_b_reconstructed.wav",
            "streamBCaptureOrder": "/assets/audio/forensic/puzzle09/../",  # filled below via debug path note
            "mixedPreview": "/assets/audio/forensic/puzzle09/mixed_preview.wav",
        },
        "findings": {
            "separated": "Captura de Henrique contém uma sessão VoIP anômala separada do tráfego normal.",
            "anomalousKnowledge": "O interlocutor demonstra conhecimento de informação que Henrique afirma existir apenas em seu computador pessoal.",
        },
        "packets": packets_slim,
    }
    # copy capture-order B into public for workbench wrong-order playback
    write_wav_pcm(PUBLIC / "stream_b_capture_order.wav", wav_b_cap)
    meta["audio"]["streamBCaptureOrder"] = "/assets/audio/forensic/puzzle09/stream_b_capture_order.wav"

    slim = {k: v for k, v in meta.items() if k != "packets"}
    (OUT / "puzzle09_timing.json").write_text(json.dumps(slim, indent=2), encoding="utf-8")
    (PUBLIC / "capture_meta.json").write_text(json.dumps(meta), encoding="utf-8")
    TS_META.parent.mkdir(parents=True, exist_ok=True)
    # Runtime carrega packets de capture_meta.json — meta TS fica leve.
    TS_META.write_text(json.dumps(slim), encoding="utf-8")

    print(
        json.dumps(
            {
                "packetCount": meta["packetCount"],
                "streamA": meta["streamACount"],
                "streamB": meta["streamBCount"],
                "ssrcA": meta["ssrcA"],
                "ssrcB": meta["ssrcB"],
                "seqErrorsA": meta["sequenceErrorsA"],
                "seqErrorsB": meta["sequenceErrorsB"],
                "pcap": str(PUBLIC / "hv_session_capture.pcap"),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()

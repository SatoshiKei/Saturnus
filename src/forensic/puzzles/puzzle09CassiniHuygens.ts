import type { ForensicSession, ForensicSource, PacketRow, RtpStreamConfig } from '../forensicTypes'
import meta from './puzzle09Meta.json'

export const puzzle09SsrcA = meta.ssrcA as string
export const puzzle09SsrcB = meta.ssrcB as string
export const puzzle09PacketCount = meta.packetCount as number
export const puzzle09Codec = meta.codec as string

export const PUZZLE09_CAPTURE_META_URL = '/assets/audio/forensic/puzzle09/capture_meta.json'

export function mapPuzzle09Packets(
  packets: Array<Record<string, unknown>>,
): PacketRow[] {
  return packets.map((p) => ({
    index: p.index as number,
    timeSec: p.timeSec as number,
    arrival: p.timeSec as number,
    source: p.source as string,
    destination: p.destination as string,
    protocol: (p.protocol as string) ?? 'RTP',
    ssrc: p.ssrc as string,
    sequence: p.sequence as number,
    rtpTimestamp: p.rtpTimestamp as number,
    length: p.length as number,
    stream: p.stream as string,
    frame: p.frame as number,
  }))
}

export async function loadPuzzle09PacketRows(): Promise<PacketRow[]> {
  const res = await fetch(PUZZLE09_CAPTURE_META_URL)
  if (!res.ok) throw new Error(`Failed to load puzzle09 capture meta (${res.status})`)
  const data = (await res.json()) as { packets: Array<Record<string, unknown>> }
  return mapPuzzle09Packets(data.packets ?? [])
}

export const puzzle09RtpConfig: RtpStreamConfig = {
  ssrcA: puzzle09SsrcA,
  ssrcB: puzzle09SsrcB,
  codec: puzzle09Codec,
  sampleRate: meta.sampleRate as number,
  frameMs: meta.frameMs as number,
  minOrderQuality: (meta.reconstruct as { minOrderQuality: number }).minOrderQuality,
  audio: {
    streamA: (meta.audio as Record<string, string>).streamA,
    streamB: (meta.audio as Record<string, string>).streamB,
    streamBCaptureOrder: (meta.audio as Record<string, string>).streamBCaptureOrder,
    mixedPreview: (meta.audio as Record<string, string>).mixedPreview,
  },
  findings: {
    separated: (meta.findings as Record<string, string>).separated,
    anomalousKnowledge: (meta.findings as Record<string, string>).anomalousKnowledge,
  },
}

const durationSec =
  (meta.streamACount as number) * ((meta.frameMs as number) / 1000) + 2

const source: ForensicSource = {
  id: 'hv_session_capture',
  filename: 'hv_session_capture.pcap',
  displayName: 'hv_session_capture.pcap',
  type: 'packet-capture',
  durationSec,
  tracks: [{ id: 'master', name: 'CAPTURE', channel: 'packets', visible: true, gainDb: 0, pan: 0 }],
  metadata: [
    { key: 'filename', label: 'Filename', value: 'hv_session_capture.pcap' },
    { key: 'format', label: 'Format', value: 'PCAP' },
    { key: 'packets', label: 'Packets', value: String(puzzle09PacketCount) },
    { key: 'protocol', label: 'Dominant protocol', value: 'RTP / G.711 PCMU' },
    { key: 'origin', label: 'Origin', value: 'Corporate security ticket backup' },
  ],
  structure: { kind: 'pcap', emptyMessage: 'Packet structure available in Packets tab.' },
  packets: {
    emptyMessage: 'Loading packet table…',
    rows: [],
  },
  rtpStreams: puzzle09RtpConfig,
  audio: {
    sampleRate: 8000,
    channels: 1,
    seed: meta.seed as number,
    waveform: Array.from({ length: 256 }, (_, i) => Math.sin(i / 9) * 0.08),
    stems: [
      {
        id: 'FILE',
        kind: 'file',
        initialGain: 1,
        src: '/assets/audio/forensic/puzzle09/mixed_preview.wav',
      },
    ],
  },
}

export const puzzle09CassiniHuygensSession: ForensicSession = {
  id: 'puzzle-09-cassini-huygens',
  title: 'FORENSIC AUDIO / DIGITAL WORKSTATION',
  evidenceId: 'henrique_rtp_capture',
  completion: {
    kind: 'rtp-stream-separation',
    onCompleteAction: 'runCassiniHuygensAnalysis',
  },
  sources: [source],
}

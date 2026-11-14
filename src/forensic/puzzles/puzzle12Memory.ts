/**
 * Puzzle 12 — MEMÓRIA (dataset forense).
 * Proveniência da mensagem final; UI especializada: MemorySession no ForensicWorkbench.
 */

import type { ForensicSession, ForensicSource } from '../forensicTypes'
import meta from './puzzle12Meta.json'
import {
  CASE_MEDIA_CORPUS,
  CASSINI_DERIVED_META,
  FINAL_MESSAGE_META,
  MEMORY_DURATION_SEC,
  MEMORY_FINAL_SRC,
  MEMORY_REGIONS,
  MEMORY_WORD,
  isMemoryProvenanceComplete,
  isTemporalImpossibility,
  searchCaseMedia,
} from '../../data/block09/memoryPuzzle'

export const puzzle12Meta = meta

export const puzzle12Memory = {
  id: 'puzzle-12-memory',
  title: 'MEMÓRIA',
  word: MEMORY_WORD,
  durationSec: MEMORY_DURATION_SEC,
  finalSrc: MEMORY_FINAL_SRC,
  regions: MEMORY_REGIONS,
  corpus: CASE_MEDIA_CORPUS,
  cassiniDerived: CASSINI_DERIVED_META,
  finalMessage: FINAL_MESSAGE_META,
  carrier: meta.carrier,
  searchCaseMedia,
  isMemoryProvenanceComplete,
  isTemporalImpossibility,
  storyFlags: {
    available: 'block09_memory_available',
    complete: 'block09_memory_done',
    wordShown: 'block09_memory_word_shown',
  },
}

const noteSource: ForensicSource = {
  id: 'mariana_claim_recent',
  filename: 'mariana_claim_recent.wav',
  displayName: 'mariana_claim_recent.wav',
  type: 'audio',
  durationSec: MEMORY_DURATION_SEC,
  tracks: [{ id: 'master', name: 'MASTER', channel: '1 / mono', visible: true, gainDb: 0, pan: 0 }],
  metadata: [
    { key: 'filename', label: 'Filename', value: 'mariana_claim_recent.wav' },
    { key: 'format', label: 'Format', value: 'WAV PCM' },
    { key: 'origin', label: 'Origin', value: 'Unknown channel — attributed to Mariana' },
    {
      key: 'note',
      label: 'Note',
      value: 'Specialized provenance workspace active. Use center panel tools.',
    },
  ],
  structure: {
    kind: 'wav',
    emptyMessage: 'Provenance analysis runs in the specialized workspace.',
  },
  audio: {
    sampleRate: (meta.sampleRate as number) ?? 22050,
    channels: 1,
    seed: meta.seed as number,
    waveform: Array.from({ length: 128 }, (_, i) => Math.sin(i / 9) * 0.08),
    stems: [
      {
        id: 'FILE',
        kind: 'file',
        initialGain: 1,
        src: MEMORY_FINAL_SRC,
      },
    ],
  },
}

export const puzzle12MemorySession: ForensicSession = {
  id: 'puzzle-12-memory',
  title: 'FORENSIC AUDIO / DIGITAL WORKSTATION',
  evidenceId: 'mariana_recent_recording_claim',
  sources: [noteSource],
}

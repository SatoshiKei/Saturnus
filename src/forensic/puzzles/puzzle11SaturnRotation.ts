/**
 * Puzzle 11 — Rotação de Saturno.
 * Dataset: passagens, trem, CAD, AVL, rádio, fingerprint → VTR-14.
 * Lógica específica fica aqui / em rotationPuzzle; não na UI genérica.
 */

import type { ForensicSession, ForensicSource } from '../forensicTypes'
import meta from './puzzle11Meta.json'
import {
  ROTATION_CALLSIGN,
  ROTATION_CROSSINGS,
  ROTATION_CAD,
  ROTATION_VEHICLES,
  ROTATION_AVL,
  ROTATION_AUDIO,
  compareTrainFingerprints,
  evaluateRotationCase,
  type RotationAudioId,
  type RotationCrossingId,
  type RotationVehicleId,
} from '../../data/block08/rotationPuzzle'

export const puzzle11Meta = meta

export const puzzle11SaturnRotation = {
  id: 'puzzle-11-saturn-rotation',
  title: 'Rotação de Saturno',
  expectedVehicle: ROTATION_CALLSIGN as RotationVehicleId,
  crossings: ROTATION_CROSSINGS,
  cad: ROTATION_CAD,
  vehicles: ROTATION_VEHICLES,
  avl: ROTATION_AVL,
  audio: ROTATION_AUDIO,
  trainWindow: meta.trainWindow,
  cadIncident: meta.cadIncident,
  crossingId: meta.crossingId as RotationCrossingId,
  fingerprintThreshold: meta.fingerprintThreshold as number,
  storyFlags: {
    available: 'block08_rotation_available',
    complete: 'block08_rotation_done',
    scaleUnlocked: 'block08_scale_search_unlocked',
    augustoRevealed: 'block08_augusto_linked',
  },
  compareTrainFingerprints,
  evaluateRotationCase,
}

export type { RotationAudioId, RotationCrossingId, RotationVehicleId }

const noteSource: ForensicSource = {
  id: 'rui_police_approach_records',
  filename: 'approach_window_bundle.log',
  displayName: 'approach_window_bundle.log',
  type: 'data',
  durationSec: 12,
  metadata: [
    { key: 'filename', label: 'Filename', value: 'approach_window_bundle.log' },
    { key: 'format', label: 'Format', value: 'Institutional records bundle' },
    {
      key: 'origin',
      label: 'Origin',
      value: 'Passagem ferroviária / CAD / AVL / rádio — janela da abordagem',
    },
    {
      key: 'note',
      label: 'Note',
      value: 'Specialized rotation workspace active. Use center panel tools.',
    },
  ],
  structure: {
    kind: 'generic',
    emptyMessage: 'Rotation reconstruction runs in the specialized workspace.',
  },
  audio: {
    sampleRate: 22050,
    channels: 1,
    seed: 11,
    waveform: Array.from({ length: 128 }, (_, i) => Math.sin(i / 6) * 0.04),
    stems: [],
  },
}

export const puzzle11SaturnRotationSession: ForensicSession = {
  id: 'puzzle-11-saturn-rotation',
  title: 'FORENSIC AUDIO / DIGITAL WORKSTATION',
  evidenceId: 'rui_police_approach_records',
  sources: [noteSource],
}

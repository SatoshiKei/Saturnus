/**
 * Puzzle 11 — Rotação de Saturno.
 * Dataset: passagens, trem, CAD, AVL, rádio, fingerprint → VTR-14.
 * Lógica específica fica aqui / em rotationPuzzle; não na UI genérica.
 */

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

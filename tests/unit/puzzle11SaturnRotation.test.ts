import { describe, expect, it, beforeEach } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  CAD_FLAME_ID,
  CORRECT_CROSSING,
  RAILWAY_PASSAGES,
  ROTATION_AVL,
  ROTATION_CAD,
  ROTATION_CALLSIGN,
  ROTATION_CROSSINGS,
  ROTATION_VEHICLES,
  compareTrainFingerprints,
  evaluateRotationCase,
} from '../../src/data/block08/rotationPuzzle'
import { ruiBeats } from '../../src/data/block08/ruiInterview'
import { seedAchievements } from '../../src/data/game/seedAchievements'
import { seedEvidenceCatalog } from '../../src/data/game/seedEvidence'
import { seedDocuments } from '../../src/data/game/seedDocuments'
import { createInitialState } from '../../src/game/state/initialState'
import {
  __setStateForTests,
  getInvestigationState,
  openDocument,
  resetGame,
} from '../../src/game/state/investigationStore'
import { onDocumentConsulted } from '../../src/game/story/documentConsultHooks'
import {
  onAccidentReflectionDone,
  onRotationSolved,
  onScaleLinksAugusto,
} from '../../src/game/story/block08Handlers'
import { puzzle01CassiniSession } from '../../src/forensic/puzzles/puzzle01Cassini'
import { puzzle09CassiniHuygensSession } from '../../src/forensic/puzzles/puzzle09CassiniHuygens'
import { getForensicSessionForEvidence } from '../../src/forensic/forensicRegistry'

const ROOT = resolve(__dirname, '../..')
const TRAIN = resolve(ROOT, 'src/assets/audios/p11/Train Sounds.mp3')
const PUB = resolve(ROOT, 'public/assets/audio/forensic/puzzle11')

describe('Puzzle 11 — ROTAÇÃO DE SATURNO', () => {
  beforeEach(() => {
    resetGame()
    __setStateForTests(createInitialState())
  })

  it('A: passagens incompatíveis elimináveis geograficamente', () => {
    const toward = ROTATION_CROSSINGS.filter((c) => c.towardGuardrail)
    expect(toward).toHaveLength(1)
    expect(toward[0].id).toBe(CORRECT_CROSSING)
    expect(RAILWAY_PASSAGES.some((p) => p.crossingId === CORRECT_CROSSING)).toBe(true)
  })

  it('B: Train Sounds + derivados VTR-14 existem', () => {
    expect(existsSync(TRAIN)).toBe(true)
    expect(existsSync(resolve(PUB, 'train_distant_radio_reference.wav'))).toBe(true)
    expect(existsSync(resolve(PUB, 'vtr14_radio_window.wav'))).toBe(true)
    expect(existsSync(resolve(PUB, 'vtr08_radio_window.wav'))).toBe(true)
    expect(existsSync(resolve(PUB, 'vtr21_radio_window.wav'))).toBe(true)
  })

  it('C/D: fingerprint ref×VTR-14 forte; 08/21 fracos', () => {
    const ok = compareTrainFingerprints('train_ref', 'vtr14')
    expect(ok.match).toBe(true)
    expect(ok.score).toBeGreaterThanOrEqual(0.72)
    expect(compareTrainFingerprints('train_ref', 'vtr08').match).toBe(false)
    expect(compareTrainFingerprints('train_ref', 'vtr21').match).toBe(false)
  })

  it('E: CAD contém veículo em chamas', () => {
    const cad = ROTATION_CAD.find((c) => c.id === CAD_FLAME_ID)
    expect(cad?.priority).toBe('urgent')
    expect(cad?.summary.toLowerCase()).toMatch(/chamas|fogo/)
    expect(cad?.unitsNoted.join(' ')).not.toMatch(/VTR-14/)
  })

  it('F/G: VTR-14 trajeto + direção compatíveis', () => {
    const v14 = ROTATION_VEHICLES.find((v) => v.id === 'VTR-14')!
    expect(v14.flameRouteOk).toBe(true)
    expect(v14.crossingProximityOk).toBe(true)
    expect(v14.exitDirectionOk).toBe(true)
    const avl = ROTATION_AVL.filter((p) => p.unit === 'VTR-14')
    expect(avl.some((p) => /chamas|CAD-1847/i.test(p.event + p.location))).toBe(true)
    expect(avl.some((p) => /contrário|saída/i.test(p.event))).toBe(true)
  })

  it('H: VTR-14 é única combinação final', () => {
    const full = evaluateRotationCase({
      crossingId: CORRECT_CROSSING,
      cadId: CAD_FLAME_ID,
      avlUnitsOpened: ['VTR-14'],
      fingerprintVehicle: 'VTR-14',
      eliminated: ['VTR-08', 'VTR-21'],
    })
    expect(full.canConfirm).toBe(true)
    expect(full.vtr14Only).toBe(true)
    expect(
      evaluateRotationCase({
        crossingId: CORRECT_CROSSING,
        cadId: CAD_FLAME_ID,
        avlUnitsOpened: ['VTR-14'],
        fingerprintVehicle: 'VTR-14',
        eliminated: ['VTR-08'],
      }).canConfirm,
    ).toBe(false)
  })

  it('I: descobrir VTR-14 não revela Augusto', () => {
    onAccidentReflectionDone()
    onRotationSolved()
    const s = getInvestigationState()
    expect(s.flags.block08_rotation_done).toBe(true)
    expect(s.flags.block08_augusto_linked).toBeFalsy()
    expect(s.evidenceOwned).toContain('approach_callsign_reconstructed')
    expect(s.evidenceOwned).not.toContain('scale_links_callsign_to_augusto')
  })

  it('J/K: escala revela Augusto + finding depois', () => {
    onAccidentReflectionDone()
    onRotationSolved()
    openDocument('doc-escala-vtr14')
    onDocumentConsulted('doc-escala-vtr14')
    onScaleLinksAugusto()
    const s = getInvestigationState()
    expect(s.flags.block08_augusto_linked).toBe(true)
    expect(s.evidenceOwned).toContain('scale_links_callsign_to_augusto')
    const doc = seedDocuments.find((d) => d.id === 'doc-escala-vtr14')!
    expect(doc.blocks.some((b) => /Augusto Nogueira/.test(b.text))).toBe(true)
    expect(doc.blocks.some((b) => /Eu parei o Rui/.test(b.text))).toBe(true)
    const ach = seedAchievements.find((a) => a.id === 'ach-rotacao-saturno')!
    expect(ach.unlocked(s)).toBe(true)
    expect(ach.title).toBe('ROTAÇÃO DE SATURNO')
  })

  it('narrativa: Rui explica trem/rádio sem códigos nem VTR', () => {
    const stop = ruiBeats.stop.map((b) => b.text).join('\n')
    const after = ruiBeats.after.map((b) => b.text).join('\n')
    expect(stop).toMatch(/trem|passagem/i)
    expect(stop).toMatch(/fogo|chamas/i)
    expect(stop).toMatch(/retrovisor|sentido contrário/i)
    expect(stop).not.toMatch(/VTR-14|CAD-1847|Augusto/)
    expect(after).toMatch(/não lembro nome|Nem número/i)
    expect(after).not.toMatch(/VTR-14/)
    expect(ruiBeats.stop.some((b) => b.speaker === 'Augusto' && /Por que te deixaram seguir/.test(b.text))).toBe(
      true,
    )
  })

  it('L: puzzles 01–10 registry intacto + evidence puzzle-11', () => {
    expect(puzzle01CassiniSession.id).toBeTruthy()
    expect(puzzle09CassiniHuygensSession.id).toBeTruthy()
    expect(getForensicSessionForEvidence('emergency_call_raw')).toBeTruthy()
    const ev = seedEvidenceCatalog.find((e) => e.id === 'police_clock_drift_logs')!
    expect(ev.puzzleMeta?.puzzleId).toBe('puzzle-11-rotation')
    expect(ROTATION_CALLSIGN).toBe('VTR-14')
  })
})

import { describe, expect, it, beforeEach } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  createInitialUiState,
  findSimilarCycleRegions,
  evaluateCommonPatternSelection,
  evaluateCycleDifference,
  cycleDifferenceComplete,
} from '../../src/forensic/forensicEngine'
import {
  puzzle08EnceladusSession,
  puzzle08CycleAnalysis,
  puzzle08AnomalyIndex,
  puzzle08CycleCount,
  puzzle08DurationSec,
  puzzle08RecoveredText,
} from '../../src/forensic/puzzles/puzzle08Enceladus'
import { getForensicSessionForEvidence } from '../../src/forensic/forensicRegistry'
import { puzzle01CassiniSession } from '../../src/forensic/puzzles/puzzle01Cassini'
import { puzzle06HexagonSession } from '../../src/forensic/puzzles/puzzle06Hexagon'
import { puzzle07ShepherdMoonsSession } from '../../src/forensic/puzzles/puzzle07ShepherdMoons'
import { seedEvidenceCatalog } from '../../src/data/game/seedEvidence'
import { seedAchievements } from '../../src/data/game/seedAchievements'
import { callScripts } from '../../src/data/calls'
import {
  __setStateForTests,
  getInvestigationState,
  resetGame,
} from '../../src/game/state/investigationStore'
import { createInitialState } from '../../src/game/state/initialState'
import {
  deliverAnonWhatsApp,
  receiveAnonHospitalAudio,
  onEnceladusSolved,
  onJuliaRicardoAudioDone,
  onRenataCallDone,
  onRicardoRecordFound,
} from '../../src/game/story/block07Handlers'
import { runPoliceSearch } from '../../src/game/search/runSearch'

const ROOT = resolve(__dirname, '../..')
const PUBLIC = resolve(ROOT, 'public/assets/audio/forensic/puzzle08')
const VOICE = resolve(ROOT, 'src/assets/audios/p8/Renata - Ricardo.mp3')
const cfg = puzzle08CycleAnalysis

describe('Puzzle 08 — ENCELADUS', () => {
  beforeEach(() => {
    resetGame()
    __setStateForTests(createInitialState())
  })

  it('A: Renata voice asset + public masters exist', () => {
    expect(existsSync(VOICE)).toBe(true)
    expect(existsSync(resolve(PUBLIC, 'p08_enceladus_final.wav'))).toBe(true)
    expect(existsSync(resolve(PUBLIC, 'AUD_0008.wav'))).toBe(true)
    expect(existsSync(resolve(PUBLIC, 'p08_residual_preview.wav'))).toBe(true)
  })

  it('B: duration / cycles / anomaly / recovered speech', () => {
    expect(puzzle08DurationSec).toBe(48)
    expect(puzzle08CycleCount).toBe(8)
    expect(puzzle08AnomalyIndex).toBe(5)
    expect(puzzle08RecoveredText).toBe('Ricardo')
    expect(cfg.boundaries).toHaveLength(8)
    expect(cfg.differenceScores[5]!).toBeGreaterThan(
      Math.max(...cfg.differenceScores.filter((_, i) => i !== 5)),
    )
  })

  it('C: WhatsApp first — evidence not on Bancada until forward', () => {
    const s0 = getInvestigationState()
    __setStateForTests({
      ...s0,
      flags: { ...s0.flags, block07_julia_camila_checked: true },
    })
    deliverAnonWhatsApp()
    const afterWa = getInvestigationState()
    expect(afterWa.flags.block07_anon_message_received).toBe(true)
    expect(afterWa.evidenceOwned.includes('anon_hospital_burst_audio')).toBe(false)

    receiveAnonHospitalAudio()
    const afterFwd = getInvestigationState()
    expect(afterFwd.evidenceOwned.includes('anon_hospital_burst_audio')).toBe(true)
    expect(afterFwd.flags.block07_enceladus_available).toBe(true)

    const ev = seedEvidenceCatalog.find((e) => e.id === 'anon_hospital_burst_audio')!
    expect(ev.displayFileName).toBe('AUD_0008.wav')
    expect(ev.audioSrc).toContain('puzzle08/AUD_0008.wav')
  })

  it('D: bad selection fails Find Similar; good selection finds ~8', () => {
    const tooShort = findSimilarCycleRegions(cfg, { startSec: 0, endSec: 1.5 })
    expect(tooShort.ok).toBe(false)

    const tooLong = findSimilarCycleRegions(cfg, { startSec: 0, endSec: 14 })
    expect(tooLong.ok).toBe(false)

    const good = findSimilarCycleRegions(cfg, { startSec: 0.2, endSec: 5.8 })
    expect(good.ok).toBe(true)
    expect(good.regions.length).toBe(8)
    expect(good.message).toBe('Similar regions: 8')
  })

  it('E: Stack residual — anomaly higher; no auto labels required', () => {
    const scores = cfg.differenceScores
    const anomaly = scores[puzzle08AnomalyIndex]!
    for (let i = 0; i < scores.length; i++) {
      if (i === puzzle08AnomalyIndex) continue
      expect(anomaly).toBeGreaterThan(scores[i]!)
    }
  })

  it('F: clean reference + anomaly Difference recovers Ricardo only', () => {
    const normals = [0, 1, 2, 3, 4, 6, 7]
    const clean = evaluateCommonPatternSelection(cfg, normals)
    expect(clean.clean).toBe(true)

    const dirty = evaluateCommonPatternSelection(cfg, [...normals, 5])
    expect(dirty.clean).toBe(false)
    expect(dirty.quality).toBeLessThan(clean.quality)

    const badTarget = evaluateCycleDifference(cfg, 0, normals, clean.quality)
    expect(badTarget.ok).toBe(false)

    const contaminated = evaluateCycleDifference(cfg, 5, [...normals, 5], dirty.quality)
    expect(contaminated.ok).toBe(false)

    const ok = evaluateCycleDifference(cfg, 5, normals, clean.quality)
    expect(ok.ok).toBe(true)
    expect(ok.ricardoClarity).toBeGreaterThanOrEqual(cfg.difference.ricardoClarityThreshold)

    let ui = createInitialUiState(puzzle08EnceladusSession)
    ui = {
      ...ui,
      referenceCycleIndexes: normals,
      commonPatternQuality: clean.quality,
      differenceTargetIndex: 5,
      differenceQuality: ok.quality,
      ricardoClarity: ok.ricardoClarity,
      cycleDifferenceDone: true,
      recoveredSpeech: [
        {
          segmentId: cfg.recoveredSpeech.segmentId,
          text: cfg.recoveredSpeech.text,
          startSec: cfg.recoveredSpeech.startSec,
          unlockedAt: 1,
        },
      ],
    }
    expect(cycleDifferenceComplete(puzzle08EnceladusSession, ui)).toBe(true)
    expect(ui.recoveredSpeech.map((r) => r.text)).toEqual(['Ricardo'])
    expect(ui.recoveredSpeech.some((r) => r.text.includes('espera'))).toBe(false)
  })

  it('G: solve → Julia task; Julia → Renata; Renata → archive; no auto Freitas search', () => {
    const base = getInvestigationState()
    __setStateForTests({
      ...base,
      flags: {
        ...base.flags,
        block07_julia_camila_checked: true,
        block07_anon_message_received: true,
        block07_anon_audio_received: true,
        block07_enceladus_available: true,
      },
      evidenceOwned: [...base.evidenceOwned, 'anon_hospital_burst_audio'],
    })

    onEnceladusSolved()
    let s = getInvestigationState()
    expect(s.flags.block07_enceladus_done).toBe(true)
    expect(s.evidenceOwned.includes('anon_audio_ricardo_name')).toBe(true)
    expect(s.tasks.some((t) => t.id === 'task_julia_ricardo_audio' && !t.completed)).toBe(true)
    expect(s.flags.block07_hospital_archive_unlocked).toBeFalsy()
    expect(s.flags.block07_ricardo_found).toBeFalsy()

    const ricardoSearch = runPoliceSearch('ricardo', s)
    const freitasHit = ricardoSearch.hits.some((r) =>
      (r.title + r.snippet).toLowerCase().includes('freitas'),
    )
    expect(freitasHit).toBe(false)

    onJuliaRicardoAudioDone()
    s = getInvestigationState()
    expect(s.evidenceOwned.includes('renata_voice_on_burst')).toBe(true)
    expect(s.flags.block07_renata_call_unlocked).toBe(true)
    expect(s.flags.block07_hospital_archive_unlocked).toBeFalsy()

    onRenataCallDone()
    s = getInvestigationState()
    expect(s.evidenceOwned.includes('ricardo_old_patient_mariana_shift')).toBe(true)
    expect(s.flags.block07_hospital_archive_unlocked).toBe(true)

    onRicardoRecordFound()
    s = getInvestigationState()
    expect(s.flags.block07_ricardo_found).toBe(true)
    expect(s.people.ricardo?.status).toBeTruthy()
  })

  it('H: Julia/Renata call scripts preserve human recognition chain', () => {
    const julia = callScripts.find((c) => c.id === 'call-julia-ricardo-audio')!
    expect(julia.lines.some((l) => /Renata/i.test(l.text))).toBe(true)
    expect(julia.lines.every((l) => !/paciente antigo/i.test(l.text))).toBe(true)

    const renata = callScripts.find((c) => c.id === 'call-renata-farias')!
    expect(renata.lines.some((l) => /paciente/i.test(l.text))).toBe(true)
    expect(renata.lines.every((l) => !/Ricardo Freitas/i.test(l.text))).toBe(true)
  })

  it('I: registry + achievement + puzzles 01/06/07 untouched kinds', () => {
    expect(getForensicSessionForEvidence('anon_hospital_burst_audio')?.id).toBe(
      'puzzle-08-enceladus',
    )
    expect(puzzle08EnceladusSession.completion?.kind).toBe('cycle-difference')
    expect(puzzle01CassiniSession.completion?.kind).not.toBe('cycle-difference')
    expect(puzzle06HexagonSession.completion?.kind).toBe('spectrogram-survey')
    expect(puzzle07ShepherdMoonsSession.completion?.kind).toBe('rf-channel-extract')

    const ach = seedAchievements.find((a) => a.id === 'ach-enceladus')!
    expect(ach.title).toBe('ENCELADUS')
    const unlocked = ach.unlocked({
      ...createInitialState(),
      flags: { block07_enceladus_done: true },
      evidenceOwned: ['anon_audio_ricardo_name'],
    } as never)
    expect(unlocked).toBe(true)
  })
})

import { describe, expect, it, beforeEach } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { speechRecoveryComplete } from '../../src/forensic/forensicEngine'
import {
  puzzle03AnelsSession,
  puzzle03SpeechSegments,
  puzzle03Timing,
  PUZZLE03_CLUB_VOICE_ISOLATED_SRC,
} from '../../src/forensic/puzzles/puzzle03Anels'
import voiceMeta from '../../src/forensic/puzzles/puzzle03VoiceMeta.json'
import { getForensicSessionForEvidence } from '../../src/forensic/forensicRegistry'
import { createInitialState } from '../../src/game/state/initialState'
import {
  __setStateForTests,
  getInvestigationState,
  resetGame,
} from '../../src/game/state/investigationStore'
import {
  finishVerticeSetCrossRef,
  onRafaelClubAudioPlayed,
  runProvisionalRingsAnalysis,
} from '../../src/game/story/block02Handlers'
import { seedEvidenceCatalog } from '../../src/data/game/seedEvidence'

const ROOT = resolve(__dirname, '../..')
const recording = puzzle03AnelsSession.sources[0]!

describe('Puzzle 03 — ANÉIS (voz na balada)', () => {
  beforeEach(() => {
    resetGame()
    __setStateForTests(createInitialState())
  })

  it('proveniência: Mariana → Rafael → Augusto', () => {
    const e3 = seedEvidenceCatalog.find((e) => e.id === 'rec_vtx_old_01')!
    expect(e3.sourceType).toBe('augusto-whatsapp')
    const meta = recording.metadata?.map((m) => m.value).join(' ').toLowerCase()
    expect(meta).toMatch(/whatsapp/)
    expect(meta).toMatch(/rafael/)
  })

  it('usa sequência Nico gravada (bunda → maluco → juntar), sem TTS', () => {
    expect(voiceMeta.carrier.noTts).toBe(true)
    const clips = voiceMeta.carrier.clips as string[]
    expect(clips.map((c) => c.replace(/.*\//, ''))).toEqual([
      'nico_01_bate_com_a_bunda.wav',
      'nico_02_e_ai_maluco.wav',
      'nico_03_vamos_juntar.wav',
    ])
    for (const rel of clips) {
      expect(existsSync(resolve(ROOT, rel))).toBe(true)
    }
    expect(voiceMeta.carrier.excluded as string[]).toHaveLength(0)
  })

  it('assets forenses publicados', () => {
    for (const url of [
      voiceMeta.audio.final,
      voiceMeta.audio.isolated,
      voiceMeta.audio.stemBackground,
      voiceMeta.audio.stemVoiceBuried,
    ]) {
      expect(existsSync(resolve(ROOT, 'public', String(url).replace(/^\//, '')))).toBe(true)
    }
    expect(PUZZLE03_CLUB_VOICE_ISOLATED_SRC).toBe(voiceMeta.audio.isolated)
  })

  it('sessão: speech-recovery — um segmento, sem fingerprint de pessoa', () => {
    expect(puzzle03AnelsSession.completion?.kind).toBe('speech-recovery')
    expect(puzzle03SpeechSegments).toHaveLength(1)
    expect(puzzle03SpeechSegments[0]!.text).not.toMatch(/nico/i)
    expect(getForensicSessionForEvidence('rec_vtx_old_01')?.completion?.kind).toBe('speech-recovery')
    expect(puzzle03Timing.voiceStartSec).toBeGreaterThan(90)
  })

  it('conclusão técnica e narrativa: trecho isolado, Nico só na 2ª visita', () => {
    onRafaelClubAudioPlayed()
    __setStateForTests({
      ...getInvestigationState(),
      evidenceOwned: ['rec_vtx_old_01'],
    })
    const seg = puzzle03SpeechSegments[0]!
    const recovered = [
      {
        segmentId: seg.id,
        text: seg.text,
        startSec: seg.startSec,
        unlockedAt: Date.now(),
      },
    ]
    expect(speechRecoveryComplete(recovered, puzzle03SpeechSegments)).toBe(true)
    runProvisionalRingsAnalysis()
    const s = getInvestigationState()
    expect(s.flags.block02_rings_provisional).toBe(true)
    expect(s.evidenceOwned).toContain('club_voice_isolated')
    expect(s.evidenceOwned).not.toContain('nico_dj_identified')
    finishVerticeSetCrossRef()
    expect(getInvestigationState().evidenceOwned).toContain('nico_dj_identified')
  })
})
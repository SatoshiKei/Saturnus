import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  applyCanonicalPuzzleCompletion,
  CANONICAL_PUZZLE_IDS,
  CANONICAL_PUZZLES,
  puzzleHasRevealStage,
  puzzleIdForEvidence,
  type CanonicalPuzzleId,
} from '../../src/forensic/canonicalPuzzleCompletion'
import { buildCassiniStreamBArtifact, CASSINI_STREAM_B_ARTIFACT_ID } from '../../src/forensic/derivedArtifact'
import { createDerivedRtpStream, evaluateRtpReconstruction } from '../../src/forensic/forensicEngine'
import { puzzle01CassiniSession } from '../../src/forensic/puzzles/puzzle01Cassini'
import { puzzle03DesignIsFixed } from '../../src/forensic/puzzles/puzzle03Fingerprint'
import {
  mapPuzzle09Packets,
  puzzle09CassiniHuygensSession,
  puzzle09RtpConfig,
  puzzle09SsrcB,
} from '../../src/forensic/puzzles/puzzle09CassiniHuygens'
import type { InvestigationState } from '../../src/game/types'
import {
  buildCanonicalCheckpointState,
  CANONICAL_STORY_MANIFEST,
} from '../../src/game/story/canonicalStoryManifest'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

/** Checkpoint canônico imediatamente anterior ao passo que resolve o puzzle. */
function preStateFor(pid: CanonicalPuzzleId): { id: string; state: InvestigationState } {
  const idx = CANONICAL_STORY_MANIFEST.findIndex((c) =>
    c.steps.some((s) => 'puzzle' in s && s.puzzle === pid),
  )
  expect(idx, `${pid} no manifesto`).toBeGreaterThan(0)
  const id = CANONICAL_STORY_MANIFEST[idx - 1]!.id
  return { id, state: buildCanonicalCheckpointState(id) }
}

/**
 * Resultados essenciais da resolução legítima (o que os handlers reais ligam).
 * Fonte: runProvisional*Analysis / run*Reconstruct / on*Solved nos blockNNHandlers.
 */
const LEGIT: Record<
  CanonicalPuzzleId,
  { flags: string[]; evidence: string[]; achievements: string[]; speechFor?: string[] }
> = {
  P01: {
    flags: ['block01_emergency_provisional'],
    evidence: ['emergency_call_restored'],
    achievements: ['ach-cassini-division'],
    speechFor: ['emergency_call_raw'],
  },
  P02: {
    flags: ['block02_rafael_forward_provisional'],
    evidence: ['rafael_recording_vertice_tag'],
    achievements: ['ach-iapetus'],
    speechFor: ['rafael_voice_to_augusto'],
  },
  P03: {
    flags: ['block02_rings_provisional'],
    evidence: ['nico_dj_identified', 'rec_vtx_set_nico_match'],
    achievements: ['ach-rings'],
  },
  P04: {
    flags: ['block03_janus_done', 'block03_reanalysis_unlocked'],
    evidence: ['vertice_clocks_unsynced', 'vertice_timeline_inconsistent'],
    achievements: ['ach-janus-epimetheus'],
  },
  P05: {
    flags: ['block03_saturnalia_done', 'block03_complete'],
    evidence: ['protest_masked_core', 'morsa_unidentified'],
    achievements: ['ach-saturnalia'],
  },
  P06: {
    flags: ['block04_hex_spectrograms_inspected'],
    evidence: ['hex_spectral_patterns'],
    achievements: [],
  },
  P07: {
    flags: ['block06_pastor_extracted', 'block06_pastor_done', 'block06_operation_ready'],
    evidence: ['pastor_token_g17n', 'galpao17_operational_site'],
    achievements: ['ach-shepherd-moons'],
  },
  P08: {
    flags: ['block07_enceladus_done', 'block07_julia_ricardo_audio_unlocked'],
    evidence: ['anon_audio_ricardo_name'],
    achievements: ['ach-enceladus'],
  },
  P09: {
    flags: ['block07_cassini_done'],
    evidence: ['henrique_two_rtp_sessions', 'system_similar_to_mariana_unknown'],
    achievements: ['ach-cassini-huygens'],
  },
  P10: {
    flags: ['block08_rings_timeline_solved'],
    evidence: ['protest_timeline_reconstructed'],
    achievements: [],
  },
  P11: {
    flags: ['block08_rotation_done', 'block08_augusto_linked'],
    evidence: ['approach_callsign_reconstructed', 'scale_links_callsign_to_augusto'],
    achievements: ['ach-rotacao-saturno'],
  },
  P12: {
    flags: ['block09_memory_done'],
    evidence: ['final_audio_impossible_provenance', 'memory_word_revealed'],
    achievements: ['ach-memoria'],
  },
}

describe('DEV · COMPLETE PUZZLE — P01–P12', () => {
  it('cobre os doze puzzles', () => {
    expect(CANONICAL_PUZZLE_IDS).toEqual([
      'P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P07', 'P08', 'P09', 'P10', 'P11', 'P12',
    ])
  })

  for (const pid of CANONICAL_PUZZLE_IDS) {
    it(`${pid}: produz os resultados essenciais da resolução legítima`, () => {
      const { id, state: pre } = preStateFor(pid)
      const def = CANONICAL_PUZZLES[pid]
      expect(pre.flags[def.doneFlag], `${pid} ainda aberto em ${id}`).toBeFalsy()

      const { state, report } = applyCanonicalPuzzleCompletion(pid, pre)
      expect(report.blocked, JSON.stringify(report)).toBeUndefined()
      expect(report.ok, JSON.stringify(report)).toBe(true)
      expect(state.flags[def.doneFlag]).toBe(true)

      const legit = LEGIT[pid]
      for (const f of legit.flags) expect(state.flags[f], `${pid} flag ${f}`).toBe(true)
      for (const e of legit.evidence) expect(state.evidenceOwned, `${pid} evidência ${e}`).toContain(e)
      for (const a of legit.achievements) expect(state.achievementUnlocks?.[a], `${pid} conquista ${a}`).toBeTruthy()
      for (const ev of legit.speechFor ?? []) {
        expect(state.forensicRecoveredSpeech?.[ev]?.length, `${pid} speech ${ev}`).toBeGreaterThan(0)
      }
      expect(state.devPuzzleCompletions?.[pid]?.stages.length).toBeGreaterThan(0)
    })
  }

  it('é idempotente: reaplicar não muda o estado de história', () => {
    const { state: pre } = preStateFor('P08')
    const once = applyCanonicalPuzzleCompletion('P08', pre).state
    const twice = applyCanonicalPuzzleCompletion('P08', once)
    expect(twice.state.flags).toEqual(once.flags)
    expect(twice.state.evidenceOwned).toEqual(once.evidenceOwned)
  })

  it('bloqueia quando a fonte ainda não foi adquirida', () => {
    const early = buildCanonicalCheckpointState('b01-start')
    for (const pid of ['P02', 'P05', 'P09', 'P12'] as const) {
      const { state, report } = applyCanonicalPuzzleCompletion(pid, early)
      expect(report.blocked, pid).toBeTruthy()
      expect(state.flags[CANONICAL_PUZZLES[pid].doneFlag]).toBeFalsy()
    }
  })

  it('P01 recupera todos os segmentos de fala', () => {
    const { state: pre } = preStateFor('P01')
    const { state } = applyCanonicalPuzzleCompletion('P01', pre)
    const expected = puzzle01CassiniSession.sources.find((s) => s.speechSegments?.length)!.speechSegments!
    const got = state.forensicRecoveredSpeech?.emergency_call_raw ?? []
    expect(got.map((g) => g.segmentId).sort()).toEqual(expected.map((s) => s.id).sort())
  })

  it('P03 marca devBypass enquanto o design dual-track estiver pendente (sem fingir FIXED)', () => {
    const { state: pre } = preStateFor('P03')
    const { state, report } = applyCanonicalPuzzleCompletion('P03', pre)
    if (puzzle03DesignIsFixed()) {
      expect(report.devBypass).toBeUndefined()
    } else {
      expect(report.devBypass?.detail).toMatch(/PENDING_ASSET/)
      expect(state.devPuzzleCompletions?.P03?.devBypass).toBeTruthy()
    }
    expect(state.flags.block02_rings_provisional).toBe(true)
  })

  it('P06 sem laudo da Perícia só faz o survey; com acesso ao diário o PIN fecha o Hexágono', () => {
    const { state: pre } = preStateFor('P06')
    const surveyOnly = applyCanonicalPuzzleCompletion('P06', pre)
    expect(surveyOnly.report.skipped.map((s) => s.stage)).toContain('diary-pin')
    expect(surveyOnly.state.flags.block04_hexagon_done).toBeFalsy()
    expect(surveyOnly.state.phones.mariana.diaryUnlocked).toBe(false)

    const withAccess = buildCanonicalCheckpointState('b04-hidden-app')
    const full = applyCanonicalPuzzleCompletion('P06', withAccess)
    expect(full.report.applied).toContain('diary-pin')
    expect(full.state.flags.block04_hexagon_done).toBe(true)
    expect(full.state.phones.mariana.diaryUnlocked).toBe(true)
    expect(full.state.evidenceOwned).toContain('hidden_diary_recovered')
    expect(full.state.achievementUnlocks?.['ach-hexagon']).toBeTruthy()
  })

  it('P10: default não auto-exibe a revelação; includeReveal marca a cena', () => {
    expect(puzzleHasRevealStage('P10')).toBe(true)
    const { state: pre } = preStateFor('P10')
    const tech = applyCanonicalPuzzleCompletion('P10', pre)
    expect(tech.state.flags.block08_rings_timeline_solved).toBe(true)
    expect(tech.state.flags.block08_morsa_continuity_confirmed).toBeFalsy()
    expect(tech.state.evidenceOwned).not.toContain('morsa_was_andre')
    expect(tech.report.applied).toEqual(['route'])

    const seen = applyCanonicalPuzzleCompletion('P10', pre, { includeReveal: true })
    expect(seen.state.flags.block08_morsa_continuity_confirmed).toBe(true)
    expect(seen.state.evidenceOwned).toContain('morsa_was_andre')
    expect(seen.state.achievementUnlocks?.['ach-ordem-aneis']).toBeTruthy()
  })

  it('P11 `through: vtr14` não abre a escala antes da hora', () => {
    const { state: pre } = preStateFor('P11')
    const { state } = applyCanonicalPuzzleCompletion('P11', pre, { through: 'vtr14' })
    expect(state.flags.block08_rotation_done).toBe(true)
    expect(state.evidenceOwned).not.toContain('scale_links_callsign_to_augusto')
  })

  it('mapeia arquivos da bancada para o puzzle certo', () => {
    expect(puzzleIdForEvidence('emergency_call_raw')).toBe('P01')
    expect(puzzleIdForEvidence('rafael_forward_from_mariana')).toBe('P02')
    expect(puzzleIdForEvidence('police_clock_drift_logs')).toBe('P11')
  })
})

describe('P09 → P12: artefato derivado cassini-stream-b', () => {
  it('o artefato DEV é idêntico ao da reconstrução legítima do PCAP (capture_meta.json)', () => {
    const { state: pre } = preStateFor('P09')
    expect(pre.forensicDerivedArtifacts?.[CASSINI_STREAM_B_ARTIFACT_ID]).toBeUndefined()
    const { state } = applyCanonicalPuzzleCompletion('P09', pre)
    const dev = state.forensicDerivedArtifacts?.[CASSINI_STREAM_B_ARTIFACT_ID]
    expect(dev).toBeTruthy()

    // Caminho da bancada: filtrar SSRC B → stream por sequência → Reconstruct.
    const raw = JSON.parse(
      readFileSync(path.join(root, 'public/assets/audio/forensic/puzzle09/capture_meta.json'), 'utf8'),
    ) as { packets: Array<Record<string, unknown>> }
    const rows = mapPuzzle09Packets(raw.packets)
    const bIdx = rows.filter((r) => r.ssrc === puzzle09SsrcB).map((r) => r.index)
    const created = createDerivedRtpStream(rows, bIdx, 'sequence', 1)
    expect(created.ok, created.message).toBe(true)
    const result = evaluateRtpReconstruction(puzzle09RtpConfig, created.stream!, rows, 'sequence')
    expect(result.ok && result.isStreamB, result.message).toBe(true)

    const legit = buildCassiniStreamBArtifact({
      audioSrc: result.audioSrc,
      createdAtMs: dev!.createdAtMs,
      reconstructionOrder: 'sequence',
      ssrc: puzzle09SsrcB,
      parentSourceId: puzzle09CassiniHuygensSession.sources[0]!.id,
    })
    expect(dev).toEqual(legit)
    expect(dev!.audioSrc).toBe(puzzle09RtpConfig.audio.streamB)
  })

  it('P12 bloqueia sem o artefato de P09 e resolve com ele', () => {
    const memoryReady = buildCanonicalCheckpointState('b09-memory-ready')
    expect(memoryReady.forensicDerivedArtifacts?.[CASSINI_STREAM_B_ARTIFACT_ID]).toBeTruthy()

    const withoutArtifact: InvestigationState = structuredClone(memoryReady)
    delete withoutArtifact.forensicDerivedArtifacts![CASSINI_STREAM_B_ARTIFACT_ID]
    const blocked = applyCanonicalPuzzleCompletion('P12', withoutArtifact)
    expect(blocked.report.blocked).toMatch(/cassini-stream-b/)
    expect(blocked.state.flags.block09_memory_done).toBeFalsy()

    const solved = applyCanonicalPuzzleCompletion('P12', memoryReady)
    expect(solved.report.ok).toBe(true)
    expect(solved.state.flags.block09_memory_done).toBe(true)
    expect(solved.state.evidenceOwned).toContain('final_audio_impossible_provenance')
  })
})

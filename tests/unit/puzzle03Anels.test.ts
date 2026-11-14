import { describe, expect, it, beforeEach } from 'vitest'
import { createInitialUiState, fingerprintArchiveComplete } from '../../src/forensic/forensicEngine'
import { INSPECTOR_TABS } from '../../src/forensic/forensicTypes'
import {
  puzzle03AnelsSession,
  puzzle03Timing,
} from '../../src/forensic/puzzles/puzzle03Anels'
import {
  PUZZLE03_CANONICAL_SESSION_ID,
  PUZZLE03_FINGERPRINT_CATALOG,
  PUZZLE03_MUSIC_SOURCES,
  PUZZLE03_SET_SESSIONS,
  PUZZLE03_TRACK_A_ID,
  PUZZLE03_TRACK_B_ID,
  hasOrderedAdjacentPair,
  puzzle03DesignIsFixed,
  puzzle03MusicSourcesAreDistinct,
  puzzle03NarrativeComplete,
  queryVerticeArchive,
  searchFingerprintCatalog,
  sessionsContainingTrack,
  summarizeTransition,
} from '../../src/forensic/puzzles/puzzle03Fingerprint'
import { puzzle01CassiniSession } from '../../src/forensic/puzzles/puzzle01Cassini'
import { puzzle02IapetusSession } from '../../src/forensic/puzzles/puzzle02Iapetus'
import { getForensicSessionForEvidence } from '../../src/forensic/forensicRegistry'
import { createInitialState } from '../../src/game/state/initialState'
import {
  __setStateForTests,
  getInvestigationState,
  resetGame,
} from '../../src/game/state/investigationStore'
import {
  finishVerticeArchive,
  finishVerticeSetCrossRef,
  onRafaelClubAudioPlayed,
  runProvisionalRingsAnalysis,
} from '../../src/game/story/block02Handlers'
import { seedEvidenceCatalog } from '../../src/data/game/seedEvidence'

const recording = puzzle03AnelsSession.sources[0]!

describe('Puzzle 03 — ANÉIS (fingerprint redesign)', () => {
  beforeEach(() => {
    resetGame()
    __setStateForTests(createInitialState())
  })

  it('provenance canónica: Mariana → Rafael → Augusto (WhatsApp); não é arquivo do Vértice', () => {
    const e3 = seedEvidenceCatalog.find((e) => e.id === 'rec_vtx_old_01')!
    expect(e3.sourceType).toBe('augusto-whatsapp')
    const blob = `${e3.title}\n${e3.description}`.toLowerCase()
    expect(blob).toMatch(/rafael/)
    expect(blob).toMatch(/mariana\s*→\s*rafael\s*→\s*augusto/)
    expect(blob).toMatch(/n[aã]o [eé] arquivo obtido no v[eé]rtice/)
    const meta = recording.metadata?.map((m) => m.value).join(' ').toLowerCase()
    expect(meta).toMatch(/whatsapp/)
    expect(meta).toMatch(/rafael/)
  })

  it('puzzle03TracksMustUseDistinctSources', () => {
    const { sourceA, sourceB, status, requirement } = PUZZLE03_MUSIC_SOURCES
    expect(sourceA).toMatch(/Give-Me-Everything-Tonight-Hardtekk/)
    if (sourceB == null) {
      expect(status).toBe('PENDING_ASSET')
      expect(requirement).toBe('P03_SECOND_TRACK_REQUIRED')
      expect(puzzle03MusicSourcesAreDistinct()).toBe(false)
      expect(puzzle03DesignIsFixed()).toBe(false)
      const entryA = PUZZLE03_FINGERPRINT_CATALOG.find((e) => e.id === PUZZLE03_TRACK_A_ID)!
      const entryB = PUZZLE03_FINGERPRINT_CATALOG.find((e) => e.id === PUZZLE03_TRACK_B_ID)!
      expect(entryA.sourceAssetPath).toBe(sourceA)
      expect(entryB.sourceAssetPath).toBeNull()
      return
    }
    expect(sourceA).not.toBe(sourceB)
    expect(puzzle03MusicSourcesAreDistinct()).toBe(true)
    if (status === 'FIXED') expect(puzzle03DesignIsFixed()).toBe(true)
  })

  it('não declara FIXED enquanto A e B não forem fontes distintas', () => {
    expect(PUZZLE03_MUSIC_SOURCES.status).not.toBe('FIXED')
    expect(puzzle03DesignIsFixed()).toBe(false)
  })

  it('asset e regiões A/MIC/B (master legado até rebuild com B)', () => {
    const stem = recording.audio?.stems.find((s) => s.id === 'FILE')
    expect(stem?.src).toBe('/assets/audio/forensic/puzzle03/rec_vtx_old_01_final.mp3')
    expect(puzzle03Timing.preWindow.endSec).toBeLessThan(puzzle03Timing.djStartSec)
    expect(puzzle03Timing.postWindow.startSec).toBeGreaterThan(puzzle03Timing.djEndSec)
    expect(puzzle03AnelsSession.sources.every((s) => s.type === 'audio' || !s.setRecord)).toBe(true)
    expect(puzzle03AnelsSession.sources).toHaveLength(1)
    expect(puzzle03AnelsSession.completion?.kind).toBe('fingerprint-archive')
  })

  it('fingerprint A em seleção pré-DJ', () => {
    const hits = searchFingerprintCatalog(10, 40, 126.1)
    const top = hits[0]!
    expect(top.trackId).toBe(PUZZLE03_TRACK_A_ID)
    expect(top.strong).toBe(true)
  })

  it('fingerprint B em seleção pós-DJ', () => {
    const hits = searchFingerprintCatalog(100, 140, 128.0)
    const top = hits[0]!
    expect(top.trackId).toBe(PUZZLE03_TRACK_B_ID)
    expect(top.strong).toBe(true)
  })

  it('seleção ruim (MIC / curta) não dá match forte', () => {
    const mic = searchFingerprintCatalog(72, 90, 126)
    expect(mic.every((h) => !h.strong)).toBe(true)
    const short = searchFingerprintCatalog(20, 23, 126.1)
    expect(short.every((h) => !h.strong)).toBe(true)
  })

  it('ordem A→B válida; B→A não localiza sessão canónica', () => {
    expect(summarizeTransition(PUZZLE03_TRACK_A_ID, PUZZLE03_TRACK_B_ID)).toBe('A→B')
    expect(summarizeTransition(PUZZLE03_TRACK_B_ID, PUZZLE03_TRACK_A_ID)).toBe('B→A')
    const ordered = queryVerticeArchive({
      trackIds: [PUZZLE03_TRACK_A_ID, PUZZLE03_TRACK_B_ID],
      requireOrderedAdjacent: true,
    })
    expect(ordered).toHaveLength(1)
    expect(ordered[0]!.id).toBe(PUZZLE03_CANONICAL_SESSION_ID)

    const reverse = queryVerticeArchive({
      trackIds: [PUZZLE03_TRACK_B_ID, PUZZLE03_TRACK_A_ID],
      requireOrderedAdjacent: true,
    })
    expect(reverse.some((s) => s.id === PUZZLE03_CANONICAL_SESSION_ID)).toBe(false)
  })

  it('adjacência: A e B presentes mas não adjacentes não resolvem', () => {
    const nonAdj = PUZZLE03_SET_SESSIONS.find((s) => s.id === 'vtx-set-2019-10-02-op-b')!
    expect(nonAdj.trackSequence.includes(PUZZLE03_TRACK_A_ID)).toBe(true)
    expect(nonAdj.trackSequence.includes(PUZZLE03_TRACK_B_ID)).toBe(true)
    expect(
      hasOrderedAdjacentPair(nonAdj.trackSequence, PUZZLE03_TRACK_A_ID, PUZZLE03_TRACK_B_ID),
    ).toBe(false)
  })

  it('A sozinha retorna múltiplas sessões; cruzamento ordenado reduz a uma', () => {
    expect(sessionsContainingTrack(PUZZLE03_TRACK_A_ID).length).toBeGreaterThan(1)
    const both = queryVerticeArchive({
      trackIds: [PUZZLE03_TRACK_A_ID, PUZZLE03_TRACK_B_ID],
      requireOrderedAdjacent: false,
    })
    expect(both.length).toBeGreaterThan(1)
    const adj = queryVerticeArchive({
      trackIds: [PUZZLE03_TRACK_A_ID, PUZZLE03_TRACK_B_ID],
      requireOrderedAdjacent: true,
    })
    expect(adj).toHaveLength(1)
  })

  it('Nico só após abrir set correto com cadeia A→B', () => {
    expect(
      puzzle03NarrativeComplete({
        fingerprintAId: PUZZLE03_TRACK_A_ID,
        fingerprintBId: PUZZLE03_TRACK_B_ID,
        transitionOrder: 'A→B',
        openedArchiveSessionId: null,
      }),
    ).toBe(false)

    let ui = createInitialUiState(puzzle03AnelsSession)
    ui = {
      ...ui,
      fingerprintAId: PUZZLE03_TRACK_A_ID,
      fingerprintBId: PUZZLE03_TRACK_B_ID,
      transitionOrder: 'A→B',
      openedArchiveSessionId: PUZZLE03_CANONICAL_SESSION_ID,
    }
    expect(fingerprintArchiveComplete(puzzle03AnelsSession, ui)).toBe(true)

    const canon = PUZZLE03_SET_SESSIONS.find((s) => s.id === PUZZLE03_CANONICAL_SESSION_ID)!
    expect(canon.operator).toMatch(/Nico/i)
  })

  it('força bruta: abrir sessão canónica sem fingerprints NÃO completa', () => {
    let ui = createInitialUiState(puzzle03AnelsSession)
    ui = { ...ui, openedArchiveSessionId: PUZZLE03_CANONICAL_SESSION_ID }
    expect(fingerprintArchiveComplete(puzzle03AnelsSession, ui)).toBe(false)
  })

  it('lista de arquivo não destaca Nico antes de abrir', () => {
    const listBlob = JSON.stringify(
      PUZZLE03_SET_SESSIONS.map((s) => ({ id: s.id, recordId: s.recordId, date: s.date })),
    )
    expect(listBlob).not.toMatch(/Nico|Nicolas/)
  })

  it('P03 técnico só após a gravação da balada (Rafael); não identifica Nico', () => {
    finishVerticeArchive()
    // 1ª visita não entrega o áudio: P03 técnico ainda não roda.
    runProvisionalRingsAnalysis()
    expect(getInvestigationState().flags.block02_rings_provisional).toBeFalsy()

    onRafaelClubAudioPlayed()
    expect(getInvestigationState().flags.block02_rings_provisional).toBeFalsy()
    runProvisionalRingsAnalysis()
    const s = getInvestigationState()
    expect(s.flags.block02_rings_provisional).toBe(true)
    expect(s.evidenceOwned).toContain('rec_vtx_fingerprint_transition')
    expect(s.locations.vertice?.status).toBe('visitAvailable')
    expect(s.evidenceOwned).not.toContain('nico_dj_identified')
    expect(s.people.nico?.status).not.toBe('identified')
  })

  it('Nico só na 2ª visita (set_crossref), após o P03 técnico', () => {
    finishVerticeArchive()
    onRafaelClubAudioPlayed()
    finishVerticeSetCrossRef()
    expect(getInvestigationState().flags.block02_vertice_set_crossref).toBeFalsy()
    runProvisionalRingsAnalysis()
    finishVerticeSetCrossRef()
    const s = getInvestigationState()
    expect(s.flags.block02_vertice_set_crossref).toBe(true)
    expect(s.evidenceOwned).toContain('nico_dj_identified')
    expect(s.people.nico?.status).toBe('identified')
  })

  it('catálogo e sessões: escala anti-força-bruta', () => {
    expect(PUZZLE03_FINGERPRINT_CATALOG.length).toBeGreaterThanOrEqual(4)
    expect(PUZZLE03_SET_SESSIONS.length).toBeGreaterThanOrEqual(10)
  })

  it('sem spoiler de Elisa; tabs genéricas', () => {
    expect(JSON.stringify(puzzle03AnelsSession)).not.toMatch(/Elisa|elisa/)
    expect(INSPECTOR_TABS.map((t) => t.label)).toContain('Analysis')
  })

  it('puzzles 01/02 ainda registados; P03 só áudio', () => {
    expect(getForensicSessionForEvidence('emergency_call_raw')?.id).toBe(puzzle01CassiniSession.id)
    expect(getForensicSessionForEvidence('rafael_audio_reply')?.id).toBe(
      puzzle02IapetusSession.id,
    )
    expect(getForensicSessionForEvidence('rec_vtx_old_01')?.id).toBe(puzzle03AnelsSession.id)
    expect(getForensicSessionForEvidence('rec_vtx_old_01')?.sources.every((s) => !s.setRecord)).toBe(
      true,
    )
  })
})

/**
 * AUDITORIA SEMÂNTICA — contrato canónico P02/P03.
 * Cadeia P2→P4: P2 no celular de Mariana → 1ª visita Vértice (arquivos) → Rafael envia a balada (P3)
 * → ANÉIS técnico → 2ª visita (set_crossref) → Nico.
 * Falha se alguém voltar a misturar as duas cadeias de proveniência.
 */
import { describe, expect, it, beforeEach } from 'vitest'
import { seedEvidenceCatalog } from '../../src/data/game/seedEvidence'
import { puzzle02IapetusSession } from '../../src/forensic/puzzles/puzzle02Iapetus'
import { puzzle03AnelsSession } from '../../src/forensic/puzzles/puzzle03Anels'
import { getForensicSessionForEvidence } from '../../src/forensic/forensicRegistry'
import { createInitialState } from '../../src/game/state/initialState'
import {
  __setStateForTests,
  getInvestigationState,
  resetGame,
} from '../../src/game/state/investigationStore'
import { onRafaelAudioPlayed } from '../../src/game/story/block01Handlers'
import {
  finishVerticeArchive,
  onRafaelClubAudioPlayed,
  runProvisionalRafaelForwardAnalysis,
} from '../../src/game/story/block02Handlers'

const P02_SRC = '/assets/audio/forensic/puzzle02/rafael_1610_2147_full.mp3'
const P03_SRC = '/assets/audio/forensic/puzzle03/rec_vtx_old_01_final.mp3'
/** P2 canônico: cópia que já está no celular de Mariana. */
const P02_ID = 'rafael_audio_reply'
/** Alias legado do P2 (saves antigos) — mesma mídia, nunca “reenviada” por Rafael. */
const P02_LEGACY_ID = 'rafael_voice_to_augusto'
const P03_ID = 'rec_vtx_old_01'

describe('SEMANTIC AUDIT — P02/P03 provenance (canon contract)', () => {
  beforeEach(() => {
    resetGame()
    __setStateForTests(createInitialState())
  })

  it('P02: Rafael + WhatsApp do celular de Mariana + asset Rafael + lead Vértice', () => {
    const e2 = seedEvidenceCatalog.find((e) => e.id === P02_ID)!
    expect(e2.audioSrc).toBe(P02_SRC)
    expect(e2.sourceType).toBe('mariana-whatsapp')
    expect(e2.relatedPersonIds).toContain('rafael')
    const blob = `${e2.title}\n${e2.description ?? ''}`.toLowerCase()
    expect(blob).toMatch(/rafael/)
    expect(blob).toMatch(/an[aá]lise/)
    expect(blob).not.toMatch(/encaminhada por rafael|forward from mariana/)

    // Alias legado: mesma mídia, explicitamente não é a gravação da balada.
    const legacy = seedEvidenceCatalog.find((e) => e.id === P02_LEGACY_ID)!
    expect(legacy.audioSrc).toBe(P02_SRC)
    expect(`${legacy.title}\n${legacy.description ?? ''}`.toLowerCase()).toMatch(
      /n[aã]o [eé] a grava[cç][aã]o da balada|legado/,
    )
    expect(getForensicSessionForEvidence(P02_ID)?.id).toBe(puzzle02IapetusSession.id)

    const metaSrc = puzzle02IapetusSession.sources[0]?.metadata?.find((m) => m.key === 'source')
    expect(metaSrc?.value.toLowerCase()).toMatch(/whatsapp/)
    expect(metaSrc?.value.toLowerCase()).toMatch(/rafael/)

    onRafaelAudioPlayed()
    runProvisionalRafaelForwardAnalysis()
    const s = getInvestigationState()
    expect(s.evidenceOwned).toContain(P02_ID)
    expect(s.evidenceOwned).not.toContain(P03_ID)
    expect(s.evidenceOwned).toContain('mariana_club_recording_missing')
    expect(s.flags.block02_rafael_forward_provisional).toBe(true)
    expect(s.locations.vertice?.status).toBe('visitAvailable')
  })

  it('P03: cópia de Rafael → Augusto (WhatsApp); só após 1ª visita; não é arquivo do Vértice; asset ≠ P02', () => {
    expect(P02_SRC).not.toBe(P03_SRC)
    expect(puzzle03AnelsSession.evidenceId).toBe(P03_ID)
    const e3 = seedEvidenceCatalog.find((e) => e.id === P03_ID)!
    expect(e3.audioSrc).toBe(P03_SRC)
    expect(e3.sourceType).toBe('augusto-whatsapp')
    expect(e3.sourceType).not.toMatch(/location|archive/i)

    const blob = `${e3.title}\n${e3.description ?? ''}`.toLowerCase()
    expect(blob).toMatch(/rafael/)
    expect(blob).toMatch(/mariana\s*→\s*rafael\s*→\s*augusto/)
    expect(blob).toMatch(/n[aã]o [eé] arquivo obtido no v[eé]rtice/)

    const metaSrc = puzzle03AnelsSession.sources[0]?.metadata?.find((m) => m.key === 'source')
    const metaChain = puzzle03AnelsSession.sources[0]?.metadata?.find((m) => m.key === 'chain')
    const metaBlob = `${metaSrc?.value ?? ''} ${metaChain?.value ?? ''}`.toLowerCase()
    expect(metaBlob).toMatch(/whatsapp/)
    expect(metaBlob).toMatch(/rafael/)
    expect(metaBlob).toMatch(/augusto/)

    onRafaelAudioPlayed()
    runProvisionalRafaelForwardAnalysis()
    let s = getInvestigationState()
    expect(s.evidenceOwned).not.toContain(P03_ID)

    // 1ª visita: arquivos existem, mas NÃO entrega o áudio P3.
    finishVerticeArchive()
    s = getInvestigationState()
    expect(s.flags.block02_vertice_archive).toBe(true)
    expect(s.evidenceOwned).not.toContain(P03_ID)

    // Rafael (chat exige block02_vertice_archive) envia a gravação da balada.
    onRafaelClubAudioPlayed()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain(P03_ID)
    expect(s.flags.block02_rafael_club_received).toBe(true)
  })

  it('cadeias permanecem distintas se misturadas no futuro', () => {
    const e2 = seedEvidenceCatalog.find((e) => e.id === P02_ID)!
    const e3 = seedEvidenceCatalog.find((e) => e.id === P03_ID)!
    expect(e2.audioSrc).not.toBe(e3.audioSrc)
    expect(e2.id).not.toBe(e3.id)
    expect(e2.sourceType).not.toBe(e3.sourceType)
  })
})

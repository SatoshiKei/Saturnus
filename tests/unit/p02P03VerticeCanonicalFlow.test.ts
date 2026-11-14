import { beforeEach, describe, expect, it } from 'vitest'
import { seedEvidenceCatalog } from '../../src/data/game/seedEvidence'
import { RAFAEL_CLUB_AUDIO_SRC, RAFAEL_FORWARD_AUDIO, RAFAEL_VERTICE_AUDIO_SRC } from '../../src/data/chatScripts'
import {
  finishVerticeArchive,
  finishVerticeSetCrossRef,
  onRafaelClubAudioPlayed,
  runProvisionalRafaelForwardAnalysis,
  runProvisionalRingsAnalysis,
} from '../../src/game/story/block02Handlers'
import { finishNicoInterview } from '../../src/game/story/block03Handlers'
import {
  dispatchActions,
  getInvestigationState,
  resetGame,
} from '../../src/game/state/investigationStore'
import { onRafaelAudioPlayed } from '../../src/game/story/block01Handlers'

function evidence(id: string) {
  return seedEvidenceCatalog.find((e) => e.id === id)!
}

describe('P02/P03/Vértice cadeia canónica', () => {
  beforeEach(() => {
    resetGame()
  })

  it('A — P2 asset já no celular de Mariana (rafael_audio_reply)', () => {
    onRafaelAudioPlayed()
    const s = getInvestigationState()
    expect(s.evidenceOwned).toContain('rafael_audio_reply')
    expect(evidence('rafael_audio_reply').sourceType).toBe('mariana-whatsapp')
    expect(evidence('rafael_audio_reply').audioSrc).toBe(RAFAEL_VERTICE_AUDIO_SRC)
  })

  it('B — Rafael não reenvia o áudio P2; anexa a balada (P3)', () => {
    expect(RAFAEL_FORWARD_AUDIO.audioSrc).toBe(RAFAEL_CLUB_AUDIO_SRC)
    expect(RAFAEL_FORWARD_AUDIO.audioSrc).not.toBe(RAFAEL_VERTICE_AUDIO_SRC)
  })

  it('C — P2 revela Vértice e mídia ausente', () => {
    onRafaelAudioPlayed()
    runProvisionalRafaelForwardAnalysis()
    const s = getInvestigationState()
    expect(s.flags.block02_rafael_forward_provisional).toBe(true)
    expect(s.locations.vertice?.status).toBe('visitAvailable')
    expect(s.evidenceOwned).toContain('rafael_recording_vertice_tag')
    expect(s.evidenceOwned).toContain('mariana_club_recording_missing')
    expect(s.evidenceOwned).not.toContain('rec_vtx_old_01')
  })

  it('D/E — 1ª visita não possui P3 e não identifica Nico', () => {
    onRafaelAudioPlayed()
    runProvisionalRafaelForwardAnalysis()
    finishVerticeArchive()
    const s = getInvestigationState()
    expect(s.flags.block02_vertice_archive).toBe(true)
    expect(s.evidenceOwned).not.toContain('rec_vtx_old_01')
    expect(s.evidenceOwned).not.toContain('nico_dj_identified')
    expect(s.people.nico?.status === 'identified' || s.people.nico?.status === 'located').toBeFalsy()
    expect(s.searchTermsDiscovered.map((t) => t.toLowerCase())).not.toContain('nico')
  })

  it('F/G/H — após 1ª visita Rafael envia P3 distinto; source só então', () => {
    onRafaelAudioPlayed()
    runProvisionalRafaelForwardAnalysis()
    finishVerticeArchive()
    expect(getInvestigationState().evidenceOwned).not.toContain('rec_vtx_old_01')
    onRafaelClubAudioPlayed()
    const s = getInvestigationState()
    expect(s.flags.block02_rafael_club_received).toBe(true)
    expect(s.evidenceOwned).toContain('rec_vtx_old_01')
    expect(evidence('rec_vtx_old_01').sourceType).toBe('augusto-whatsapp')
    expect(evidence('rec_vtx_old_01').description).toMatch(/Mariana → Rafael → Augusto/)
    expect(evidence('rec_vtx_old_01').description).not.toMatch(/Vértice → Augusto/)
    expect(evidence('rec_vtx_old_01').audioSrc).not.toBe(evidence('rafael_audio_reply').audioSrc)
  })

  it('I/J — P3 completion não identifica Nico; libera retorno ao Vértice', () => {
    onRafaelAudioPlayed()
    runProvisionalRafaelForwardAnalysis()
    finishVerticeArchive()
    onRafaelClubAudioPlayed()
    runProvisionalRingsAnalysis()
    const s = getInvestigationState()
    expect(s.flags.block02_rings_provisional).toBe(true)
    expect(s.evidenceOwned).toContain('rec_vtx_fingerprint_transition')
    expect(s.evidenceOwned).not.toContain('nico_dj_identified')
    expect(s.locations.vertice?.status).toBe('visitAvailable')
    expect(s.people.nico?.status === 'identified').toBeFalsy()
  })

  it('K/L — 2ª visita identifica Nico', () => {
    onRafaelAudioPlayed()
    runProvisionalRafaelForwardAnalysis()
    finishVerticeArchive()
    onRafaelClubAudioPlayed()
    runProvisionalRingsAnalysis()
    finishVerticeSetCrossRef()
    const s = getInvestigationState()
    expect(s.flags.block02_vertice_set_crossref).toBe(true)
    expect(s.evidenceOwned).toContain('nico_dj_identified')
    expect(s.evidenceOwned).toContain('rec_vtx_set_nico_match')
    expect(evidence('rec_vtx_set_nico_match').sourceType).toBe('location-archive')
    expect(s.people.nico?.status).toBe('identified')
  })

  it('M/N — entrevista Nico libera P4; P4 não existe antes', () => {
    onRafaelAudioPlayed()
    runProvisionalRafaelForwardAnalysis()
    finishVerticeArchive()
    onRafaelClubAudioPlayed()
    runProvisionalRingsAnalysis()
    expect(getInvestigationState().evidenceOwned).not.toContain('nico_recording_booth')
    finishVerticeSetCrossRef()
    expect(getInvestigationState().evidenceOwned).not.toContain('nico_recording_booth')
    finishNicoInterview()
    const s = getInvestigationState()
    expect(s.evidenceOwned).toContain('nico_recording_booth')
    expect(s.flags.block03_janus_available || s.flags.block03_nico_interview_done).toBeTruthy()
  })

  it('assets distintos: voz Rafael ≠ club ≠ archive record', () => {
    const p2 = evidence('rafael_audio_reply')
    const p3 = evidence('rec_vtx_old_01')
    const match = evidence('rec_vtx_set_nico_match')
    expect(p2.audioSrc).not.toBe(p3.audioSrc)
    expect(match.type).toBe('derived')
    expect(match.sourceType).toBe('location-archive')
    expect(p3.sourceType).not.toBe('location-archive')
  })

  it('2ª visita sem P3 técnico não identifica Nico', () => {
    onRafaelAudioPlayed()
    runProvisionalRafaelForwardAnalysis()
    finishVerticeArchive()
    finishVerticeSetCrossRef()
    expect(getInvestigationState().flags.block02_vertice_set_crossref).toBeFalsy()
    expect(getInvestigationState().evidenceOwned).not.toContain('nico_dj_identified')
  })
})

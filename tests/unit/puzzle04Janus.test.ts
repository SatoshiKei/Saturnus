import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  approximateTrackCorrelation,
  clockSyncComplete,
  clockSyncOffsetValid,
  createInitialUiState,
  fmtClockOffset,
  relativeSourceOffsetSec,
} from '../../src/forensic/forensicEngine'
import {
  puzzle04CorrectedRealTime,
  puzzle04ExpectedOffsetSec,
  puzzle04FindingText,
  puzzle04JanusSession,
  puzzle04SetLogVerticeTime,
} from '../../src/forensic/puzzles/puzzle04Janus'
import { getForensicSessionForEvidence } from '../../src/forensic/forensicRegistry'
import { puzzle01CassiniSession } from '../../src/forensic/puzzles/puzzle01Cassini'
import { puzzle02IapetusSession } from '../../src/forensic/puzzles/puzzle02Iapetus'
import { puzzle03AnelsSession } from '../../src/forensic/puzzles/puzzle03Anels'
import { seedDocuments } from '../../src/data/game/seedDocuments'
import { seedEvidenceCatalog } from '../../src/data/game/seedEvidence'
import { seedAchievements } from '../../src/data/game/seedAchievements'

const ROOT = resolve(__dirname, '../..')

describe('Puzzle 04 — JANUS E EPIMETHEUS', () => {
  it('A/B: phone and desk assets exist; desk has no crowd production note', () => {
    const phone = resolve(ROOT, 'public/assets/audio/forensic/puzzle04/puzzle04_phone_source.wav')
    const desk = resolve(ROOT, 'public/assets/audio/forensic/puzzle04/puzzle04_desk_source.mp3')
    expect(existsSync(phone)).toBe(true)
    expect(existsSync(desk)).toBe(true)
    const meta = JSON.parse(
      readFileSync(resolve(ROOT, 'tools/audio/out/puzzle04_timing.json'), 'utf8'),
    )
    expect(meta.expectedOffsetSec).toBe(450)
    expect(meta.sourceA.role).toMatch(/phone/i)
    expect(meta.sourceB.role).toMatch(/desk/i)
    expect(meta.syncEvent).toMatch(/DJ/i)
  })

  it('C/D: correct offset validates; wrong offset does not', () => {
    const ui = createInitialUiState(puzzle04JanusSession)
    expect(clockSyncOffsetValid(puzzle04JanusSession, ui)).toBe(false)
    ui.sourceOffsets.janus_desk = 450
    expect(clockSyncOffsetValid(puzzle04JanusSession, ui)).toBe(true)
    ui.sourceOffsets.janus_desk = 400
    expect(clockSyncOffsetValid(puzzle04JanusSession, ui)).toBe(false)
  })

  it('E: listening alone does not complete', () => {
    const ui = createInitialUiState(puzzle04JanusSession)
    expect(clockSyncComplete(puzzle04JanusSession, ui)).toBe(false)
  })

  it('F/G/H: correction 01:16→01:23:30 and finding text', () => {
    expect(puzzle04SetLogVerticeTime).toBe('01:16:00')
    expect(puzzle04CorrectedRealTime).toBe('01:23:30')
    expect(puzzle04FindingText).toBe(
      'Sandra não poderia ter visto Elisa no primeiro avistamento.',
    )
    const ui = createInitialUiState(puzzle04JanusSession)
    ui.sourceOffsets.janus_desk = puzzle04ExpectedOffsetSec
    ui.formalizedClockOffsetSec = puzzle04ExpectedOffsetSec
    ui.correctedSetTime = puzzle04CorrectedRealTime
    ui.findingUnlocked = true
    expect(clockSyncComplete(puzzle04JanusSession, ui)).toBe(true)
    expect(fmtClockOffset(450)).toBe('+07:30')
  })

  it('I/J/K: no finding that Sandra lied / Miro / André innocent', () => {
    const finding = seedEvidenceCatalog.find((e) => e.id === 'sandra_first_sighting_not_elisa')
    const blob = `${finding?.title ?? ''} ${finding?.description ?? ''} ${puzzle04FindingText}`
    expect(blob).not.toMatch(/mentiu|Miro|inocente/i)
    expect(blob).toMatch(/não poderia ter visto Elisa/i)
  })

  it('L: documents do not place André inside Vertice as premise', () => {
    const cron = seedDocuments.find((d) => d.id === 'doc-elisa-cronologia')
    const arg = seedDocuments.find((d) => d.id === 'doc-elisa-argumento')
    const text = [...(cron?.blocks ?? []), ...(arg?.blocks ?? [])]
      .map((b) => ('text' in b ? b.text : ''))
      .join('\n')
    expect(text).not.toMatch(/André reaparece na (entrada|portaria)/i)
    expect(text).not.toMatch(/André entrou no Vértice/i)
    expect(text).toMatch(/Levels/i)
  })

  it('M/N: Levels is textual only; no commercial audio path', () => {
    const amiga = seedDocuments.find((d) => d.id === 'doc-elisa-amiga-levels')
    expect(amiga?.blocks.some((b) => b.text.includes('Avicii — Levels'))).toBe(true)
    const audioSrcs = puzzle04JanusSession.sources
      .flatMap((s) => s.audio?.stems ?? [])
      .map((st) => st.src ?? '')
      .join('\n')
    expect(audioSrcs).not.toMatch(/levels|avicii/i)
    expect(audioSrcs).toMatch(/puzzle04_(phone|desk)_source/)
  })

  it('O: puzzles 01–03 sessions unchanged in registry', () => {
    expect(getForensicSessionForEvidence(puzzle01CassiniSession.evidenceId!).id).toBe(
      puzzle01CassiniSession.id,
    )
    expect(getForensicSessionForEvidence(puzzle02IapetusSession.evidenceId!).id).toBe(
      puzzle02IapetusSession.id,
    )
    expect(getForensicSessionForEvidence(puzzle03AnelsSession.evidenceId!).id).toBe(
      puzzle03AnelsSession.id,
    )
    expect(getForensicSessionForEvidence('nico_recording_booth')?.id).toBe(
      'puzzle-04-janus-epimetheus',
    )
  })

  it('correlation rises when tracks align', () => {
    const a = puzzle04JanusSession.sources[0]
    const b = puzzle04JanusSession.sources[1]
    const bad = relativeSourceOffsetSec(a, b, { janus_phone: 0, janus_desk: 0 })
    const good = relativeSourceOffsetSec(a, b, { janus_phone: 0, janus_desk: 450 })
    expect(approximateTrackCorrelation(bad)).toBeLessThan(0.2)
    expect(approximateTrackCorrelation(good)).toBeGreaterThan(0.9)
  })

  it('achievement ach-janus-epimetheus exists', () => {
    const ach = seedAchievements.find((a) => a.id === 'ach-janus-epimetheus')
    expect(ach?.title).toBe('JANUS E EPIMETHEUS')
    expect(ach?.description).toMatch(/Sincronizou duas fontes/i)
  })
})

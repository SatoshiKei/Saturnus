import { describe, expect, it } from 'vitest'
import {
  NOITE_X_EVENTS,
  NOITE_X_REAL_DJ_CLOCK,
  NOITE_X_SANDRA_FIRST_SIGHTING_REAL,
  NOITE_X_SEQUENCE,
  NOITE_X_VERTICE_DJ_CLOCK,
  NOITE_X_VERTICE_TO_REAL_OFFSET_SEC,
  getNoiteXEvent,
  parseClockToSec,
  verticeClockToRealSec,
} from '../../src/data/block03/noiteXChronology'
import { puzzle04ExpectedOffsetSec, puzzle04SetLogVerticeTime } from '../../src/forensic/puzzles/puzzle04Janus'
import { seedEvidenceCatalog } from '../../src/data/game/seedEvidence'
import { sandraBeats } from '../../src/data/block07/sandraInterview'
import { janaBeats } from '../../src/data/block05/janaInterview'
import { miroBeats } from '../../src/data/block06/miroInterview'

describe('Noite X canonical chronology', () => {
  it('01:16:00 Vertice ≡ 01:23:30 real (+450s)', () => {
    expect(NOITE_X_VERTICE_DJ_CLOCK).toBe('01:16:00')
    expect(NOITE_X_REAL_DJ_CLOCK).toBe('01:23:30')
    expect(NOITE_X_VERTICE_TO_REAL_OFFSET_SEC).toBe(450)
    expect(puzzle04ExpectedOffsetSec).toBe(NOITE_X_VERTICE_TO_REAL_OFFSET_SEC)
    expect(puzzle04SetLogVerticeTime).toBe(NOITE_X_VERTICE_DJ_CLOCK)
    const realFromVertice = verticeClockToRealSec(NOITE_X_VERTICE_DJ_CLOCK)
    expect(realFromVertice).toBe(parseClockToSec(NOITE_X_REAL_DJ_CLOCK))
  })

  it('Sandra ~01:16 real não observa Elisa saindo às 01:23:30', () => {
    const sandra = getNoiteXEvent('sandra_observes_first_pursuit')
    const elisaLeaves = getNoiteXEvent('elisa_leaves')
    expect(sandra.time.real).toBe(NOITE_X_SANDRA_FIRST_SIGHTING_REAL)
    expect(elisaLeaves.time.real).toBe(NOITE_X_REAL_DJ_CLOCK)

    const sandraSec = parseClockToSec(sandra.time.real)
    const elisaSec = parseClockToSec(elisaLeaves.time.real)
    expect(sandraSec).not.toBeNull()
    expect(elisaSec).not.toBeNull()
    expect(sandraSec!).toBeLessThan(elisaSec!)

    const finding = seedEvidenceCatalog.find((e) => e.id === 'sandra_first_sighting_not_elisa')
    expect(finding?.title?.toLowerCase() ?? finding?.description?.toLowerCase() ?? '').toMatch(
      /sandra|elisa/,
    )
  })

  it('sequência Jana/Miro/Elisa/Sandra não é impossível; gaps UNSPECIFIED', () => {
    expect(NOITE_X_SEQUENCE[0]).toBe('jana_at_vertice')
    expect(NOITE_X_SEQUENCE.indexOf('jana_leaves_first')).toBeLessThan(
      NOITE_X_SEQUENCE.indexOf('miro_follows_jana'),
    )
    expect(NOITE_X_SEQUENCE.indexOf('jana_returns_vertice')).toBeLessThan(
      NOITE_X_SEQUENCE.indexOf('jana_leaves_jacket_bag_with_elisa'),
    )
    expect(NOITE_X_SEQUENCE.indexOf('jana_leaves_jacket_bag_with_elisa')).toBeLessThan(
      NOITE_X_SEQUENCE.indexOf('elisa_leaves'),
    )
    expect(NOITE_X_SEQUENCE.indexOf('sandra_observes_first_pursuit')).toBeLessThan(
      NOITE_X_SEQUENCE.indexOf('sandra_leaves_for_help'),
    )
    expect(NOITE_X_SEQUENCE.indexOf('sandra_leaves_for_help')).toBeLessThan(
      NOITE_X_SEQUENCE.indexOf('elisa_leaves'),
    )
    expect(NOITE_X_SEQUENCE.indexOf('elisa_leaves')).toBeLessThan(
      NOITE_X_SEQUENCE.indexOf('elisa_death_fall'),
    )

    const help = getNoiteXEvent('sandra_leaves_for_help')
    // Canon não numera a duração — teste registra UNSPECIFIED/interval, não inventa.
    expect(['UNSPECIFIED', 'interval', 'approx']).toContain(help.time.precision)
  })

  it('diálogos amostrados não contradizem âncoras numéricas do dataset', () => {
    const allText = [
      ...Object.values(sandraBeats).flatMap((b) => b.map((x) => x.text)),
      ...Object.values(janaBeats).flatMap((b) => b.map((x) => x.text)),
      ...Object.values(miroBeats).flatMap((b) => b.map((x) => x.text)),
    ].join('\n')

    // Nenhum diálogo pode afirmar que Sandra viu Elisa sair no instante do Levels real.
    expect(allText).not.toMatch(/Sandra.{0,80}01:23:30/i)
    expect(allText).not.toMatch(/Elisa saiu.{0,40}01:16/i)

    // Dataset cobre eventos pedidos.
    const ids = new Set(NOITE_X_EVENTS.map((e) => e.id))
    expect(ids.has('musical_reference_event')).toBe(true)
    expect(ids.has('miro_follows_elisa_as_jana')).toBe(true)
    expect(ids.has('sandra_sees_unidentified_from_fall_area')).toBe(true)
  })
})

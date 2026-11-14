import { describe, expect, it } from 'vitest'
import { createInitialState } from '../../src/game/state/initialState'
import { applyStoryActions } from '../../src/game/story/actions'
import { runPoliceSearch } from '../../src/game/search/runSearch'
import { knowsTerm } from '../../src/game/knowledge/knownTerms'
import {
  __setStateForTests,
  dispatchActions,
  getInvestigationState,
  migrateState,
  openDocument,
  resetGame,
  tryDiaryPin,
} from '../../src/game/state/investigationStore'
import { finishLucasInterview } from '../../src/game/story/block02Handlers'
import { finishNicoFollowup } from '../../src/game/story/block05Handlers'
import { runHexagonSpectrogramSurvey } from '../../src/game/story/block04Handlers'
import { onForumHvalencaOpened } from '../../src/game/story/block07Handlers'
import {
  finishGeraldoEarlyInterview,
  finishJanaEarlyInterview,
  finishNicoEarlyInterview,
  finishSamuelAccidentalInterview,
  isGeraldoEarlyVisit,
  isJanaEarlyVisit,
  isNicoEarlyVisit,
  isSamuelAccidentalVisit,
  onCalendarGeraldoExamined,
  onCalendarJanaExamined,
  onHvalencaNoteRead,
} from '../../src/game/story/earlyPathHandlers'
import { callScripts } from '../../src/data/calls'
import { HEX_EVIDENCE_IDS } from '../../src/data/block04/hexagonPuzzle'

function seed(actions: Parameters<typeof applyStoryActions>[1] = []) {
  resetGame()
  __setStateForTests(applyStoryActions(createInitialState(), actions))
}

describe('Early paths — progressão', () => {
  it('pesquisar Lucas antes de Elisa NÃO revela Elisa', () => {
    seed([
      { type: 'discoverSearchTerm', term: 'lucas' },
      { type: 'discoverPerson', id: 'lucas', status: 'contactable' },
    ])
    const hits = runPoliceSearch('lucas', getInvestigationState())
    expect(hits.hits.some((h) => h.documentId === 'doc-lucas-cadastro')).toBe(true)
    openDocument('doc-lucas-cadastro')
    const s = getInvestigationState()
    expect(knowsTerm(s, 'elisa')).toBe(false)
    expect(runPoliceSearch('elisa', s).hits).toHaveLength(0)
    const docText = JSON.stringify(
      hits.hits.find((h) => h.documentId === 'doc-lucas-cadastro'),
    )
    expect(docText.toLowerCase()).not.toContain('elisa')
  })

  it('Nico cedo não entrega gravações nem Elisa; pós-Lucas a conversa completa fica disponível', () => {
    seed([
      { type: 'discoverSearchTerm', term: 'nico' },
      { type: 'discoverPerson', id: 'nico', status: 'located' },
      { type: 'unlockLocation', id: 'titan', status: 'visitAvailable' },
      { type: 'setFlag', id: 'block02_vertice_archive', value: true },
    ])
    expect(isNicoEarlyVisit(getInvestigationState())).toBe(true)
    finishNicoEarlyInterview()
    expect(getInvestigationState().flags.nico_early_done).toBe(true)
    expect(getInvestigationState().flags.block03_nico_interview_done).toBeFalsy()
    finishLucasInterview()
    const s = getInvestigationState()
    expect(isNicoEarlyVisit(s)).toBe(false)
    expect(s.locations.titan?.status).toBe('visitAvailable')
  })

  it('Lucas introduz Elisa e Autos passam a aceitá-la', () => {
    seed([
      { type: 'discoverSearchTerm', term: 'lucas' },
      { type: 'discoverPerson', id: 'lucas', status: 'contactable' },
      { type: 'unlockLocation', id: 'universidade', status: 'visitAvailable' },
    ])
    finishLucasInterview()
    const s = getInvestigationState()
    expect(knowsTerm(s, 'elisa')).toBe(true)
    expect(s.flags.block02_elisa_search_unlocked).toBe(true)
    expect(runPoliceSearch('elisa', s).hits.some((h) => h.documentId === 'doc-elisa-resumo')).toBe(
      true,
    )
  })

  it('Jana pode ser encontrada cedo pelo calendário; early não revela jaqueta', () => {
    seed()
    onCalendarJanaExamined()
    let s = getInvestigationState()
    expect(knowsTerm(s, 'jana')).toBe(true)
    expect(isJanaEarlyVisit(s)).toBe(true)
    const hits = runPoliceSearch('jana', s)
    expect(hits.hits.some((h) => h.documentId === 'doc-jana-cadastro')).toBe(true)
    expect(hits.hits.some((h) => h.documentId === 'doc-elisa-jana')).toBe(false)
    finishJanaEarlyInterview()
    s = getInvestigationState()
    expect(s.flags.jana_early_done).toBe(true)
    expect(s.evidenceOwned).not.toContain('jana_confirms_jacket')
  })

  it('jaqueta / depoimento Elisa só após conhecer Elisa (pós-Nico)', () => {
    seed([
      { type: 'discoverSearchTerm', term: 'jana' },
      { type: 'discoverSearchTerm', term: 'elisa' },
      { type: 'setFlag', id: 'block05_nico_followup_done', value: true },
      { type: 'setFlag', id: 'block05_jana_search_unlocked', value: true },
    ])
    expect(
      runPoliceSearch('jana', getInvestigationState()).hits.some(
        (h) => h.documentId === 'doc-elisa-jana',
      ),
    ).toBe(true)
  })

  it('Geraldo pelo calendário antes de Elisa; Vértice só com Elisa conhecida', () => {
    seed()
    onCalendarGeraldoExamined()
    let s = getInvestigationState()
    expect(knowsTerm(s, 'geraldo')).toBe(true)
    expect(isGeraldoEarlyVisit(s)).toBe(true)
    expect(
      runPoliceSearch('geraldo', s).hits.some((h) => h.documentId === 'doc-geraldo-cadastro'),
    ).toBe(true)
    expect(
      runPoliceSearch('geraldo', s).hits.some(
        (h) => h.documentId === 'doc-elisa-geraldo-depoimento',
      ),
    ).toBe(false)
    finishGeraldoEarlyInterview()
    dispatchActions([
      { type: 'discoverSearchTerm', term: 'elisa' },
      { type: 'setFlag', id: 'geraldo_vertice_known', value: true },
    ])
    s = getInvestigationState()
    expect(isGeraldoEarlyVisit(s)).toBe(false)
    expect(
      runPoliceSearch('geraldo', s).hits.some(
        (h) => h.documentId === 'doc-elisa-geraldo-depoimento',
      ),
    ).toBe(true)
  })

  it('hvalenca@ pode ser pesquisado cedo; Aster early não entrega Henrique', () => {
    seed()
    onHvalencaNoteRead()
    const s = getInvestigationState()
    expect(knowsTerm(s, 'hvalenca')).toBe(true)
    expect(
      runPoliceSearch('hvalenca', s).hits.some((h) => h.documentId === 'doc-forum-hvalenca'),
    ).toBe(true)
    openDocument('doc-forum-hvalenca')
    onForumHvalencaOpened()
    openDocument('doc-aster-admin')
    const early = callScripts.find((c) => c.id === 'call-aster-early')!
    const late = callScripts.find((c) => c.id === 'call-aster-henrique')!
    const after = getInvestigationState()
    expect(early.available(after)).toBe(true)
    expect(late.available(after)).toBe(false)
    expect(after.flags.block07_henrique_named).toBeFalsy()
  })

  it('Samuel pode ser encontrado por acidente no endereço de Marcelo', () => {
    seed([
      { type: 'discoverSearchTerm', term: 'marcelo' },
      { type: 'discoverPerson', id: 'marcelo', status: 'located' },
      { type: 'setFlag', id: 'marcelo_address_found', value: true },
      { type: 'unlockLocation', id: 'samuel-casa', status: 'visitAvailable' },
    ])
    expect(isSamuelAccidentalVisit()).toBe(true)
    finishSamuelAccidentalInterview()
    const s = getInvestigationState()
    expect(s.flags.samuel_accidental_done).toBe(true)
    expect(knowsTerm(s, 'samuel')).toBe(false)
    expect(s.evidenceOwned).not.toContain('samuel_confirms_morsa')
  })

  it('Morsa cedo retorna resultado inconclusivo', () => {
    seed([{ type: 'discoverSearchTerm', term: 'morsa' }])
    const hits = runPoliceSearch('morsa', getInvestigationState())
    expect(hits.hits.some((h) => h.documentId === 'doc-morsa-inconclusive')).toBe(true)
    openDocument('doc-morsa-inconclusive')
    expect(getInvestigationState().people.morsa?.status).toBe('mentioned')
  })

  it('diário pode ser conhecido antes do PIN; Hexágono ainda fornece o PIN', () => {
    seed([
      { type: 'setFlag', id: 'block01_complete', value: true },
      { type: 'addDocument', id: 'doc-laudo-forense' },
    ])
    openDocument('doc-laudo-forense')
    let s = getInvestigationState()
    expect(s.flags.diary_package_known).toBe(true)
    expect(s.flags.block04_diary_icon_revealed).toBe(true)
    expect(s.phones.mariana.diaryUnlocked).toBe(false)
    expect(tryDiaryPin('123456')).toBe('wrong')

    dispatchActions([
      ...HEX_EVIDENCE_IDS.map((id) => ({ type: 'addEvidence' as const, id })),
      { type: 'setFlag', id: 'block04_hexagon_available', value: true },
    ])
    runHexagonSpectrogramSurvey()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('hex_spectral_patterns')
    expect(s.flags.block04_hexagon_done).toBeFalsy()
    expect(tryDiaryPin('481526')).toBe('unlocked')
    expect(getInvestigationState().flags.block04_hexagon_done).toBe(true)
  })

  it('migrateState v3 semeia searchTermsDiscovered a partir de flags antigas', () => {
    const raw = applyStoryActions(createInitialState(), [
      { type: 'setFlag', id: 'block02_elisa_search_unlocked', value: true },
      { type: 'setFlag', id: 'block05_jana_search_unlocked', value: true },
      { type: 'setFlag', id: 'block03_nico_search_unlocked', value: true },
    ])
    raw.version = 2
    raw.searchTermsDiscovered = []
    const migrated = migrateState(raw)
    expect(migrated.version).toBe(3)
    expect(knowsTerm(migrated, 'elisa')).toBe(true)
    expect(knowsTerm(migrated, 'jana')).toBe(true)
    expect(knowsTerm(migrated, 'nico')).toBe(true)
  })

  it('Nico followup reabre Jana para entrevista produtiva', () => {
    seed([
      { type: 'setFlag', id: 'jana_early_done', value: true },
      { type: 'unlockLocation', id: 'jana-casa', status: 'visited' },
      { type: 'setFlag', id: 'block05_started', value: true },
    ])
    finishNicoFollowup()
    const s = getInvestigationState()
    expect(s.flags.block05_jana_search_unlocked).toBe(true)
    expect(s.locations['jana-casa']?.status).toBe('visitAvailable')
    expect(isJanaEarlyVisit(s)).toBe(false)
  })
})

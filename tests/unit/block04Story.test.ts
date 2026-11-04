import { describe, expect, it } from 'vitest'
import {
  HEX_CYCLE,
  HEX_EVIDENCE_IDS,
  HEX_NODES,
  HEX_PHRASE,
  HEX_PIN,
} from '../../src/data/block04/hexagonPuzzle'
import { callScripts } from '../../src/data/calls'
import { createInitialState } from '../../src/game/state/initialState'
import { applyStoryActions } from '../../src/game/story/actions'
import { runStoryEngine } from '../../src/game/story/engine'
import { runPoliceSearch } from '../../src/game/search/runSearch'
import {
  __setStateForTests,
  dispatchActions,
  getInvestigationState,
  openDocument,
  resetGame,
  tryDiaryPin,
} from '../../src/game/state/investigationStore'
import { block04EntryActions } from '../../src/game/story/block04DevCheckpoints'
import {
  finishAndreInterview,
  finishSamuelInterview,
  onDiaryEntryRead,
  onHexagonSolved,
  onHexCallAnswered,
  onHexCallsPreserved,
  onUnknownRecordingAnalyzed,
  onUnknownRecordingFound,
} from '../../src/game/story/block04Handlers'

function seedBlock04Start() {
  resetGame()
  __setStateForTests(runStoryEngine(applyStoryActions(createInitialState(), block04EntryActions)))
}

describe('Bloco 4 — progressão', () => {
  it('trigger block04_start abre a hipótese e o registro de visitas, sem listar Samuel', () => {
    resetGame()
    let s = applyStoryActions(createInitialState(), [
      { type: 'setFlag', id: 'block03_complete', value: true },
    ])
    s = runStoryEngine(s)
    expect(s.flags.block04_started).toBe(true)
    expect(s.hypotheses.hyp_morsa_key).toBeTruthy()
    // Samuel só vira alvo de consulta depois da relação de detidos.
    expect(s.flags.block04_samuel_search_unlocked).toBeFalsy()
  })

  it('grafo Hexágono fecha A→D→B→F→C→E→A com a frase e o PIN', () => {
    expect(HEX_CYCLE).toEqual(['A', 'D', 'B', 'F', 'C', 'E'])
    const byId = Object.fromEntries(HEX_NODES.map((n) => [n.id, n]))
    let cur: string = 'A'
    const seen: string[] = []
    for (let i = 0; i < 6; i++) {
      seen.push(cur)
      cur = byId[cur].pointsTo
    }
    expect(seen).toEqual(HEX_CYCLE)
    expect(cur).toBe('A')
    expect(HEX_CYCLE.map((id) => byId[id].fragment).join(' ')).toBe(HEX_PHRASE)
    expect(HEX_PHRASE).toBe('NO TELEFONE HÁ UM DIÁRIO QUE A TELA OMITE')
    expect(HEX_CYCLE.map((id) => byId[id].digit).join('')).toBe(HEX_PIN)
    expect(HEX_PIN).toBe('481526')
  })

  it('Samuel é localizado por documentos: protestos → detidos → ficha com endereço', () => {
    seedBlock04Start()
    expect(runPoliceSearch('samuel', createInitialState()).hits.length).toBe(0)
    // Antes da relação de detidos, a consulta por nome ainda não retorna a ficha.
    expect(runPoliceSearch('samuel', getInvestigationState()).hits.length).toBe(0)

    const protests = runPoliceSearch('Maralto', getInvestigationState())
    expect(protests.hits.some((h) => h.documentId === 'doc-protesto-detidos')).toBe(true)
    openDocument('doc-protesto-ocorrencia')
    openDocument('doc-protesto-detidos')
    let s = getInvestigationState()
    expect(s.flags.block04_samuel_search_unlocked).toBe(true)
    expect(s.people.samuel.status).toBe('identified')
    expect(s.locations['samuel-casa']?.status).not.toBe('visitAvailable')

    const { hits } = runPoliceSearch('Samuel', s)
    expect(hits.some((h) => h.documentId === 'doc-samuel-ficha')).toBe(true)
    openDocument('doc-samuel-ficha')
    s = getInvestigationState()
    expect(s.people.samuel.status).toBe('located')
    expect(s.evidenceOwned).toContain('samuel_current_record')
    expect(s.locations['samuel-casa']?.status).toBe('visitAvailable')
  })

  it('Samuel confirma Morsa sem identificar', () => {
    seedBlock04Start()
    openDocument('doc-samuel-ficha')
    finishSamuelInterview()
    finishSamuelInterview()
    const s = getInvestigationState()
    expect(s.flags.block04_samuel_interview_done).toBe(true)
    expect(s.evidenceOwned).toContain('samuel_confirms_morsa')
    expect(s.evidenceOwned).toContain('mariana_sought_samuel')
    expect(s.evidenceOwned).toContain('mariana_morsa_timing')
    expect(s.evidenceOwned.filter((id) => id === 'samuel_confirms_morsa').length).toBe(1)
    expect(s.people.morsa.status).toBe('identified')
  })

  it('registro de visitas entrega telefone da unidade; ligação libera a visita; entrevista cria hipótese', () => {
    seedBlock04Start()
    openDocument('doc-samuel-ficha')
    finishSamuelInterview()
    openDocument('doc-andre-visitas')
    let s = getInvestigationState()
    expect(s.evidenceOwned).toContain('mariana_andre_visit_record')
    expect(s.contacts['contact-presidio']?.unlocked).toBe(true)
    expect(s.locations.presidio?.status).not.toBe('visitAvailable')

    const call = callScripts.find((c) => c.id === 'call-presidio-visit')!
    dispatchActions(call.onComplete)
    s = getInvestigationState()
    expect(s.locations.presidio?.status).toBe('visitAvailable')
    expect(s.people.andre.status).toBe('located')

    finishAndreInterview()
    s = getInvestigationState()
    expect(s.flags.block04_andre_interview_done).toBe(true)
    expect(s.evidenceOwned).toContain('andre_confirms_shift')
    expect(s.evidenceOwned).toContain('andre_told_her_to_stop')
    expect(s.evidenceOwned).toContain('andre_no_maralto_link')
    expect(s.hypotheses.hyp_andre_manipulating?.state).toBe('active')
    expect(s.flags.block04_chronology_search_unlocked).toBe(true)
  })

  it('cronologia é contradição automática; ligação anônima fica pendente até ser atendida', () => {
    seedBlock04Start()
    finishSamuelInterview()
    openDocument('doc-andre-visitas')
    finishAndreInterview()
    openDocument('doc-andre-ligacoes')
    expect(getInvestigationState().flags.block04_andre_chronology_done).toBeFalsy()
    openDocument('doc-numero-sem-nome')
    let s = getInvestigationState()
    expect(s.contradictionsConfirmed.some((c) => c.id === 'contra_andre_night_hours')).toBe(true)
    expect(s.flags.block04_andre_chronology_done).toBe(true)
    expect(s.hypotheses.hyp_andre_manipulating?.state).toBe('weakened')
    expect(s.flags.block04_hex_call_pending).toBe(true)
    // Os seis áudios ainda NÃO estão na bancada: dependem da cena da ligação.
    expect(s.flags.block04_hex_received).toBeFalsy()
    for (const id of HEX_EVIDENCE_IDS) expect(s.evidenceOwned).not.toContain(id)

    onHexCallAnswered()
    s = getInvestigationState()
    expect(s.flags.block04_hex_call_pending).toBe(false)
    expect(s.flags.block04_hex_received).toBeFalsy()

    onHexCallsPreserved()
    onHexCallsPreserved()
    s = getInvestigationState()
    expect(s.flags.block04_hex_received).toBe(true)
    expect(s.flags.block04_hexagon_available).toBe(true)
    for (const id of HEX_EVIDENCE_IDS) {
      expect(s.evidenceOwned.filter((e) => e === id).length).toBe(1)
    }
  })

  it('Puzzle 6 exige os seis áudios e libera o pedido de perícia', () => {
    seedBlock04Start()
    onHexagonSolved()
    expect(getInvestigationState().flags.block04_hexagon_done).toBeFalsy()

    onHexCallsPreserved()
    onHexagonSolved()
    const s = getInvestigationState()
    expect(s.flags.block04_hexagon_done).toBe(true)
    expect(s.evidenceOwned).toContain('hex_phrase_recovered')
    expect(s.flags.block04_forensics_unlocked).toBe(true)
  })

  it('perícia: só atende com o puzzle resolvido; laudo libera o acesso; PIN errado falha, 481526 abre', () => {
    seedBlock04Start()
    const call = callScripts.find((c) => c.id === 'call-pericia-device')!
    expect(call.available(getInvestigationState())).toBe(false)

    // Antes do laudo não há acesso forense e o PIN é recusado como "locked".
    expect(tryDiaryPin(HEX_PIN)).toBe('locked')
    expect(getInvestigationState().phones.mariana.diaryUnlocked).toBeFalsy()

    onHexCallsPreserved()
    onHexagonSolved()
    expect(call.available(getInvestigationState())).toBe(true)
    dispatchActions(call.onComplete)
    openDocument('doc-laudo-forense')
    let s = getInvestigationState()
    expect(s.flags.block04_forensics_access).toBe(true)
    expect(s.evidenceOwned).toContain('hidden_app_detected')
    expect(s.phones.mariana.diaryUnlocked).toBeFalsy()
    expect(s.evidenceOwned).not.toContain('hidden_diary_recovered')

    expect(tryDiaryPin('000000')).toBe('wrong')
    expect(getInvestigationState().phones.mariana.diaryUnlocked).toBeFalsy()
    expect(tryDiaryPin(HEX_PIN)).toBe('unlocked')
    s = getInvestigationState()
    expect(s.phones.mariana.diaryUnlocked).toBe(true)
    expect(s.evidenceOwned).toContain('hidden_diary_recovered')
    expect(s.flags.block04_forensics_done).toBe(true)
  })

  it('leitura do diário gera evidências sem interpretar e libera a gravação desconhecida', () => {
    seedBlock04Start()
    dispatchActions([{ type: 'setFlag', id: 'block04_forensics_done', value: true }])
    onDiaryEntryRead('diary-forget', false)
    onDiaryEntryRead('diary-julia-a', false)
    onDiaryEntryRead('diary-julia-b', false)
    onDiaryEntryRead('diary-record', true)
    const s = getInvestigationState()
    expect(s.evidenceOwned).toContain('diary_memory_fear')
    expect(s.evidenceOwned).toContain('diary_julia_contradiction')
    expect(s.hypotheses.hyp_julia_manipulating).toBeTruthy()
    expect(s.flags.block04_unknown_recording_unlocked).toBe(true)
    expect(s.flags.block04_diary_opened).toBe(true)
  })

  it('gravação do desconhecido fecha o bloco com hipótese de interferência', () => {
    seedBlock04Start()
    dispatchActions([
      { type: 'setFlag', id: 'block04_unknown_recording_unlocked', value: true },
      { type: 'addEvidence', id: 'diary_memory_fear' },
    ])
    onUnknownRecordingFound()
    expect(getInvestigationState().evidenceOwned).toContain('unknown_contact_recording')

    onUnknownRecordingAnalyzed()
    const s = getInvestigationState()
    expect(s.flags.block04_unknown_analyzed).toBe(true)
    expect(s.evidenceOwned).toContain('unknown_knows_mariana')
    expect(s.hypotheses.hyp_memory_interference).toBeTruthy()
    expect(s.flags.block04_complete).toBe(true)
    expect(s.tasks.some((t) => t.id === 'task_press_nico' && !t.completed)).toBe(true)
    expect(s.people.morsa.status).toBe('identified')
  })

  it('atalhos bloqueados sem pré-requisitos', () => {
    seedBlock04Start()
    onUnknownRecordingFound()
    expect(getInvestigationState().flags.block04_unknown_recording_found).toBeFalsy()
    expect(tryDiaryPin(HEX_PIN)).toBe('locked')
  })
})

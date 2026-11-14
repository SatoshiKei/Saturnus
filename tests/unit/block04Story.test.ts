import { describe, expect, it } from 'vitest'
import {
  HEX_EVIDENCE_IDS,
  HEX_FILES,
  HEX_PIN,
  expectedPinFromSymbols,
} from '../../src/data/block04/hexagonPuzzle'
import { callScripts } from '../../src/data/calls'
import { createInitialState } from '../../src/game/state/initialState'
import { applyStoryActions } from '../../src/game/story/actions'
import { runStoryEngine } from '../../src/game/story/engine'
import { runPoliceSearch } from '../../src/game/search/runSearch'
import { onUnknownCallerNumberSeen } from '../../src/game/story/block04PhoneHooks'
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
  onHexCallAnswered,
  onHexCallsPreserved,
  onUnknownRecordingAnalyzed,
  onUnknownRecordingFound,
  runHexagonSpectrogramSurvey,
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

  it('Hexágono: seis UNK → romanos → PIN 481526 (sem spoiler na evidência)', () => {
    expect(HEX_FILES.map((f) => f.id)).toEqual([
      'UNK_01',
      'UNK_02',
      'UNK_03',
      'UNK_04',
      'UNK_05',
      'UNK_06',
    ])
    expect(HEX_FILES.map((f) => f.expectedSymbol)).toEqual(['IV', 'VIII', 'I', 'V', 'II', 'VI'])
    expect(expectedPinFromSymbols()).toBe(HEX_PIN)
    expect(HEX_PIN).toBe('481526')
  })

  it('Samuel é localizado por documentos: protestos → detidos → ficha com endereço', () => {
    seedBlock04Start()
    expect(runPoliceSearch('samuel', createInitialState()).hits.length).toBe(0)
    // Após Saturnalia o nome já é conhecido — a ficha cadastral fica pesquisável.
    expect(
      runPoliceSearch('samuel', getInvestigationState()).hits.some(
        (h) => h.documentId === 'doc-samuel-ficha',
      ),
    ).toBe(true)

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
    onUnknownCallerNumberSeen()
    const hits = runPoliceSearch('99184', getInvestigationState()).hits
    expect(hits.some((h) => h.documentId === 'doc-numero-sem-nome')).toBe(true)
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

  it('Puzzle 6: survey exige os seis áudios; PIN resolve o hexágono', () => {
    seedBlock04Start()
    runHexagonSpectrogramSurvey()
    expect(getInvestigationState().flags.block04_hex_spectrograms_inspected).toBeFalsy()
    expect(getInvestigationState().flags.block04_hexagon_done).toBeFalsy()

    onHexCallsPreserved()
    runHexagonSpectrogramSurvey()
    let s = getInvestigationState()
    expect(s.flags.block04_hex_spectrograms_inspected).toBe(true)
    expect(s.flags.block04_hexagon_done).toBeFalsy()
    expect(s.evidenceOwned).toContain('hex_spectral_patterns')
    expect(s.flags.block04_forensics_unlocked).toBe(true)

    dispatchActions([
      { type: 'setFlag', id: 'block04_forensics_access', value: true },
      { type: 'setFlag', id: 'block04_diary_icon_revealed', value: true },
    ])
    expect(tryDiaryPin(HEX_PIN)).toBe('unlocked')
    s = getInvestigationState()
    expect(s.flags.block04_hexagon_done).toBe(true)
  })

  it('perícia: pode ser pedida cedo; laudo libera o acesso; PIN errado falha, 481526 abre', () => {
    seedBlock04Start()
    const call = callScripts.find((c) => c.id === 'call-pericia-device')!
    // Análise de pacotes pode ser solicitada antes do Hexágono.
    expect(call.available(getInvestigationState())).toBe(true)

    // Antes do laudo o PIN ainda não abre o diário.
    expect(tryDiaryPin(HEX_PIN)).toBe('locked')
    expect(getInvestigationState().phones.mariana.diaryUnlocked).toBeFalsy()

    onHexCallsPreserved()
    runHexagonSpectrogramSurvey()
    expect(call.available(getInvestigationState())).toBe(true)
    dispatchActions(call.onComplete)
    openDocument('doc-laudo-forense')
    let s = getInvestigationState()
    expect(s.flags.block04_forensics_access).toBe(true)
    expect(s.flags.diary_package_known).toBe(true)
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

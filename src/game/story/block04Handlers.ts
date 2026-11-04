import { HEX_EVIDENCE_IDS } from '../../data/block04/hexagonPuzzle'
import { dispatchActions, getInvestigationState } from '../state/investigationStore'
import type { StoryActionRef } from '../types'

export function finishSamuelInterview() {
  const s = getInvestigationState()
  const markVisited = { type: 'unlockLocation' as const, id: 'samuel-casa', status: 'visited' as const }
  if (s.flags.block04_samuel_interview_done) {
    if (s.locations['samuel-casa']?.status === 'visitAvailable') dispatchActions([markVisited])
    return
  }
  dispatchActions([
    { type: 'setFlag', id: 'block04_samuel_interview_done', value: true },
    { type: 'discoverPerson', id: 'samuel', status: 'interviewed' },
    { type: 'addEvidence', id: 'samuel_confirms_morsa' },
    { type: 'addEvidence', id: 'mariana_sought_samuel' },
    { type: 'addEvidence', id: 'mariana_morsa_timing' },
    { type: 'completeTask', id: 'task_identify_morsa' },
    {
      type: 'addTask',
      id: 'task_andre_visits',
      label: 'Conferir os registros de visita de Mariana a André',
    },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_morsa_key',
      evidenceId: 'samuel_confirms_morsa',
      role: 'support',
    },
    markVisited,
  ])
}

export function finishAndreInterview() {
  const s = getInvestigationState()
  if (s.flags.block04_andre_interview_done) return
  dispatchActions([
    { type: 'setFlag', id: 'block04_andre_interview_done', value: true },
    { type: 'discoverPerson', id: 'andre', status: 'interviewed' },
    { type: 'addEvidence', id: 'andre_confirms_shift' },
    { type: 'addEvidence', id: 'andre_told_her_to_stop' },
    { type: 'addEvidence', id: 'andre_no_maralto_link' },
    { type: 'completeTask', id: 'task_andre_visits' },
    { type: 'completeTask', id: 'task_interview_andre' },
    { type: 'unlockLocation', id: 'presidio', status: 'visited' },
    { type: 'addHypothesis', id: 'hyp_andre_manipulating' },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_andre_manipulating',
      evidenceId: 'andre_confirms_shift',
      role: 'support',
    },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_andre_manipulating',
      evidenceId: 'mariana_andre_visit_record',
      role: 'support',
    },
    { type: 'setFlag', id: 'block04_chronology_search_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_check_andre_chronology',
      label: 'Comparar os horários dos contatos com os registros da unidade',
    },
  ])
}

/** A ligação anônima foi atendida: um áudio tocou, a linha caiu. */
export function onHexCallAnswered() {
  const s = getInvestigationState()
  if (s.flags.block04_hex_call_answered) return
  dispatchActions([
    { type: 'setFlag', id: 'block04_hex_call_answered', value: true },
    { type: 'setFlag', id: 'block04_hex_call_pending', value: false },
  ])
}

/** Depois da cena de reflexão: os seis áudios chegam à bancada. */
export function onHexCallsPreserved() {
  const s = getInvestigationState()
  if (s.flags.block04_hex_received) return
  const actions: StoryActionRef[] = [
    { type: 'setFlag', id: 'block04_hex_received', value: true },
    ...HEX_EVIDENCE_IDS.map((id) => ({ type: 'addEvidence' as const, id })),
    { type: 'setFlag', id: 'block04_hexagon_available', value: true },
    {
      type: 'addTask',
      id: 'task_hexagon',
      label: 'Analisar os seis áudios anônimos (bancada)',
    },
  ]
  dispatchActions(actions)
}

/** Puzzle 6 resolvido pelo jogador na bancada (sequência A→D→B→F→C→E). */
export function onHexagonSolved() {
  const s = getInvestigationState()
  if (s.flags.block04_hexagon_done) return
  if (!HEX_EVIDENCE_IDS.every((id) => s.evidenceOwned.includes(id))) return
  dispatchActions([
    { type: 'setFlag', id: 'block04_hexagon_done', value: true },
    { type: 'addEvidence', id: 'hex_phrase_recovered' },
    { type: 'completeTask', id: 'task_hexagon' },
    { type: 'setFlag', id: 'block04_forensics_unlocked', value: true },
    {
      type: 'addTask',
      id: 'task_phone_forensics',
      label: 'Pedir à Perícia uma análise do aparelho de Mariana',
    },
  ])
}

export function onDiaryEntryRead(entryId: string, unlocksUnknown: boolean) {
  const s = getInvestigationState()
  const actions: StoryActionRef[] = []

  if (entryId === 'diary-forget' || entryId === 'diary-others') {
    if (!s.evidenceOwned.includes('diary_memory_fear')) {
      actions.push({ type: 'addEvidence', id: 'diary_memory_fear' })
    }
  }
  if (entryId === 'diary-julia-a' || entryId === 'diary-julia-b') {
    if (!s.evidenceOwned.includes('diary_julia_contradiction')) {
      actions.push(
        { type: 'addEvidence', id: 'diary_julia_contradiction' },
        { type: 'addHypothesis', id: 'hyp_julia_manipulating' },
        {
          type: 'linkHypothesis',
          hypothesisId: 'hyp_julia_manipulating',
          evidenceId: 'diary_julia_contradiction',
          role: 'support',
        },
      )
    }
  }

  if (unlocksUnknown && !s.flags.block04_unknown_recording_unlocked) {
    actions.push(
      { type: 'setFlag', id: 'block04_unknown_recording_unlocked', value: true },
      {
        type: 'addTask',
        id: 'task_unknown_recording',
        label: 'Localizar a gravação citada no diário',
      },
    )
  }

  if (!s.flags.block04_diary_opened) {
    actions.push(
      { type: 'setFlag', id: 'block04_diary_opened', value: true },
      { type: 'completeTask', id: 'task_read_diary' },
    )
  }

  if (actions.length) dispatchActions(actions)
}

export function onUnknownRecordingFound() {
  const s = getInvestigationState()
  if (s.flags.block04_unknown_recording_found) return
  if (!s.flags.block04_unknown_recording_unlocked) return
  dispatchActions([
    { type: 'setFlag', id: 'block04_unknown_recording_found', value: true },
    { type: 'addEvidence', id: 'unknown_contact_recording' },
    { type: 'completeTask', id: 'task_unknown_recording' },
    {
      type: 'addTask',
      id: 'task_analyze_unknown',
      label: 'Analisar a gravação do contato desconhecido',
    },
  ])
}

export function onUnknownRecordingAnalyzed() {
  const s = getInvestigationState()
  if (s.flags.block04_unknown_analyzed) return
  if (!s.evidenceOwned.includes('unknown_contact_recording')) return
  dispatchActions([
    { type: 'setFlag', id: 'block04_unknown_analyzed', value: true },
    { type: 'addEvidence', id: 'unknown_knows_mariana' },
    { type: 'completeTask', id: 'task_analyze_unknown' },
    { type: 'addHypothesis', id: 'hyp_memory_interference' },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_memory_interference',
      evidenceId: 'unknown_knows_mariana',
      role: 'support',
    },
    {
      type: 'linkHypothesis',
      hypothesisId: 'hyp_memory_interference',
      evidenceId: 'diary_memory_fear',
      role: 'support',
    },
    { type: 'setFlag', id: 'block04_complete', value: true },
    {
      type: 'replaceTasks',
      tasks: [
        {
          id: 'task_press_nico',
          label: 'Voltar a falar com Nico sobre a Noite X',
          completed: false,
        },
      ],
    },
  ])
}

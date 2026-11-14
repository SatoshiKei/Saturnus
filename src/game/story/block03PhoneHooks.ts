import { dispatchActions, getInvestigationState } from '../state/investigationStore'
import { MARIANA_RADIO_CALL_LOG_ID } from '../../data/block01/marianaCalls'

/** Entrada da Rádio Costeira no histórico do celular de Mariana (pós-P04, com meta ativa). */
export function onMarianaRadioCallLogEntryOpened(entryId: string) {
  if (entryId !== MARIANA_RADIO_CALL_LOG_ID) return
  const s = getInvestigationState()
  if (s.flags.block03_radio_call_discovered) return
  if (!s.flags.block03_janus_done) return
  const reviewOpen = s.tasks.some((t) => t.id === 'task_review_mariana_call_log' && !t.completed)
  if (!reviewOpen) return
  dispatchActions([
    { type: 'setFlag', id: 'block03_radio_call_discovered', value: true },
    { type: 'setFlag', id: 'radio_costeira_contact_unlocked', value: true },
    { type: 'unlockContact', contactId: 'contact-livia' },
    { type: 'completeTask', id: 'task_review_mariana_call_log' },
    {
      type: 'addTask',
      id: 'task_contact_radio_costeira',
      label: 'Entrar em contato com a Rádio Costeira',
    },
    {
      type: 'notifyInvestigationUpdate',
      id: 'radio-costeira-landline',
      kind: 'contact',
      title: 'Rádio Costeira — Redação',
      subtitle: 'Número disponível no telefone fixo da delegacia',
    },
  ])
}

/** Manifest DEV / story replay (sem entryId). */
export function onMarianaRadioCallDiscovered() {
  onMarianaRadioCallLogEntryOpened(MARIANA_RADIO_CALL_LOG_ID)
}
import type { ForensicSession } from './forensicTypes'
import { puzzle01CassiniSession } from './puzzles/puzzle01Cassini'
import { puzzle02IapetusSession } from './puzzles/puzzle02Iapetus'
import { puzzle03AnelsSession } from './puzzles/puzzle03Anels'
import { puzzle04JanusSession } from './puzzles/puzzle04Janus'

/**
 * Registro de datasets por evidência.
 * Novos puzzles: adicionar sessão aqui — a UI não muda.
 */
const BY_EVIDENCE = new Map<string, ForensicSession>([
  [puzzle01CassiniSession.evidenceId!, puzzle01CassiniSession],
  [puzzle02IapetusSession.evidenceId!, puzzle02IapetusSession],
  // Mesmo dataset: cópia no celular de Mariana e forward para Augusto.
  ['rafael_audio_reply', puzzle02IapetusSession],
  [puzzle03AnelsSession.evidenceId!, puzzle03AnelsSession],
  [puzzle04JanusSession.evidenceId!, puzzle04JanusSession],
])

export function registerForensicSession(session: ForensicSession) {
  if (session.evidenceId) BY_EVIDENCE.set(session.evidenceId, session)
}

export function getForensicSessionForEvidence(evidenceId: string): ForensicSession | null {
  return BY_EVIDENCE.get(evidenceId) ?? null
}

export function listForensicSessions(): ForensicSession[] {
  return [...new Map([...BY_EVIDENCE.values()].map((s) => [s.id, s])).values()]
}

import type { ForensicSession } from './forensicTypes'
import { puzzle01CassiniSession } from './puzzles/puzzle01Cassini'

/**
 * Registro de datasets por evidência.
 * Novos puzzles: adicionar sessão aqui — a UI não muda.
 */
const BY_EVIDENCE = new Map<string, ForensicSession>([
  [puzzle01CassiniSession.evidenceId!, puzzle01CassiniSession],
])

export function registerForensicSession(session: ForensicSession) {
  if (session.evidenceId) BY_EVIDENCE.set(session.evidenceId, session)
}

export function getForensicSessionForEvidence(evidenceId: string): ForensicSession | null {
  return BY_EVIDENCE.get(evidenceId) ?? null
}

export function listForensicSessions(): ForensicSession[] {
  return [...BY_EVIDENCE.values()]
}

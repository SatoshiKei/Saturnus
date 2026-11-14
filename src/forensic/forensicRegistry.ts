import type { ForensicSession } from './forensicTypes'
import { puzzle01CassiniSession } from './puzzles/puzzle01Cassini'
import { puzzle02IapetusSession } from './puzzles/puzzle02Iapetus'
import { puzzle03AnelsSession } from './puzzles/puzzle03Anels'
import { puzzle04JanusSession } from './puzzles/puzzle04Janus'
import { puzzle05SaturnaliaSession } from './puzzles/puzzle05Saturnalia'
import {
  puzzle06EvidenceIds,
  puzzle06HexagonSession,
} from './puzzles/puzzle06Hexagon'
import { puzzle07ShepherdMoonsSession } from './puzzles/puzzle07ShepherdMoons'
import { puzzle08EnceladusSession } from './puzzles/puzzle08Enceladus'
import { puzzle09CassiniHuygensSession } from './puzzles/puzzle09CassiniHuygens'
import { puzzle10RingsSession } from './puzzles/puzzle10Rings'
import { puzzle11SaturnRotationSession } from './puzzles/puzzle11SaturnRotation'
import { puzzle12MemorySession } from './puzzles/puzzle12Memory'

/**
 * Registro de datasets por evidência.
 * Novos puzzles: adicionar sessão aqui — a UI não muda.
 */
const BY_EVIDENCE = new Map<string, ForensicSession>([
  [puzzle01CassiniSession.evidenceId!, puzzle01CassiniSession],
  [puzzle02IapetusSession.evidenceId!, puzzle02IapetusSession],
  // Legado: id antigo do P2 (mesma sessão / mesmo asset).
  ['rafael_voice_to_augusto', puzzle02IapetusSession],
  [puzzle03AnelsSession.evidenceId!, puzzle03AnelsSession],
  [puzzle04JanusSession.evidenceId!, puzzle04JanusSession],
  [puzzle05SaturnaliaSession.evidenceId!, puzzle05SaturnaliaSession],
  ...puzzle06EvidenceIds.map((id) => [id, puzzle06HexagonSession] as const),
  [puzzle07ShepherdMoonsSession.evidenceId!, puzzle07ShepherdMoonsSession],
  [puzzle08EnceladusSession.evidenceId!, puzzle08EnceladusSession],
  [puzzle09CassiniHuygensSession.evidenceId!, puzzle09CassiniHuygensSession],
  [puzzle10RingsSession.evidenceId!, puzzle10RingsSession],
  [puzzle11SaturnRotationSession.evidenceId!, puzzle11SaturnRotationSession],
  // Save-compat alias (pre-rename clock-drift id).
  ['police_clock_drift_logs', puzzle11SaturnRotationSession],
  [puzzle12MemorySession.evidenceId!, puzzle12MemorySession],
  // Save-compat alias (pre-rename P02 id).
  ['rafael_forward_from_mariana', puzzle02IapetusSession],
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

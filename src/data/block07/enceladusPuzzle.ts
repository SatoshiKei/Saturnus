/**
 * Puzzle 8 — Enceladus (placeholder funcional).
 * Rajadas periódicas num fundo quase silencioso → ambiente hospitalar + nome “Ricardo”.
 * TODO(puzzle-08): detecção real de periodicidade / match espectral com equipamentos.
 */

export const ENCELADUS_PERIOD_SEC = 12
export const ENCELADUS_HOSPITAL_MATCH = 'Hospital Municipal — padrão de alarmes de monitor'
export const ENCELADUS_VOICE_FRAGMENT = 'Ricardo'
export const ENCELADUS_SHIFT_HINT = 'Plantão noturno — setor próximo à UTI / observação'

export interface EnceladusBurst {
  id: string
  tSec: number
  kind: 'equipment' | 'voice' | 'noise'
  label: string
}

export const ENCELADUS_BURSTS: EnceladusBurst[] = [
  { id: 'b1', tSec: 12, kind: 'equipment', label: 'alarme monitor (≈1 kHz)' },
  { id: 'b2', tSec: 24, kind: 'equipment', label: 'bomba infusão (clique periódico)' },
  { id: 'b3', tSec: 36, kind: 'voice', label: 'fragmento: “…Ricardo…”' },
  { id: 'b4', tSec: 48, kind: 'equipment', label: 'alarme monitor' },
  { id: 'b5', tSec: 60, kind: 'noise', label: 'passos / carrinho' },
  { id: 'b6', tSec: 72, kind: 'equipment', label: 'bomba infusão' },
]

export const ENCELADUS_REF_TABLE = [
  { id: 'mon', name: 'Monitor multiparamétrico', pattern: 'alarme ~1 kHz, ciclo ~12 s' },
  { id: 'inf', name: 'Bomba de infusão', pattern: 'clique mecânico periódico' },
  { id: 'hvac', name: 'HVAC hospitalar', pattern: 'ruído contínuo de fundo' },
]

export function enceladusPeriodMatches(bursts: EnceladusBurst[]): boolean {
  const eq = bursts.filter((b) => b.kind === 'equipment').map((b) => b.tSec)
  if (eq.length < 2) return false
  const diffs = eq.slice(1).map((t, i) => t - eq[i])
  return diffs.every((d) => Math.abs(d - ENCELADUS_PERIOD_SEC) <= 1 || d % ENCELADUS_PERIOD_SEC === 0)
}

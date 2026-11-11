import type { InvestigationState } from '../types'

export function normalizeTerm(t: string) {
  return t
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

/** Tokens úteis para busca a partir de um nome completo. */
export function nameSearchTokens(name: string): string[] {
  const n = normalizeTerm(name)
  if (!n) return []
  const parts = n.split(/\s+/).filter((p) => p.length >= 3)
  return [...new Set([n, ...parts])]
}

function termMatchesKnown(known: string, needle: string): boolean {
  const k = normalizeTerm(known)
  const n = normalizeTerm(needle)
  if (!k || !n) return false
  return k === n || k.includes(n) || n.includes(k)
}

/**
 * Augusto “conhece” um termo só se ele entrou em `searchTermsDiscovered`
 * (via discoverSearchTerm, discoverPerson em ação, calendário, etc.).
 *
 * NÃO usar o catálogo seed de pessoas: quase todos já nascem `mentioned`.
 */
export function knowsTerm(state: InvestigationState, term: string): boolean {
  const needle = normalizeTerm(term)
  if (!needle) return false
  return state.searchTermsDiscovered.some((t) => termMatchesKnown(t, needle))
}

export function knowsAllTerms(state: InvestigationState, terms: string[]): boolean {
  return terms.every((t) => knowsTerm(state, t))
}

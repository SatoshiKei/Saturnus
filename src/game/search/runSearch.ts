import { seedSearchRules } from '../../data/game/seedStory'
import type { InvestigationState } from '../types'

function normalizeTerm(t: string) {
  return t
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

export interface SearchHit {
  ruleId: string
  title: string
  snippet: string
  documentId?: string
}

export function runPoliceSearch(query: string, state: InvestigationState) {
  const terms = query.split(/\s+/).map(normalizeTerm).filter((t) => t.length >= 2)

  const hits: SearchHit[] = []
  const seen = new Set<string>()

  for (const rule of seedSearchRules) {
    if (rule.requiredFlags?.some((f) => !state.flags[f])) continue
    const required = rule.requiredTerms.map(normalizeTerm)
    if (!required.every((r) => terms.some((t) => t.includes(r) || r.includes(t)))) continue
    for (const r of rule.results) {
      const key = r.documentId ?? `${rule.id}:${r.title}`
      if (seen.has(key)) continue
      seen.add(key)
      hits.push({ ruleId: rule.id, ...r })
    }
  }

  const newTerms = seedSearchRules.flatMap((rule) =>
    rule.discoverTerms?.filter((t) => terms.some((q) => q.includes(normalizeTerm(t)))) ?? [],
  )

  return { hits, newTerms: [...new Set(newTerms.map(normalizeTerm))] }
}

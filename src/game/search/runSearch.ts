import { seedSearchRules } from '../../data/game/seedStory'
import type { InvestigationState } from '../types'

function normalizeTerm(t: string) {
  return t.trim().toLowerCase()
}

export function runPoliceSearch(query: string, _state: InvestigationState) {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map(normalizeTerm)
    .filter(Boolean)

  const hits: { ruleId: string; title: string; snippet: string; documentId?: string; evidenceId?: string }[] =
    []

  for (const rule of seedSearchRules) {
    if (rule.requiredFlags?.some((f) => !_state.flags[f])) continue
    const required = rule.requiredTerms.map(normalizeTerm)
    if (!required.every((r) => terms.some((t) => t.includes(r) || r.includes(t)))) continue
    for (const r of rule.results) {
      hits.push({ ruleId: rule.id, ...r })
    }
  }

  const newTerms = seedSearchRules.flatMap((rule) =>
    rule.discoverTerms?.filter((t) => terms.some((q) => q.includes(normalizeTerm(t)))) ?? [],
  )

  return { hits, newTerms: [...new Set(newTerms.map(normalizeTerm))] }
}

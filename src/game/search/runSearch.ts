import { seedSearchRules } from '../../data/game/seedStory'
import { knowsAllTerms, normalizeTerm } from '../knowledge/knownTerms'
import { withKnownTermsFromFlags } from '../knowledge/seedTermsFromFlags'
import type { InvestigationState } from '../types'

export interface SearchHit {
  ruleId: string
  title: string
  snippet: string
  documentId?: string
}

export function runPoliceSearch(query: string, state: InvestigationState) {
  // Flags legadas (*_search_unlocked) contam como conhecimento na consulta.
  const knowledge = withKnownTermsFromFlags(state)
  const terms = query.split(/\s+/).map(normalizeTerm).filter((t) => t.length >= 2)

  const hits: SearchHit[] = []
  const seen = new Set<string>()

  for (const rule of seedSearchRules) {
    if (rule.requiredFlags?.some((f) => !state.flags[f])) continue
    if (rule.requiredKnownTerms?.length && !knowsAllTerms(knowledge, rule.requiredKnownTerms)) continue
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

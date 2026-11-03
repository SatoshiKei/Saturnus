import { useState } from 'react'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import { runPoliceSearch } from '../../../game/search/runSearch'
import { dispatchActions } from '../../../game/state/investigationStore'

export function PoliceComputerPanel() {
  const inv = useInvestigation()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ title: string; snippet: string }[]>([])

  const search = () => {
    const { hits, newTerms } = runPoliceSearch(query, inv)
    setResults(hits.map(({ title, snippet }) => ({ title, snippet })))
    if (newTerms.length) {
      dispatchActions(newTerms.map((term) => ({ type: 'discoverSearchTerm', term })))
    }
  }

  return (
    <div data-testid="police-computer">
      <p className="inv-muted">Busca manual — digite termos conhecidos.</p>
      <div className="inv-search-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex.: maralto wavelab"
          data-testid="police-search-input"
        />
        <button type="button" onClick={search} data-testid="police-search-submit">
          Buscar
        </button>
      </div>
      <ul className="inv-list">
        {results.map((r) => (
          <li key={r.title}>
            <strong>{r.title}</strong>
            <p>{r.snippet}</p>
          </li>
        ))}
      </ul>
      {inv.searchTermsDiscovered.length ? (
        <p className="inv-muted">Termos descobertos: {inv.searchTermsDiscovered.join(', ')}</p>
      ) : null}
    </div>
  )
}

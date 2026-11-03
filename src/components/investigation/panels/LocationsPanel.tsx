import { useInvestigation } from '../../../game/hooks/useInvestigation'

export function LocationsPanel() {
  const inv = useInvestigation()
  return (
    <ul className="inv-list" data-testid="locations-panel">
      {Object.values(inv.locations).map((l) => (
        <li key={l.id}>
          {l.status === 'unknown' ? (
            <span className="inv-muted">Local desconhecido ({l.id})</span>
          ) : (
            <>
              <strong>{l.name}</strong> — {l.description} · {l.status}
            </>
          )}
        </li>
      ))}
    </ul>
  )
}

import { useInvestigation } from '../../game/hooks/useInvestigation'

export function ObjectivesStrip() {
  const inv = useInvestigation()
  const open = inv.tasks.filter((t) => !t.completed)
  if (!open.length) return null
  return (
    <aside className="inv-objectives" aria-label="Pendências da investigação" data-testid="objectives-strip">
      <span className="inv-objectives__kicker">Lista de Augusto</span>
      <strong className="inv-objectives__title">Pendências</strong>
      <ul>
        {open.map((t) => (
          <li key={t.id}>{t.label}</li>
        ))}
      </ul>
    </aside>
  )
}

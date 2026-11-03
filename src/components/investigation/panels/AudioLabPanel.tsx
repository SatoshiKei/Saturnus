import { useInvestigation } from '../../../game/hooks/useInvestigation'

export function AudioLabPanel() {
  const inv = useInvestigation()
  const locked = inv.evidenceOwned
    .map((id) => inv.evidence[id])
    .filter((e) => e && e.exportable === false)

  return (
    <div data-testid="audio-lab">
      <p>Estação forense de Augusto — arquivos exportáveis apenas.</p>
      <ul className="inv-list">
        {inv.evidenceOwned.map((id) => {
          const e = inv.evidence[id]
          if (e?.type !== 'audio' && e?.type !== 'derived') return null
          const blocked = e.exportable === false || e.deviceLocked
          return (
            <li key={id}>
              {e.title}
              {blocked ? (
                <span className="inv-badge" data-testid={`export-blocked-${id}`}>
                  Não exportável — use processamento no aparelho
                </span>
              ) : (
                <span className="inv-muted"> Disponível para análise</span>
              )}
            </li>
          )
        })}
      </ul>
      {locked.length ? (
        <p className="inv-muted">
          {locked.length} item(ns) permanecem no sandbox do celular apreendido.
        </p>
      ) : null}
    </div>
  )
}

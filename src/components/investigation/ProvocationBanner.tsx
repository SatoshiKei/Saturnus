import { seedProvocations } from '../../data/game/seedStory'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { dismissProvocation } from '../../game/state/investigationStore'

export function ProvocationBanner() {
  const inv = useInvestigation()
  const id = inv.provocationsPending[0]
  if (!id) return null
  const ev = seedProvocations.find((p) => p.id === id)
  return (
    <div className="inv-provocation" data-testid="provocation-banner">
      <p>{ev?.preview ?? 'Mensagem desconhecida'}</p>
      <button type="button" onClick={() => dismissProvocation(id)}>
        Arquivar
      </button>
    </div>
  )
}

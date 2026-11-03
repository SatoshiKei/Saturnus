import { seedProvocations } from '../../data/game/seedStory'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { dismissProvocation } from '../../game/state/investigationStore'

const channelLabel: Record<string, string> = {
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  call: 'Chamada',
  audio: 'Áudio',
  email: 'E-mail',
  computer: 'Terminal',
  physical: 'Objeto',
}

/**
 * Mensagem de origem desconhecida. Aparece como notificação discreta de dispositivo,
 * sem nomear a fonte.
 */
export function ProvocationBanner() {
  const inv = useInvestigation()
  const id = inv.provocationsPending[0]
  if (!id) return null
  const ev = seedProvocations.find((p) => p.id === id)
  return (
    <div className="provocation" data-testid="provocation-banner" role="status">
      <span className="provocation__meta">
        {channelLabel[ev?.channel ?? 'sms']} · remetente desconhecido
      </span>
      <p className="provocation__text">{ev?.preview ?? 'Mensagem sem identificação.'}</p>
      <button type="button" className="provocation__dismiss" onClick={() => dismissProvocation(id)}>
        Arquivar
      </button>
    </div>
  )
}

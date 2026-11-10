import { useEffect } from 'react'
import { useGameHub } from '../../app/GameHubContext'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { focusNotebook, useUiState } from '../../app/uiStore'
import { dismissDiscovery } from '../../game/state/investigationStore'
import type { DiscoveryEvent, DiscoveryKind, HubPanel } from '../../game/types'
import { playSfx, type SfxId } from '../../lib/sfx'
import '../../styles/investigation.css'

const KIND_LABEL: Record<DiscoveryKind, string> = {
  evidence: 'NOVA EVIDÊNCIA',
  document: 'DOCUMENTO RECEBIDO',
  contact: 'NOVO CONTATO',
  location: 'NOVO LOCAL',
  audio: 'NOVO ÁUDIO',
  hypothesis: 'HIPÓTESE',
  objective: 'NOVO OBJETIVO',
  contradiction: 'CONTRADIÇÃO REGISTRADA',
  message: 'MENSAGEM',
}

const KIND_SFX: Record<DiscoveryKind, SfxId> = {
  evidence: 'evidence',
  document: 'document',
  contact: 'contact',
  location: 'location',
  audio: 'audio-new',
  hypothesis: 'objective',
  objective: 'objective',
  contradiction: 'contradiction',
  message: 'message',
}

const KIND_ACTION: Partial<Record<DiscoveryKind, { label: string; panel: HubPanel }>> = {
  location: { label: 'Abrir o mapa', panel: 'map' },
  audio: { label: 'Ir à bancada', panel: 'audio-lab' },
  contradiction: { label: 'Ver no caderno', panel: 'casebook' },
}

function noticeLabel(ev: DiscoveryEvent): string {
  if (ev.label) return ev.label
  if (ev.kind === 'audio' && (ev.count ?? 1) > 1) return 'NOVOS ÁUDIOS'
  return KIND_LABEL[ev.kind]
}

function Glyph({ kind }: { kind: DiscoveryKind }) {
  const common = { viewBox: '0 0 24 24', width: 22, height: 22, 'aria-hidden': true } as const
  switch (kind) {
    case 'evidence':
      return (
        <svg {...common}>
          <path fill="currentColor" d="M5 3h10l4 4v14H5V3zm9 1.5V8h3.5L14 4.5zM8 12h8v1.4H8V12zm0 3h8v1.4H8V15zm0-6h4v1.4H8V9z" />
        </svg>
      )
    case 'contact':
      return (
        <svg {...common}>
          <path fill="currentColor" d="M6.6 10.8c1.4 2.8 3.4 5.2 6 6.8l2-2c.3-.3.8-.4 1.2-.2 1 .4 2.1.7 3.2.7.7 0 1.2.5 1.2 1.2V20c0 .7-.5 1.2-1.2 1.2C9.2 21.2 2.8 14.8 2.8 6.8 2.8 6.1 3.3 5.6 4 5.6c1.1 0 2.2.3 3.2.7.4.2.9.1 1.2-.2l2-2z" />
        </svg>
      )
    case 'location':
      return (
        <svg {...common}>
          <path fill="currentColor" d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 119.5 9 2.5 2.5 0 0112 11.5z" />
        </svg>
      )
    case 'audio':
      return (
        <svg {...common}>
          <path fill="currentColor" d="M3 10h2v4H3v-4zm4-3h2v10H7V7zm4-4h2v18h-2V3zm4 4h2v10h-2V7zm4 3h2v4h-2v-4z" />
        </svg>
      )
    case 'contradiction':
      return (
        <svg {...common}>
          <path fill="currentColor" d="M12 2L1 21h22L12 2zm1 14h-2v-2h2v2zm0-4h-2V8h2v4z" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="5" fill="currentColor" />
        </svg>
      )
  }
}

/** DiscoveryCard claro — opt-in via presentation:'card'. Não auto-dismiss. */
function DiscoveryCard({ ev, onOpenNotebook }: { ev: DiscoveryEvent; onOpenNotebook: () => void }) {
  return (
    <div className="disc-card" role="status" data-testid="evidence-card" key={ev.id}>
      <button
        type="button"
        className="disc-card__close"
        aria-label="Fechar"
        data-testid="evidence-card-close"
        onClick={() => dismissDiscovery(ev.id)}
      >
        ×
      </button>
      <div className="disc-card__stamp">{ev.label ?? 'EVIDÊNCIA REGISTRADA'}</div>
      <div className="disc-card__head">
        <span className="disc-card__icon">
          <Glyph kind={ev.kind === 'evidence' ? 'evidence' : ev.kind} />
        </span>
        <h3 className="disc-card__title">{ev.title}</h3>
      </div>
      {ev.source ? <p className="disc-card__source">{ev.source}</p> : null}
      {ev.summary ? <p className="disc-card__summary">{ev.summary}</p> : null}
      {ev.subtitle && !ev.summary ? <p className="disc-card__summary">{ev.subtitle}</p> : null}
      <p className="disc-card__filed">Arquivada no caderno.</p>
      <div className="disc-card__actions">
        <button type="button" className="disc-card__btn" data-testid="evidence-card-notebook" onClick={onOpenNotebook}>
          Abrir no caderno
        </button>
      </div>
    </div>
  )
}

function Notice({ ev, action, onAction }: { ev: DiscoveryEvent; action?: { label: string }; onAction: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(() => dismissDiscovery(ev.id), action ? 5000 : 3500)
    return () => window.clearTimeout(t)
  }, [ev.id, action])
  return (
    <div className={`disc-notice disc-notice--${ev.kind}`} role="status" data-testid={`discovery-${ev.kind}`}>
      <span className="disc-notice__icon">
        <Glyph kind={ev.kind} />
      </span>
      <div className="disc-notice__body">
        <p className="disc-notice__label">{noticeLabel(ev)}</p>
        <p className="disc-notice__title">{ev.title}</p>
        {ev.subtitle ? <p className="disc-notice__sub">{ev.subtitle}</p> : null}
        {ev.summary && (ev.kind === 'contradiction' || !ev.subtitle) ? (
          <p className="disc-notice__sub">{ev.summary}</p>
        ) : null}
      </div>
      {action ? (
        <button type="button" className="disc-notice__btn" onClick={onAction}>
          {action.label}
        </button>
      ) : null}
      <button type="button" className="disc-notice__x" aria-label="Fechar" onClick={() => dismissDiscovery(ev.id)}>
        ×
      </button>
    </div>
  )
}

/** Fila: no máx. 1 item. Card claro (opt-in) ou notice preto. */
export function DiscoveryHost() {
  const inv = useInvestigation()
  const { openHub, locationScene, hubPanel } = useGameHub()
  const head = inv.discoveries[0]
  const { fullscreenScene, shell } = useUiState()
  const paused = Boolean(locationScene) || fullscreenScene || shell !== 'playing'
  const isCard = head?.presentation === 'card'

  useEffect(() => {
    if (paused || !head || isCard || head.kind !== 'location' || hubPanel !== 'map') return
    dismissDiscovery(head.id)
  }, [head, hubPanel, paused, isCard])

  useEffect(() => {
    if (!head || paused) return
    if (!isCard && head.kind === 'location' && hubPanel === 'map') return
    playSfx(KIND_SFX[head.kind])
  }, [head?.id, paused, hubPanel, isCard]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!head || paused) return null
  if (!isCard && head.kind === 'location' && hubPanel === 'map') return null

  if (isCard) {
    return (
      <div className="disc-layer" data-testid="discovery-layer">
        <DiscoveryCard
          key={head.id}
          ev={head}
          onOpenNotebook={() => {
            dismissDiscovery(head.id)
            focusNotebook('evidence', head.refId)
            openHub('casebook')
          }}
        />
      </div>
    )
  }

  const action = KIND_ACTION[head.kind]
  return (
    <div className="disc-layer disc-layer--notice" data-testid="discovery-layer">
      <Notice
        key={head.id}
        ev={head}
        action={action}
        onAction={() => {
          dismissDiscovery(head.id)
          if (action) {
            if (action.panel === 'casebook') focusNotebook('contradictions')
            openHub(action.panel)
          }
        }}
      />
    </div>
  )
}

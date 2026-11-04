import { useEffect } from 'react'
import { getDocument } from '../../data/game/seedDocuments'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { extractFromDocument, openDocument } from '../../game/state/investigationStore'
import { registerInitialPoliceReport } from '../../game/story/block01Handlers'
import { playSfx } from '../../lib/sfx'

/** Documentos que ficam na pasta física da mesa (entregues na passagem do caso). */
export const PHYSICAL_DOC_IDS = [
  'doc-bo-inicial',
  'doc-central-chamada',
  'doc-entrada-apartamento',
  'doc-apreensao-celular',
  'doc-extracao-inicial',
]

const LEAD_NOTE: Record<string, string> = {
  phone: 'Número registrado na agenda do telefone fixo.',
  address: 'Endereço anotado no mapa.',
  institution: 'Setor anotado na agenda do telefone fixo.',
}

interface DocumentSheetProps {
  docId: string
  /** Se omitido, o documento não traz botão de voltar (o host do sistema cuida disso). */
  onBack?: () => void
  backLabel?: string
}

/** Folha de documento (papel): leitura, trechos extraíveis e pistas operacionais. */
export function DocumentSheet({ docId, onBack, backLabel = '‹ Voltar' }: DocumentSheetProps) {
  const inv = useInvestigation()
  const doc = getDocument(docId)

  useEffect(() => {
    if (!doc) return
    openDocument(doc.id)
    playSfx('paper')
  }, [doc])

  if (!doc) return null
  const progress = inv.documents[doc.id]

  return (
    <article className="cf-sheet" data-testid="case-document-view" data-doc-id={doc.id}>
      {onBack ? (
        <button type="button" className="cf-back" onClick={onBack}>
          {backLabel}
        </button>
      ) : null}
      <p className="cf-stamp">{doc.category}</p>
      <h3 className="cf-title">{doc.title}</h3>
      {doc.issuer || doc.dateLabel ? (
        <p className="cf-meta">
          {doc.issuer}
          {doc.issuer && doc.dateLabel ? ' · ' : ''}
          {doc.dateLabel}
        </p>
      ) : null}
      {doc.blocks.map((block) => {
        const extractable = block.id === 'b5' || block.extractableEvidenceId || block.extractAction
        const done = progress?.highlightedBlockIds.includes(block.id)
        return (
          <p key={block.id} className="cf-block" data-marked={done}>
            <span className="cf-block__text">{block.text}</span>
            {extractable ? (
              <button
                type="button"
                className="cf-mark"
                data-testid={block.id === 'b5' ? 'extract-b1' : `extract-${block.id}`}
                disabled={done}
                onClick={() => {
                  const actions: Parameters<typeof extractFromDocument>[2] = []
                  if (block.extractableEvidenceId) {
                    actions.push({ type: 'addEvidence', id: block.extractableEvidenceId })
                  }
                  if (block.extractAction) actions.push(block.extractAction)
                  if (doc.id === 'doc-bo-inicial' && block.id === 'b5') {
                    registerInitialPoliceReport()
                  }
                  extractFromDocument(block.id, doc.id, actions)
                }}
              >
                {done ? 'Registrado' : 'Registrar no caderno'}
              </button>
            ) : null}
          </p>
        )
      })}
      {doc.leads?.length ? (
        <ul className="cf-leads" data-testid="document-leads">
          {doc.leads.map((l) => (
            <li key={`${l.type}-${l.value}`} className="cf-lead" data-lead={l.type}>
              <span className="cf-lead__label">{l.label}</span>
              <span className="cf-lead__value">{l.value}</span>
              <span className="cf-lead__note">{LEAD_NOTE[l.type]}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}

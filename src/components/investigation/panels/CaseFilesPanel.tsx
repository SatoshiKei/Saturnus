import { useState } from 'react'
import { seedDocuments } from '../../../data/game/seedDocuments'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import {
  completeTask,
  extractFromDocument,
  markDocumentRead,
} from '../../../game/state/investigationStore'
import { GamePanel } from '../../ui/GamePanel'

/**
 * Pasta do caso (CaseFiles): índice de documentos como fichas e leitura em folha de papel.
 * Trechos extraíveis exibem um marcador na margem — o jogador escolhe o que extrair.
 */
export function CaseFiles({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  const [activeDoc, setActiveDoc] = useState<string | null>(null)
  const doc = activeDoc ? seedDocuments.find((d) => d.id === activeDoc) : null

  return (
    <GamePanel
      title={doc ? doc.title : 'Pasta do caso'}
      kicker={doc ? doc.category : 'Caso 0001/2026'}
      variant="paper"
      testId="hub-case-files"
      onClose={onClose}
    >
      {doc ? (
        <article className="cf-sheet" data-testid="case-document-view">
          <button type="button" className="cf-back" onClick={() => setActiveDoc(null)}>
            ‹ Índice da pasta
          </button>
          <p className="cf-stamp">{doc.category}</p>
          <h3 className="cf-title">{doc.title}</h3>
          {doc.blocks.map((block) => {
            const progress = inv.documents[doc.id]
            const extractable = block.id === 'b1' || block.extractableEvidenceId || block.extractAction
            const done = progress?.highlightedBlockIds.includes(block.id)
            return (
              <p key={block.id} className="cf-block" data-marked={done}>
                <span className="cf-block__text">{block.text}</span>
                {extractable ? (
                  <button
                    type="button"
                    className="cf-mark"
                    data-testid={`extract-${block.id}`}
                    disabled={done}
                    onClick={() => {
                      markDocumentRead(doc.id)
                      const actions: Parameters<typeof extractFromDocument>[2] = []
                      if (block.extractableEvidenceId) {
                        actions.push({ type: 'addEvidence', id: block.extractableEvidenceId })
                      }
                      if (block.extractAction) actions.push(block.extractAction)
                      if (doc.id === 'doc-bo-inicial' && block.id === 'b1') {
                        actions.push({ type: 'addEvidence', id: 'bo_inicial' })
                        completeTask('task_read_bo')
                      }
                      extractFromDocument(block.id, doc.id, actions)
                    }}
                  >
                    {done ? 'Extraído' : 'Extrair evidência'}
                  </button>
                ) : null}
              </p>
            )
          })}
        </article>
      ) : (
        <ul className="cf-index" data-testid="case-files-list">
          {seedDocuments.map((d) => {
            const read = inv.documents[d.id]?.read
            return (
              <li key={d.id}>
                <button type="button" className="cf-card" data-read={read} onClick={() => setActiveDoc(d.id)}>
                  <span className="cf-card__type">{d.category}</span>
                  <span className="cf-card__title">{d.title}</span>
                  <span className="cf-card__state">{read ? 'lido' : 'novo'}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </GamePanel>
  )
}

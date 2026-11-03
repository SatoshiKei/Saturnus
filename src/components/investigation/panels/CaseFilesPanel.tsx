import { useState } from 'react'
import { seedDocuments } from '../../../data/game/seedDocuments'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import { completeTask, extractFromDocument, markDocumentRead } from '../../../game/state/investigationStore'

export function CaseFilesPanel() {
  const inv = useInvestigation()
  const [activeDoc, setActiveDoc] = useState<string | null>(null)
  const doc = activeDoc ? seedDocuments.find((d) => d.id === activeDoc) : null

  if (doc) {
    const progress = inv.documents[doc.id]
    return (
      <article className="inv-doc" data-testid="case-document-view">
        <button type="button" className="inv-link" onClick={() => setActiveDoc(null)}>
          ← Documentos
        </button>
        <h3>{doc.title}</h3>
        {doc.blocks.map((block) => (
          <p key={block.id} className="inv-doc__block">
            {block.text}
            {block.id === 'b1' || block.extractableEvidenceId || block.extractAction ? (
              <button
                type="button"
                className="inv-doc__extract"
                data-testid={`extract-${block.id}`}
                disabled={progress?.highlightedBlockIds.includes(block.id)}
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
                Extrair evidência
              </button>
            ) : null}
          </p>
        ))}
      </article>
    )
  }

  return (
    <ul className="inv-list" data-testid="case-files-list">
      {seedDocuments.map((d) => (
        <li key={d.id}>
          <button type="button" className="inv-list__item" onClick={() => setActiveDoc(d.id)}>
            {d.title}
            {inv.documents[d.id]?.read ? ' · lido' : ''}
          </button>
        </li>
      ))}
    </ul>
  )
}

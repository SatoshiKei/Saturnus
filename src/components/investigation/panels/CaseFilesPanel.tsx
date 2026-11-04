import { useState } from 'react'
import { getDocument } from '../../../data/game/seedDocuments'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import { GamePanel } from '../../ui/GamePanel'
import { DocumentSheet, PHYSICAL_DOC_IDS } from '../DocumentSheet'

/**
 * Pasta do caso (CaseFiles): documentos físicos entregues na passagem do caso.
 * Documentos obtidos depois (consultas, autos, laudos) ficam no computador, não aqui.
 */
export function CaseFiles({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  const [activeDoc, setActiveDoc] = useState<string | null>(null)
  const doc = activeDoc ? getDocument(activeDoc) : null
  const owned = PHYSICAL_DOC_IDS.filter((id) => inv.documentsOwned.includes(id))

  return (
    <GamePanel
      title={doc ? doc.title : 'Pasta do caso'}
      kicker={doc ? doc.category : 'Caso 0001/2026'}
      variant="paper"
      testId="hub-case-files"
      onClose={onClose}
    >
      {doc ? (
        <DocumentSheet docId={doc.id} onBack={() => setActiveDoc(null)} backLabel="‹ Índice da pasta" />
      ) : (
        <ul className="cf-index" data-testid="case-files-list">
          {owned.map((id) => {
            const d = getDocument(id)
            if (!d) return null
            const read = inv.documents[d.id]?.read
            return (
              <li key={d.id}>
                <button
                  type="button"
                  className="cf-card"
                  data-read={read}
                  data-testid={`case-file-${d.id}`}
                  onClick={() => setActiveDoc(d.id)}
                >
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

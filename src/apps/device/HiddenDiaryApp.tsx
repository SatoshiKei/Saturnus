import { useState } from 'react'
import { block04DiaryEntries } from '../../data/block04/diaryEntries'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { setFlag } from '../../game/state/investigationStore'
import { onDiaryEntryRead } from '../../game/story/block04Handlers'

/**
 * Leitor do diário recuperado. Não é um app do launcher: só é montado pelo módulo Perícia do
 * computador, depois do acesso forense e do PIN digitado pelo jogador.
 */
export function DiaryReader({ onBack }: { onBack?: () => void }) {
  const inv = useInvestigation()
  const [openId, setOpenId] = useState<string | null>(null)
  const open = block04DiaryEntries.find((e) => e.id === openId)

  return (
    <div className="diary-reader" data-testid="hidden-diary-unlocked">
      <header className="diary-reader__head">
        {onBack ? (
          <button type="button" className="diary-reader__back" onClick={onBack}>
            ‹ Voltar ao laudo
          </button>
        ) : null}
        <h3>Diário — pacote local.priv.journal</h3>
      </header>
      {!open ? (
        <ul className="diary-list" data-testid="diary-entry-list">
          {block04DiaryEntries.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                className="diary-list__row"
                data-testid={`diary-entry-${e.id}`}
                data-read={Boolean(inv.flags[e.readFlag]) || undefined}
                onClick={() => {
                  setOpenId(e.id)
                  if (!inv.flags[e.readFlag]) {
                    setFlag(e.readFlag, true)
                    onDiaryEntryRead(e.id, Boolean(e.unlocksUnknownRecording))
                  }
                }}
              >
                <span>{e.title}</span>
                <span className="diary-list__date">{e.dateLabel}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <article className="diary-reader__entry" data-testid="diary-entry-view">
          <button type="button" className="diary-reader__back" onClick={() => setOpenId(null)}>
            ‹ Entradas
          </button>
          <h4>{open.title}</h4>
          <p className="diary-reader__date">{open.dateLabel}</p>
          <p className="diary-reader__body">{open.body}</p>
        </article>
      )}
    </div>
  )
}

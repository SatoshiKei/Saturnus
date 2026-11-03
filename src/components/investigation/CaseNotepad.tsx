import { useEffect, useRef, useState } from 'react'
import { useInvestigation } from '../../game/hooks/useInvestigation'

/**
 * Bloco de notas de Augusto (pendências).
 * Fechado: pequena aba no canto inferior esquerdo, com contagem discreta.
 * Aberto: folha lateral escura, sem ícones de produtividade.
 */
export function CaseNotepad() {
  const inv = useInvestigation()
  const [open, setOpen] = useState(false)
  const [fresh, setFresh] = useState(false)
  const lastOpenCount = useRef<number | null>(null)

  const pending = inv.tasks.filter((t) => !t.completed)
  const done = inv.tasks.filter((t) => t.completed)

  // pulsa discretamente quando surge uma pendência nova
  useEffect(() => {
    const prev = lastOpenCount.current
    lastOpenCount.current = pending.length
    if (prev !== null && pending.length > prev) {
      setFresh(true)
      const t = window.setTimeout(() => setFresh(false), 2600)
      return () => window.clearTimeout(t)
    }
  }, [pending.length])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <aside className="notepad" data-open={open} aria-label="Bloco de notas de Augusto" data-testid="objectives-strip">
      <button
        type="button"
        className="notepad__tab"
        aria-expanded={open}
        data-fresh={fresh}
        onClick={() => {
          setOpen((v) => !v)
          setFresh(false)
        }}
        data-testid="notepad-toggle"
      >
        <span>Pendências</span>
        {pending.length > 0 ? <b className="notepad__count">{pending.length}</b> : null}
      </button>

      <div className="notepad__sheet" aria-hidden={!open}>
        <p className="notepad__case">CASO MARIANA SILVA</p>
        <ul className="notepad__list">
          {pending.map((t) => (
            <li key={t.id} className="notepad__item">
              <span className="notepad__box" aria-hidden />
              {t.label}
            </li>
          ))}
          {done.map((t) => (
            <li key={t.id} className="notepad__item notepad__item--done">
              <span className="notepad__box notepad__box--done" aria-hidden />
              {t.label}
            </li>
          ))}
        </ul>
        {pending.length === 0 ? <p className="notepad__empty">Nada pendente no momento.</p> : null}
      </div>
    </aside>
  )
}

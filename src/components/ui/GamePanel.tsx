import { useEffect, useRef, type ReactNode } from 'react'

export type GamePanelVariant = 'paper' | 'terminal' | 'workbench' | 'console' | 'map'

interface GamePanelProps {
  /** Título curto exibido na barra (ex.: "Pasta do caso") */
  title: string
  /** Linha pequena acima do título (ex.: "CASO 0001/2026") */
  kicker?: string
  variant?: GamePanelVariant
  onClose: () => void
  children: ReactNode
  testId?: string
  /** Conteúdo à direita da barra (ex.: relógio do sistema) */
  barExtra?: ReactNode
  /** Rótulo do botão de voltar */
  backLabel?: string
}

/**
 * Painel base do jogo: ocupa quase toda a área do quadro 16:9, sem modal branco central.
 * - `paper`: documentos, pasta, caderno (folha sobre mesa escura)
 * - `terminal`: computador policial (tela dentro de uma moldura)
 * - `workbench`: bancada forense de áudio
 * - `console`: telefone fixo institucional
 * - `map`: mapa da cidade
 * Fecha com ESC, clique no véu ou botão de voltar. Animação curta (≈200 ms).
 */
export function GamePanel({
  title,
  kicker,
  variant = 'paper',
  onClose,
  children,
  testId,
  barExtra,
  backLabel = 'Voltar à mesa',
}: GamePanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="gp" data-variant={variant} data-testid={testId}>
      <div className="gp__veil" onClick={onClose} aria-hidden />
      <section className="gp__sheet" role="dialog" aria-label={title}>
        <header className="gp__bar">
          <button
            ref={closeRef}
            type="button"
            className="gp__back"
            data-testid="hub-close"
            onClick={onClose}
          >
            <span aria-hidden>‹</span> {backLabel}
          </button>
          <div className="gp__heading">
            {kicker ? <span className="gp__kicker">{kicker}</span> : null}
            <h2 className="gp__title">{title}</h2>
          </div>
          <div className="gp__extra">{barExtra}</div>
        </header>
        <div className="gp__body">{children}</div>
      </section>
    </div>
  )
}

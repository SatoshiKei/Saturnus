import { useEffect, useState, type CSSProperties } from 'react'
import { loadGame, resetGame } from '../../game/state/investigationStore'
import { assetPath } from '../../lib/assetPath'
import { resetHints, setMenuOpen } from '../../app/uiStore'
import '../../styles/investigation.css'

export function MainMenuOverlay() {
  const [visible, setVisible] = useState(() => !localStorage.getItem('saturnus-investigation-v1'))

  // a cena usa isto para só mostrar as dicas de primeira vez depois que o menu fechar
  useEffect(() => {
    setMenuOpen(visible)
    return () => setMenuOpen(false)
  }, [visible])

  if (!visible) return null

  return (
    <div
      className="inv-main-menu"
      data-testid="main-menu"
      style={{ '--menu-bg': `url(${assetPath('/assets/scene/hub-office-bg.jpg')})` } as CSSProperties}
    >
      <div className="inv-main-menu__card">
        <h1>SATURNUS</h1>
        <p>Caso 0001/2026 · Mariana Silva</p>
        <button
          type="button"
          data-testid="main-menu-continue"
          onClick={() => {
            loadGame()
            setVisible(false)
          }}
        >
          Continuar
        </button>
        <button
          type="button"
          data-testid="main-menu-new"
          onClick={() => {
            resetGame()
            resetHints()
            setVisible(false)
          }}
        >
          Novo jogo
        </button>
      </div>
    </div>
  )
}

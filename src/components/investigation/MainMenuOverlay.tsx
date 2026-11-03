import { useState } from 'react'
import { loadGame, resetGame } from '../../game/state/investigationStore'
import '../../styles/investigation.css'

export function MainMenuOverlay() {
  const [visible, setVisible] = useState(() => !localStorage.getItem('saturnus-investigation-v1'))

  if (!visible) return null

  return (
    <div className="inv-main-menu" data-testid="main-menu">
      <div className="inv-main-menu__card">
        <h1>SATURNUS</h1>
        <p>Investigação — protótipo de sistemas</p>
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
            setVisible(false)
          }}
        >
          Novo jogo
        </button>
      </div>
    </div>
  )
}

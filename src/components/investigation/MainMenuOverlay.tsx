import { useEffect, useState, type CSSProperties } from 'react'
import { loadGame, resetGame } from '../../game/state/investigationStore'
import { hasAnySave, hasAutosave } from '../../game/state/saveSlots'
import { assetPath } from '../../lib/assetPath'
import { enterGameplay, openTitleMenu, resetHints, resumeGameplay, useUiState } from '../../app/uiStore'
import { SaveLoadScreen } from './SaveLoadScreen'
import { AchievementsScreen } from './AchievementsScreen'
import '../../styles/investigation.css'

type View = 'root' | 'saves-load' | 'saves-write' | 'achievements' | 'confirm-new'

export function MainMenuOverlay() {
  const { shell } = useUiState()
  const [view, setView] = useState<View>('root')
  const [hasSave, setHasSave] = useState(() => hasAnySave())
  const [autosave, setAutosave] = useState(() => hasAutosave())

  useEffect(() => {
    if (shell !== 'playing') {
      setHasSave(hasAnySave())
      setAutosave(hasAutosave())
      setView('root')
    }
  }, [shell])

  if (shell === 'playing') return null

  const paused = shell === 'paused'
  const startNew = () => {
    resetGame()
    resetHints()
    enterGameplay()
  }

  return (
    <div
      className="inv-main-menu"
      data-testid="main-menu"
      data-paused={paused || undefined}
      style={{ '--menu-bg': `url(${assetPath('/assets/scene/hub-office-bg.jpg')})` } as CSSProperties}
    >
      {view === 'root' ? (
        <div className="inv-main-menu__card">
          <h1>SATURNUS</h1>
          <p>{paused ? 'Pausa' : 'Caso 0001/2026 · Mariana Silva'}</p>
          {paused ? (
            <button type="button" data-testid="main-menu-resume" onClick={() => resumeGameplay()}>
              Continuar
            </button>
          ) : autosave ? (
            <button
              type="button"
              data-testid="main-menu-continue"
              onClick={() => {
                loadGame()
                enterGameplay()
              }}
            >
              Continuar
            </button>
          ) : null}
          <button
            type="button"
            data-testid="main-menu-new"
            onClick={() => {
              if (hasSave) setView('confirm-new')
              else startNew()
            }}
          >
            Novo jogo
          </button>
          <button type="button" data-testid="main-menu-load" onClick={() => setView('saves-load')}>
            Carregar
          </button>
          {paused ? (
            <button type="button" data-testid="main-menu-save" onClick={() => setView('saves-write')}>
              Salvar
            </button>
          ) : null}
          <button type="button" data-testid="main-menu-achievements" onClick={() => setView('achievements')}>
            Conquistas
          </button>
          {paused ? (
            <button type="button" data-testid="main-menu-title" onClick={() => openTitleMenu()}>
              Tela inicial
            </button>
          ) : null}
        </div>
      ) : null}
      {view === 'confirm-new' ? (
        <div className="inv-main-menu__card" data-testid="new-game-confirm">
          <h1>SATURNUS</h1>
          <p>O progresso automático será substituído. Slots manuais permanecem.</p>
          <button type="button" data-testid="main-menu-new-confirm" onClick={startNew}>
            Confirmar novo jogo
          </button>
          <button type="button" onClick={() => setView('root')}>
            Cancelar
          </button>
        </div>
      ) : null}
      {view === 'saves-load' ? (
        <SaveLoadScreen mode="load" onBack={() => setView('root')} />
      ) : null}
      {view === 'saves-write' ? (
        <SaveLoadScreen mode="save" onBack={() => setView('root')} />
      ) : null}
      {view === 'achievements' ? <AchievementsScreen onBack={() => setView('root')} /> : null}
    </div>
  )
}

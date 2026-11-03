import { useState } from 'react'
import { block01DevCheckpoints } from '../../game/story/block01DevCheckpoints'
import { block02DevCheckpoints } from '../../game/story/block02DevCheckpoints'
import { devApply, resetGame } from '../../game/state/investigationStore'

export function DevStoryPanel() {
  const [open, setOpen] = useState(false)
  if (!open) {
    return (
      <button
        type="button"
        className="inv-dev-toggle"
        data-testid="dev-panel-open"
        onClick={() => setOpen(true)}
      >
        DEV
      </button>
    )
  }

  return (
    <div className="inv-dev" data-testid="dev-story-panel">
      <header>
        <strong>DEV STORY PANEL</strong>
        <button type="button" data-testid="dev-panel-close" onClick={() => setOpen(false)}>
          ×
        </button>
      </header>
      <p className="inv-dev__section">Bloco 1 — O desaparecimento</p>
      {block01DevCheckpoints.map((cp) => (
        <button
          key={cp.id}
          type="button"
          data-testid={`dev-${cp.id}`}
          onClick={() => {
            if (cp.id === 'b01-start') resetGame()
            else if (cp.actions.length) devApply(cp.actions)
          }}
        >
          {cp.label}
        </button>
      ))}
      <p className="inv-dev__section">Bloco 2 — Duas trilhas</p>
      {block02DevCheckpoints.map((cp) => (
        <button
          key={cp.id}
          type="button"
          data-testid={`dev-${cp.id}`}
          onClick={() => {
            if (cp.id === 'b02-start') {
              resetGame()
              devApply(cp.actions)
            } else if (cp.actions.length) devApply(cp.actions)
          }}
        >
          {cp.label}
        </button>
      ))}
      <button type="button" onClick={() => resetGame()}>
        Reset save
      </button>
    </div>
  )
}

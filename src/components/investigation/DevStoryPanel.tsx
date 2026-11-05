import { useState } from 'react'
import { block01DevCheckpoints } from '../../game/story/block01DevCheckpoints'
import { block02DevCheckpoints } from '../../game/story/block02DevCheckpoints'
import { block03DevCheckpoints } from '../../game/story/block03DevCheckpoints'
import { block04DevCheckpoints } from '../../game/story/block04DevCheckpoints'
import { block05DevCheckpoints } from '../../game/story/block05DevCheckpoints'
import { block06DevCheckpoints } from '../../game/story/block06DevCheckpoints'
import { block07DevCheckpoints } from '../../game/story/block07DevCheckpoints'
import { block08DevCheckpoints } from '../../game/story/block08DevCheckpoints'
import { block09DevCheckpoints } from '../../game/story/block09DevCheckpoints'
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
      <p className="inv-dev__section">Bloco 3 — Noites fora de ordem</p>
      {block03DevCheckpoints.map((cp) => (
        <button
          key={cp.id}
          type="button"
          data-testid={`dev-${cp.id}`}
          onClick={() => {
            if (cp.id === 'b03-start') {
              resetGame()
              devApply(cp.actions)
            } else if (cp.actions.length) devApply(cp.actions)
          }}
        >
          {cp.label}
        </button>
      ))}
      <p className="inv-dev__section">Bloco 4 — Memórias que não pertencem</p>
      {block04DevCheckpoints.map((cp) => (
        <button
          key={cp.id}
          type="button"
          data-testid={`dev-${cp.id}`}
          onClick={() => {
            if (cp.id === 'b04-start') {
              resetGame()
              devApply(cp.actions)
            } else if (cp.actions.length) devApply(cp.actions)
          }}
        >
          {cp.label}
        </button>
      ))}
      <p className="inv-dev__section">Bloco 5 — O percurso deixado</p>
      {block05DevCheckpoints.map((cp) => (
        <button
          key={cp.id}
          type="button"
          data-testid={`dev-${cp.id}`}
          onClick={() => {
            if (cp.id === 'b05-start') {
              resetGame()
              devApply(cp.actions)
            } else if (cp.actions.length) devApply(cp.actions)
          }}
        >
          {cp.label}
        </button>
      ))}
      <p className="inv-dev__section">Bloco 6 — A pessoa errada</p>
      {block06DevCheckpoints.map((cp) => (
        <button
          key={cp.id}
          type="button"
          data-testid={`dev-${cp.id}`}
          onClick={() => {
            if (cp.id === 'b06-start') {
              resetGame()
              devApply(cp.actions)
            } else if (cp.actions.length) devApply(cp.actions)
          }}
        >
          {cp.label}
        </button>
      ))}
      <p className="inv-dev__section">Bloco 7 — O homem que não era Ricardo</p>
      {block07DevCheckpoints.map((cp) => (
        <button
          key={cp.id}
          type="button"
          data-testid={`dev-${cp.id}`}
          onClick={() => {
            if (cp.id === 'b07-start') {
              resetGame()
              devApply(cp.actions)
            } else if (cp.actions.length) devApply(cp.actions)
          }}
        >
          {cp.label}
        </button>
      ))}
      <p className="inv-dev__section">Bloco 8 — A noite sem assassinato</p>
      {block08DevCheckpoints.map((cp) => (
        <button
          key={cp.id}
          type="button"
          data-testid={`dev-${cp.id}`}
          onClick={() => {
            if (cp.id === 'b08-start') {
              resetGame()
              devApply(cp.actions)
            } else if (cp.actions.length) devApply(cp.actions)
          }}
        >
          {cp.label}
        </button>
      ))}
      <p className="inv-dev__section">Bloco 9 — MEMÓRIA</p>
      {block09DevCheckpoints.map((cp) => (
        <button
          key={cp.id}
          type="button"
          data-testid={`dev-${cp.id}`}
          onClick={() => {
            if (cp.id === 'b09-start') {
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

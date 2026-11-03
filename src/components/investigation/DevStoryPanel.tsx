import { useState } from 'react'
import {
  devApply,
  discoverPerson,
  resetGame,
  revealHiddenApps,
} from '../../game/state/investigationStore'

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
      <button
        type="button"
        data-testid="dev-discover-mariana-password"
        onClick={() => devApply([{ type: 'discoverPassword', which: 'marianaAccount' }])}
      >
        Descobrir senha conta Mariana
      </button>
      <button
        type="button"
        data-testid="dev-discover-diary-password"
        onClick={() => devApply([{ type: 'discoverPassword', which: 'diary' }])}
      >
        Descobrir senha diário
      </button>
      <button type="button" onClick={() => revealHiddenApps()}>
        Revelar apps ocultos
      </button>
      <button type="button" onClick={() => discoverPerson('rafael', 'contactable')}>
        Rafael → contactable
      </button>
      <button
        type="button"
        onClick={() =>
          devApply([
            { type: 'addEvidence', id: 'julia_statement_memory' },
            { type: 'addEvidence', id: 'mariana_memory_audio' },
          ])
        }
      >
        + evidências contradição demo
      </button>
      <button type="button" onClick={() => resetGame()}>
        Reset save
      </button>
    </div>
  )
}

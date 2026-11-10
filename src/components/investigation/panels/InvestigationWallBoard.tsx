import { LinkBoard } from '../LinkBoard'
import { GamePanel } from '../../ui/GamePanel'
import { useGameHub } from '../../../app/GameHubContext'
import { focusNotebook } from '../../../app/uiStore'

/** Quadro de cortiça na parede — zoom da câmera + superfície física, não “tela” de workbench. */
export function InvestigationWallBoard({ onClose }: { onClose: () => void }) {
  const { openHub } = useGameHub()

  return (
    <GamePanel
      title="Quadro de ligações"
      kicker="Delegacia · parede"
      variant="cork"
      backLabel="Afastar"
      testId="hub-wall-board"
      onClose={onClose}
    >
      <div className="wall-board-focus" data-testid="investigation-wall-board">
        <LinkBoard
          onOpen={(tab, id) => {
            focusNotebook(tab, id)
            onClose()
            openHub('casebook')
          }}
        />
      </div>
    </GamePanel>
  )
}

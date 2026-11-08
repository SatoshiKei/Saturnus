import { mockNotes } from '../../data/mockNotes'
import { usePhoneSession } from '../../app/PhoneSessionContext'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { openNote } from '../../lib/phoneRouter'

interface NotesHomeProps {
  onBack: () => void
}

export function NotesHome({ onBack }: NotesHomeProps) {
  const { push } = usePhoneSession()
  const inv = useInvestigation()
  const highlightSess =
    inv.flags.block07_revisit_mariana_clue_unlocked && !inv.flags.block07_partial_id_noted

  return (
    <div className="notes-app" data-testid="notes-home">
      <header className="ios-app-header ios-app-header--notes">
        <button type="button" className="ios-app-header__back" onClick={onBack}>
          ‹ Início
        </button>
        <h1>Notas</h1>
      </header>
      <ul className="notes-list">
        {mockNotes.map((note) => (
          <li key={note.id}>
            <button
              type="button"
              className="notes-list__row"
              data-testid={`note-row-${note.id}`}
              data-sess-reread={highlightSess && note.id === 'n-sess' ? true : undefined}
              onClick={() => push(openNote(note.id))}
            >
              <span className="notes-list__title">{note.title}</span>
              <span className="notes-list__preview">{note.body.split('\n')[0]}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

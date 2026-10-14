import { mockNotes } from '../../data/mockNotes'
import { usePhoneSession } from '../../app/PhoneSessionContext'
import { openNote } from '../../lib/phoneRouter'

interface NotesHomeProps {
  onBack: () => void
}

export function NotesHome({ onBack }: NotesHomeProps) {
  const { push } = usePhoneSession()

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

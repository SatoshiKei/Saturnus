import { mockNotes } from '../../data/mockNotes'

interface NoteViewProps {
  noteId: string
  onBack: () => void
}

export function NoteView({ noteId, onBack }: NoteViewProps) {
  const note = mockNotes.find((n) => n.id === noteId)

  if (!note) {
    return <p className="notes-view">Nota não encontrada.</p>
  }

  return (
    <div className="notes-view" data-testid="note-view">
      <header className="ios-app-header ios-app-header--notes">
        <button type="button" className="ios-app-header__back" onClick={onBack} aria-label="Voltar">
          ‹ Notas
        </button>
        <span className="notes-view__date">{note.updatedAt}</span>
      </header>
      <article className="notes-view__article">
        <h1>{note.title}</h1>
        {note.body.split('\n').map((line, i) => (
          <p key={i}>{line || '\u00A0'}</p>
        ))}
      </article>
    </div>
  )
}

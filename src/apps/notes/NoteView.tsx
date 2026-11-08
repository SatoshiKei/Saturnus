import { mockNotes } from '../../data/mockNotes'
import { onNoteRead } from '../../game/story/block01Handlers'
import { onMarianaPartialIdRevisited } from '../../game/story/block07Handlers'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { useEffect } from 'react'

interface NoteViewProps {
  noteId: string
  onBack: () => void
}

export function NoteView({ noteId, onBack }: NoteViewProps) {
  const note = mockNotes.find((n) => n.id === noteId)
  const inv = useInvestigation()
  const highlightSess =
    noteId === 'n-sess' &&
    inv.flags.block07_revisit_mariana_clue_unlocked &&
    !inv.flags.block07_partial_id_noted

  useEffect(() => {
    if (note?.storyFlag) onNoteRead(note.storyFlag)
    if (noteId === 'n-sess') onMarianaPartialIdRevisited()
  }, [note?.storyFlag, noteId])

  if (!note) {
    return <p className="notes-view">Nota não encontrada.</p>
  }

  return (
    <div className="notes-view" data-testid="note-view">
      <header className="ios-app-header ios-app-header--notes">
        <div className="notes-view__nav">
          <button type="button" className="ios-app-header__back" onClick={onBack} aria-label="Voltar">
            ‹ Notas
          </button>
          <span className="notes-view__date">{note.updatedAt}</span>
        </div>
      </header>
      <article
        className="notes-view__article"
        data-testid="note-view-article"
        data-sess-reread={highlightSess || undefined}
      >
        <h1>{note.title}</h1>
        {note.body.split('\n').map((line, i) => (
          <p
            key={i}
            className={
              highlightSess && line.toLowerCase().includes('hvalenca')
                ? 'notes-view__line--mark'
                : undefined
            }
          >
            {line || '\u00A0'}
          </p>
        ))}
      </article>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { useGameHub } from '../../app/GameHubContext'
import {
  augustoFilesLibrary,
  marianaFilesLibrary,
  type PhoneMediaItem,
} from '../../data/block01/phoneMedia'
import { contactAvatarSrc } from '../../lib/characterSprites'

interface FilesAppProps {
  onBack: () => void
}

export function FilesApp({ onBack }: FilesAppProps) {
  const { phoneDevice } = useGameHub()
  const items = phoneDevice === 'augusto' ? augustoFilesLibrary : marianaFilesLibrary
  const folders = useMemo(() => {
    const set = new Set(items.map((i) => i.folder ?? 'Outros'))
    return [...set]
  }, [items])
  const [folder, setFolder] = useState(folders[0] ?? 'WhatsApp')
  const visible = items.filter((i) => (i.folder ?? 'Outros') === folder)

  return (
    <div className="ios-files" data-testid="files-app">
      <header className="ios-app-header">
        <button type="button" className="ios-app-header__back" onClick={onBack}>
          ‹ Início
        </button>
        <h1>Arquivos</h1>
      </header>
      <nav className="ios-files__folders" aria-label="Pastas">
        {folders.map((f) => (
          <button
            key={f}
            type="button"
            className="ios-files__folder"
            data-active={f === folder}
            onClick={() => setFolder(f)}
          >
            {f}
          </button>
        ))}
      </nav>
      <ul className="ios-files__list">
        {visible.map((item) => (
          <FileRow key={item.id} item={item} />
        ))}
      </ul>
    </div>
  )
}

function FileRow({ item }: { item: PhoneMediaItem }) {
  const src = item.spriteId ? contactAvatarSrc(item.spriteId) : undefined
  return (
    <li className="ios-files__row">
      {src ? (
        <img src={src} alt="" className="ios-files__thumb" />
      ) : (
        <span className="ios-files__icon" aria-hidden>
          📄
        </span>
      )}
      <span className="ios-files__name">{item.label}</span>
    </li>
  )
}

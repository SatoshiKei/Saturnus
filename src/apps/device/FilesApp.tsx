import { useMemo, useState } from 'react'
import { useGameHub } from '../../app/GameHubContext'
import {
  augustoFilesLibrary,
  marianaFilesLibrary,
  type PhoneMediaItem,
} from '../../data/block01/phoneMedia'
import { contactAvatarSrc } from '../../lib/characterSprites'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { onMarianaMaraltoRecordingFound } from '../../game/story/block03Handlers'

interface FilesAppProps {
  onBack: () => void
}

export function FilesApp({ onBack }: FilesAppProps) {
  const { phoneDevice } = useGameHub()
  const inv = useInvestigation()
  const base = phoneDevice === 'augusto' ? augustoFilesLibrary : marianaFilesLibrary
  const items = useMemo(() => {
    if (phoneDevice !== 'mariana') return base
    const extra: PhoneMediaItem[] = []
    if (inv.flags.block03_reanalysis_unlocked) {
      extra.push({
        id: 'mf-rec-maralto',
        label: 'REC_1102.m4a',
        folder: 'Downloads',
      })
    }
    return [...base, ...extra]
  }, [base, phoneDevice, inv.flags.block03_reanalysis_unlocked])

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
  const inv = useInvestigation()
  const src = item.spriteId ? contactAvatarSrc(item.spriteId) : undefined
  const actionable =
    item.id === 'mf-rec-maralto' &&
    inv.flags.block03_reanalysis_unlocked &&
    !inv.flags.block03_maralto_recording_found

  return (
    <li className="ios-files__row">
      {src ? (
        <img src={src} alt="" className="ios-files__thumb" />
      ) : (
        <span className="ios-files__icon" aria-hidden>
          📄
        </span>
      )}
      {actionable ? (
        <button
          type="button"
          className="ios-files__action"
          data-testid="mariana-maralto-file"
          onClick={() => onMarianaMaraltoRecordingFound()}
        >
          {item.label}
          <span className="ios-files__hint">Reanalisar</span>
        </button>
      ) : (
        <span className="ios-files__name">
          {item.label}
          {item.id === 'mf-rec-maralto' && inv.flags.block03_maralto_recording_found ? (
            <span className="ios-files__hint">Exportado</span>
          ) : null}
        </span>
      )}
    </li>
  )
}

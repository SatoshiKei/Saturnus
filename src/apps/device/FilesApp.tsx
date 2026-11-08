import { useMemo, useState } from 'react'
import { useGameHub } from '../../app/GameHubContext'
import {
  PROVENANCE_LABEL,
  augustoFilesLibrary,
  marianaFilesLibrary,
  type PhoneMediaItem,
} from '../../data/block01/phoneMedia'
import { contactAvatarSrc } from '../../lib/characterSprites'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { onMarianaMaraltoRecordingFound } from '../../game/story/block03Handlers'
import { onUnknownRecordingFound } from '../../game/story/block04Handlers'

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
        provenance: 'existing_hidden',
        provenanceNote: 'Arquivo localizado após reanálise',
      })
    }
    if (inv.flags.block04_unknown_recording_unlocked) {
      extra.push({
        id: 'mf-chk-unk',
        label: 'CHK_UNK.m4a',
        folder: 'Downloads',
        provenance: 'existing_hidden',
        provenanceNote: 'Localizado após referência no diário',
      })
    }
    return [...base, ...extra]
  }, [
    base,
    phoneDevice,
    inv.flags.block03_reanalysis_unlocked,
    inv.flags.block04_unknown_recording_unlocked,
  ])

  const folders = useMemo(() => {
    const set = new Set(items.map((i) => i.folder ?? 'Outros'))
    return [...set]
  }, [items])
  const [folder, setFolder] = useState(folders[0] ?? 'WhatsApp')
  const visible = items.filter((i) => (i.folder ?? 'Outros') === folder)

  return (
    <div className="ios-files" data-testid="files-app">
      <header className="ios-app-header ios-app-header--files">
        <button type="button" className="ios-app-header__back" onClick={onBack}>
          ‹ Início
        </button>
        <h1>Arquivos</h1>
      </header>
      <nav className="ios-files__folders" aria-label="Pastas" role="tablist">
        {folders.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={f === folder}
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

function provenanceHint(item: PhoneMediaItem, exported: boolean): string | null {
  if (exported) return PROVENANCE_LABEL.exported
  if (item.provenanceNote) return item.provenanceNote
  if (item.provenance) return PROVENANCE_LABEL[item.provenance]
  return null
}

function FileRow({ item }: { item: PhoneMediaItem }) {
  const inv = useInvestigation()
  const src = item.spriteId ? contactAvatarSrc(item.spriteId) : undefined
  const maraltoAction =
    item.id === 'mf-rec-maralto' &&
    inv.flags.block03_reanalysis_unlocked &&
    !inv.flags.block03_maralto_recording_found
  const unkAction =
    item.id === 'mf-chk-unk' &&
    inv.flags.block04_unknown_recording_unlocked &&
    !inv.flags.block04_unknown_recording_found
  const exported =
    (item.id === 'mf-rec-maralto' && inv.flags.block03_maralto_recording_found) ||
    (item.id === 'mf-chk-unk' && inv.flags.block04_unknown_recording_found)
  const hint = provenanceHint(item, exported)

  return (
    <li className="ios-files__row">
      {src ? (
        <img src={src} alt="" className="ios-files__thumb" />
      ) : (
        <span className="ios-files__icon" aria-hidden>
          📄
        </span>
      )}
      {maraltoAction ? (
        <button
          type="button"
          className="ios-files__action"
          data-testid="mariana-maralto-file"
          onClick={() => onMarianaMaraltoRecordingFound()}
        >
          {item.label}
          {hint ? <span className="ios-files__hint">{hint}</span> : null}
          <span className="ios-files__hint ios-files__hint--action">Reanalisar</span>
        </button>
      ) : unkAction ? (
        <button
          type="button"
          className="ios-files__action"
          data-testid="mariana-unknown-file"
          onClick={() => onUnknownRecordingFound()}
        >
          {item.label}
          {hint ? <span className="ios-files__hint">{hint}</span> : null}
          <span className="ios-files__hint ios-files__hint--action">Exportar para bancada</span>
        </button>
      ) : (
        <span className="ios-files__name">
          {item.label}
          {hint ? <span className="ios-files__hint">{hint}</span> : null}
        </span>
      )}
    </li>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { useGameHub } from '../../app/GameHubContext'
import {
  PROVENANCE_LABEL,
  augustoFilesLibrary,
  marianaFilesLibrary,
  type PhoneMediaItem,
} from '../../data/block01/phoneMedia'
import { contactAvatarSrc } from '../../lib/characterSprites'
import { UiGlyph } from '../../components/UiGlyph'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { comparePhoneFilesSequence } from '../../game/story/block05Handlers'
import { CHK_UNK_PHONE_FILE_ID } from '../../data/block04/chkUnkRecording'
import { onUnknownRecordingFound } from '../../game/story/block04Handlers'
import { ChkUnkAudioViewer } from './ChkUnkAudioViewer'

interface FilesAppProps {
  onBack: () => void
}

export function FilesApp({ onBack }: FilesAppProps) {
  const { phoneDevice } = useGameHub()
  const inv = useInvestigation()

  // B5: comparar cronologia × arquivos — abrir Arquivos no celular de Mariana basta.
  useEffect(() => {
    if (phoneDevice !== 'mariana') return
    if (
      inv.flags.block05_compare_unlocked &&
      inv.flags.block05_chronology_done &&
      !inv.flags.block05_compare_done
    ) {
      comparePhoneFilesSequence()
    }
  }, [
    phoneDevice,
    inv.flags.block05_compare_unlocked,
    inv.flags.block05_chronology_done,
    inv.flags.block05_compare_done,
  ])

  const [query, setQuery] = useState('')
  const base = phoneDevice === 'augusto' ? augustoFilesLibrary : marianaFilesLibrary
  const items = useMemo(() => {
    if (phoneDevice !== 'mariana') return base
    const extra: PhoneMediaItem[] = []
    const chkQuery = /chk[_\s-]?unk/i.test(query)
    const showChkUnk =
      inv.flags.block04_unknown_recording_found ||
      (inv.flags.block04_unknown_recording_unlocked && chkQuery)
    if (showChkUnk) {
      extra.push({
        id: 'mf-chk-unk',
        label: 'CHK_UNK.m4a',
        folder: 'Downloads',
        provenance: 'existing_hidden',
        provenanceNote: inv.flags.block04_unknown_recording_found
          ? 'Localizado após referência no diário'
          : 'Nome conferido com o diário',
      })
    }
    return [...base, ...extra]
  }, [
    base,
    phoneDevice,
    query,
    inv.flags.block04_unknown_recording_unlocked,
    inv.flags.block04_unknown_recording_found,
  ])

  const folders = useMemo(() => {
    const set = new Set(items.map((i) => i.folder ?? 'Outros'))
    return [...set]
  }, [items])
  const [folder, setFolder] = useState(folders[0] ?? 'WhatsApp')
  const [chkPlayerOpen, setChkPlayerOpen] = useState(false)
  const q = query.trim().toLowerCase()
  const visible = items.filter((i) => {
    if ((i.folder ?? 'Outros') !== folder) return false
    if (!q) return true
    return i.label.toLowerCase().includes(q) || i.id.toLowerCase().includes(q)
  })

  return (
    <div className="ios-files" data-testid="files-app">
      <header className="ios-app-header ios-app-header--files">
        <button type="button" className="ios-app-header__back" onClick={onBack}>
          ‹ Início
        </button>
        <h1>Arquivos</h1>
      </header>
      {phoneDevice === 'mariana' ? (
        <input
          type="search"
          className="ios-files__search"
          data-testid="files-search"
          aria-label="Buscar arquivo"
          placeholder="Buscar"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      ) : null}
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
          <FileRow
            key={item.id}
            item={item}
            onOpenChkUnk={() => {
              if (!inv.flags.block04_unknown_recording_found) onUnknownRecordingFound()
              setChkPlayerOpen(true)
            }}
          />
        ))}
      </ul>
      {chkPlayerOpen ? <ChkUnkAudioViewer onClose={() => setChkPlayerOpen(false)} /> : null}
    </div>
  )
}

function provenanceHint(item: PhoneMediaItem, exported: boolean): string | null {
  if (exported) return PROVENANCE_LABEL.exported
  if (item.provenanceNote) return item.provenanceNote
  if (item.provenance) return PROVENANCE_LABEL[item.provenance]
  return null
}

function FileRow({ item, onOpenChkUnk }: { item: PhoneMediaItem; onOpenChkUnk: () => void }) {
  const inv = useInvestigation()
  const src = item.spriteId ? contactAvatarSrc(item.spriteId) : undefined
  const isChk = item.id === CHK_UNK_PHONE_FILE_ID
  const chkOpenable = isChk && inv.flags.block04_unknown_recording_unlocked
  const hint = provenanceHint(
    item,
    isChk && inv.flags.block04_unknown_recording_found,
  )

  return (
    <li className="ios-files__row">
      {src ? (
        <img src={src} alt="" className="ios-files__thumb" />
      ) : (
        <span className="ios-files__icon" aria-hidden>
          <UiGlyph name="doc" />
        </span>
      )}
      {chkOpenable ? (
        <button
          type="button"
          className="ios-files__action"
          data-testid="mariana-unknown-file"
          onClick={onOpenChkUnk}
        >
          {item.label}
          {hint ? <span className="ios-files__hint">{hint}</span> : null}
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

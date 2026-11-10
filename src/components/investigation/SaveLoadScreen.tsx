import { useMemo, useState } from 'react'
import {
  applyLoadedState,
  getInvestigationState,
  loadGame,
} from '../../game/state/investigationStore'
import {
  MANUAL_SLOT_IDS,
  hasAnySave,
  readManualSnapshot,
  readSaveIndex,
  writeManualSlot,
  type SaveSlotId,
  type SaveSlotMeta,
} from '../../game/state/saveSlots'
import { captureSaveThumbnail } from '../../lib/saveThumbnail'
import { formatPlayTimeClock, formatSaveClock } from '../../lib/caseProgress'
import { enterGameplay, useUiState } from '../../app/uiStore'
import { useGameHub } from '../../app/GameHubContext'

export function SaveLoadScreen({
  mode,
  onBack,
  onLoaded,
}: {
  mode: 'save' | 'load'
  onBack: () => void
  onLoaded?: () => void
}) {
  const [tick, setTick] = useState(0)
  const [busy, setBusy] = useState<string | null>(null)
  const [overwriteId, setOverwriteId] = useState<Exclude<SaveSlotId, 'auto'> | null>(null)
  const { locationScene } = useGameHub()
  const { shell } = useUiState()
  const index = useMemo(() => readSaveIndex(), [tick])

  const autosave = index.slots.auto
  const manuals = MANUAL_SLOT_IDS.map((id) => ({
    id,
    meta: index.slots[id] as SaveSlotMeta | undefined,
  }))

  const loadSlot = (id: SaveSlotId) => {
    if (id === 'auto') {
      if (!loadGame() && !hasAnySave()) return
    } else {
      const snap = readManualSnapshot(id)
      if (!snap) return
      applyLoadedState(snap)
    }
    enterGameplay()
    onLoaded?.()
  }

  const performSave = async (id: Exclude<SaveSlotId, 'auto'>) => {
    setBusy(id)
    const thumb = await captureSaveThumbnail({
      locationScene: shell === 'paused' ? locationScene : null,
    })
    writeManualSlot(id, getInvestigationState(), thumb)
    setBusy(null)
    setOverwriteId(null)
    setTick((n) => n + 1)
  }

  const requestSave = (id: Exclude<SaveSlotId, 'auto'>, meta?: SaveSlotMeta) => {
    if (meta) {
      setOverwriteId(id)
      return
    }
    void performSave(id)
  }

  return (
    <div className="inv-saves" data-testid="save-load-screen" data-mode={mode}>
      <header className="inv-saves__head">
        <button type="button" className="inv-saves__back" onClick={onBack}>
          ‹ Voltar
        </button>
        <h2>{mode === 'save' ? 'Salvar' : 'Carregar'}</h2>
      </header>

      <div className="inv-saves__body">
        <p className="inv-saves__group">Autosave</p>
        <SaveSlotCard
          id="auto"
          label="Autosave"
          meta={autosave}
          mode={mode}
          busy={busy === 'auto'}
          onLoad={() => loadSlot('auto')}
        />

        <p className="inv-saves__group">Salvamentos manuais</p>
        {manuals.map((slot, i) => (
          <SaveSlotCard
            key={slot.id}
            id={slot.id}
            label={`Slot ${i + 1}`}
            meta={slot.meta}
            mode={mode}
            busy={busy === slot.id}
            onLoad={() => loadSlot(slot.id)}
            onSave={() => requestSave(slot.id, slot.meta)}
          />
        ))}
      </div>

      {overwriteId ? (
        <div className="inv-saves__modal" role="dialog" aria-modal="true" data-testid="save-overwrite-modal">
          <div className="inv-saves__modal-card">
            <p className="inv-saves__modal-title">Substituir este salvamento?</p>
            <p className="inv-saves__modal-copy">
              O progresso existente neste slot será sobrescrito.
            </p>
            <div className="inv-saves__modal-actions">
              <button type="button" onClick={() => setOverwriteId(null)}>
                Cancelar
              </button>
              <button
                type="button"
                data-testid="save-overwrite-confirm"
                onClick={() => void performSave(overwriteId)}
              >
                Substituir
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function SaveSlotCard({
  id,
  label,
  meta,
  mode,
  busy,
  onLoad,
  onSave,
}: {
  id: SaveSlotId
  label: string
  meta?: SaveSlotMeta
  mode: 'save' | 'load'
  busy: boolean
  onLoad: () => void
  onSave?: () => void
}) {
  const empty = !meta
  const disabledLoad = mode === 'load' && empty
  const disabledSave = mode === 'save' && id === 'auto'

  return (
    <article
      className="inv-saves__slot"
      data-empty={empty || undefined}
      data-slot={id}
      data-testid={`save-slot-${id}`}
    >
      <div className="inv-saves__thumb" aria-hidden>
        {meta?.thumbnail ? (
          <img src={meta.thumbnail} alt="" />
        ) : (
          <span className="inv-saves__thumb-ph">{empty ? 'Vazio' : '—'}</span>
        )}
      </div>
      <div className="inv-saves__info">
        {meta ? (
          <>
            <p className="inv-saves__name">{meta.blockLabel}</p>
            <p className="inv-saves__loc">{meta.locationLabel}</p>
            <p className="inv-saves__clock">{formatSaveClock(meta.savedAt)}</p>
            <p className="inv-saves__play">
              {formatPlayTimeClock(meta.playTimeMs)} de jogo
            </p>
          </>
        ) : (
          <>
            <p className="inv-saves__name">{label}</p>
            <p className="inv-saves__empty">Salvamento vazio</p>
          </>
        )}
      </div>
      {mode === 'load' ? (
        <button
          type="button"
          className="inv-saves__cta"
          data-testid={`save-load-${id}`}
          disabled={disabledLoad}
          onClick={onLoad}
        >
          Carregar
        </button>
      ) : (
        <button
          type="button"
          className="inv-saves__cta"
          data-testid={`save-write-${id}`}
          disabled={disabledSave || busy}
          onClick={onSave}
        >
          {busy ? 'Salvando…' : 'Salvar'}
        </button>
      )}
    </article>
  )
}

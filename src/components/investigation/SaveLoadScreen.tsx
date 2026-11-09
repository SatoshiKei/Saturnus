import { useMemo, useState } from 'react'
import {
  applyLoadedState,
  getInvestigationState,
  loadGame,
} from '../../game/state/investigationStore'
import {
  MANUAL_SLOT_IDS,
  hasAnySave,
  readManualSlot,
  readSaveIndex,
  writeManualSlot,
  type SaveSlotId,
  type SaveSlotMeta,
} from '../../game/state/saveSlots'
import { captureSaveThumbnail } from '../../lib/saveThumbnail'
import { formatPlayTime, formatSaveClock } from '../../lib/caseProgress'
import { enterGameplay } from '../../app/uiStore'

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
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const index = useMemo(() => readSaveIndex(), [tick])

  const slots: { id: SaveSlotId; label: string; meta?: SaveSlotMeta }[] = [
    { id: 'auto', label: index.slots.auto?.kind === 'legacy' ? 'Save legado / Autosave' : 'Autosave', meta: index.slots.auto },
    ...MANUAL_SLOT_IDS.map((id) => ({
      id,
      label: `Slot ${id}`,
      meta: index.slots[id],
    })),
  ]

  const loadSlot = (id: SaveSlotId) => {
    if (id === 'auto') {
      if (!loadGame() && !hasAnySave()) return
    } else {
      const raw = readManualSlot(id)
      if (!raw) return
      applyLoadedState(raw)
    }
    enterGameplay()
    onLoaded?.()
  }

  const saveSlot = async (id: Exclude<SaveSlotId, 'auto'>) => {
    setBusy(id)
    const thumb = await captureSaveThumbnail()
    writeManualSlot(id, getInvestigationState(), thumb)
    setBusy(null)
    setConfirmId(null)
    setTick((n) => n + 1)
  }

  return (
    <div className="inv-saves" data-testid="save-load-screen">
      <header className="inv-saves__head">
        <button type="button" className="inv-saves__back" onClick={onBack}>
          ‹ Voltar
        </button>
        <h2>{mode === 'save' ? 'Salvar' : 'Carregar'}</h2>
      </header>
      <ul className="inv-saves__list">
        {slots.map((slot) => {
          const empty = !slot.meta
          const disabledLoad = mode === 'load' && empty
          const disabledSave = mode === 'save' && slot.id === 'auto'
          return (
            <li key={slot.id} className="inv-saves__slot" data-empty={empty || undefined}>
              <div className="inv-saves__thumb" aria-hidden>
                {slot.meta?.thumbnail ? (
                  <img src={slot.meta.thumbnail} alt="" />
                ) : (
                  <span />
                )}
              </div>
              <div className="inv-saves__info">
                <p className="inv-saves__name">{slot.label}</p>
                {slot.meta ? (
                  <>
                    <p>{slot.meta.blockLabel}</p>
                    <p>{slot.meta.locationLabel}</p>
                    <p>
                      {formatSaveClock(slot.meta.savedAt)}
                      {slot.meta.playTimeMs ? ` · ${formatPlayTime(slot.meta.playTimeMs)}` : ''}
                    </p>
                  </>
                ) : (
                  <p className="inv-saves__empty">Vazio</p>
                )}
              </div>
              {mode === 'load' ? (
                <button
                  type="button"
                  data-testid={`save-load-${slot.id}`}
                  disabled={disabledLoad}
                  onClick={() => loadSlot(slot.id)}
                >
                  Carregar
                </button>
              ) : (
                <button
                  type="button"
                  data-testid={`save-write-${slot.id}`}
                  disabled={disabledSave || busy === slot.id}
                  onClick={() => {
                    if (slot.meta && confirmId !== slot.id) {
                      setConfirmId(slot.id)
                      return
                    }
                    if (slot.id === 'auto') return
                    void saveSlot(slot.id)
                  }}
                >
                  {busy === slot.id ? 'Salvando…' : confirmId === slot.id ? 'Confirmar' : 'Salvar'}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

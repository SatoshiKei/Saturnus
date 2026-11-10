import { useEffect, useState } from 'react'
import { DiaryPinKeypad } from './DiaryPinKeypad'
import { block04DiaryEntries } from '../../data/block04/diaryEntries'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { dispatchActions, setFlag, tryDiaryPin } from '../../game/state/investigationStore'
import { onDiaryEntryRead } from '../../game/story/block04Handlers'
import { rereadDiaryOmitido } from '../../game/story/block09Handlers'
import { playSfx } from '../../lib/sfx'

/** Entradas cujo sentido muda após O Omitido — destaque discreto quando a pendência está ativa. */
const OMITIDO_REREAD_ENTRY_IDS = new Set(['diary-forget', 'diary-others', 'diary-record'])

/**
 * App do diário no iPhone de Mariana (visível só após a Perícia restaurar o pacote).
 * PIN digitado aqui — o computador só aponta para o aparelho.
 */
export function HiddenDiaryApp({ onBack }: { onBack: () => void }) {
  const inv = useInvestigation()
  const unlocked =
    inv.phones.mariana.diaryUnlocked ||
    inv.flags.block04_forensics_done ||
    inv.flags.block04_diary_opened

  useEffect(() => {
    const actions: Parameters<typeof dispatchActions>[0] = []
    if (inv.tasks.some((t) => t.id === 'task_open_recovered_diary' && !t.completed)) {
      actions.push({ type: 'completeTask', id: 'task_open_recovered_diary' })
    }
    if (
      !unlocked &&
      !inv.tasks.some((t) => t.id === 'task_unlock_diary')
    ) {
      actions.push({
        type: 'addTask',
        id: 'task_unlock_diary',
        label: 'Desbloquear o diário com o código recuperado no Hexágono',
      })
    }
    if (actions.length) dispatchActions(actions)
  }, [inv.tasks, unlocked])

  return (
    <div className="diary-app" data-testid="hidden-diary-app">
      <header className="ios-app-header">
        <button type="button" className="ios-app-header__back" onClick={onBack}>
          ‹ Início
        </button>
        <h1>Diário</h1>
      </header>
      {unlocked ? <DiaryReader /> : <DiaryPinGate />}
    </div>
  )
}

function DiaryPinGate() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    const res = tryDiaryPin(pin)
    if (res === 'wrong') {
      playSfx('error')
      setError('Código incorreto.')
      return
    }
    if (res === 'locked') {
      setError('Pacote ainda não liberado pela Perícia.')
      return
    }
    playSfx('unlock')
    setError(null)
    setPin('')
  }

  return (
    <DiaryPinKeypad
      value={pin}
      error={error}
      onChange={(next) => {
        setPin(next.replace(/\D/g, '').slice(0, 6))
        setError(null)
      }}
      onSubmit={submit}
    />
  )
}

/** Lista/leitura das entradas — usado no app do telefone (e legacy export se necessário). */
export function DiaryReader({ onBack }: { onBack?: () => void }) {
  const inv = useInvestigation()
  const [openId, setOpenId] = useState<string | null>(null)
  const open = block04DiaryEntries.find((e) => e.id === openId)
  const highlightOmitidoReread =
    inv.flags.block09_diary_reread_unlocked && !inv.flags.block09_diary_reread_done

  return (
    <div className="diary-reader" data-testid="hidden-diary-unlocked">
      <header className="diary-reader__head">
        {onBack ? (
          <button type="button" className="diary-reader__back" onClick={onBack}>
            ‹ Voltar
          </button>
        ) : null}
        <h3>Diário — pacote local.priv.journal</h3>
      </header>
      {!open ? (
        <ul className="diary-list" data-testid="diary-entry-list">
          {block04DiaryEntries.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                className="diary-list__row"
                data-testid={`diary-entry-${e.id}`}
                data-read={Boolean(inv.flags[e.readFlag]) || undefined}
                data-omitido-reread={
                  highlightOmitidoReread && OMITIDO_REREAD_ENTRY_IDS.has(e.id) ? true : undefined
                }
                onClick={() => {
                  setOpenId(e.id)
                  if (!inv.flags[e.readFlag]) {
                    setFlag(e.readFlag, true)
                    onDiaryEntryRead(e.id, Boolean(e.unlocksUnknownRecording))
                  }
                  if (highlightOmitidoReread && OMITIDO_REREAD_ENTRY_IDS.has(e.id)) {
                    rereadDiaryOmitido()
                  }
                }}
              >
                <span>{e.title}</span>
                <span className="diary-list__date">{e.dateLabel}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <article className="diary-reader__entry" data-testid="diary-entry-view">
          <button type="button" className="diary-reader__back" onClick={() => setOpenId(null)}>
            ‹ Entradas
          </button>
          <h4>{open.title}</h4>
          <p className="diary-reader__date">{open.dateLabel}</p>
          <p className="diary-reader__body">{open.body}</p>
        </article>
      )}
    </div>
  )
}

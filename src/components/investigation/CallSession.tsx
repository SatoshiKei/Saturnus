import { useCallback, useEffect, useRef, useState } from 'react'
import type { CallLine, CallScript } from '../../data/calls'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { dispatchActions } from '../../game/state/investigationStore'
import { playSfx } from '../../lib/sfx'

type Phase = 'dialing' | 'talking' | 'skip' | 'result' | 'ended'

interface CallSessionProps {
  script: CallScript
  /** Chamado ao desligar. */
  onEnd: () => void
  /** Visual compacto (celular). */
  compact?: boolean
}

const DIAL_MS = 1500
const SKIP_MS = 2400

/**
 * Ligação diegética: chamando → conversa linha a linha → (transição narrativa) → resultado.
 * Efeitos narrativos (`onComplete`) só disparam na primeira ligação concluída.
 */
export function CallSession({ script, onEnd, compact }: CallSessionProps) {
  const inv = useInvestigation()
  const alreadyDone = inv.callsDone.includes(script.id)
  const available = script.available(inv)
  const mode: 'first' | 'repeat' | 'notYet' = alreadyDone ? 'repeat' : available ? 'first' : 'notYet'
  const lines: CallLine[] =
    mode === 'repeat' ? script.repeat : mode === 'notYet' ? (script.notYet ?? script.repeat) : script.lines

  const [phase, setPhase] = useState<Phase>('dialing')
  const [idx, setIdx] = useState(0)
  const completed = useRef(false)
  const timers = useRef<number[]>([])

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
    },
    [],
  )

  useEffect(() => {
    if (phase !== 'dialing') return
    playSfx('call-out')
    const t = window.setTimeout(() => {
      playSfx('pickup')
      setPhase('talking')
    }, DIAL_MS)
    return () => window.clearTimeout(t)
  }, [phase])

  const finishTalking = useCallback(() => {
    if (mode === 'first' && !completed.current) {
      completed.current = true
      if (script.timeSkip) {
        setPhase('skip')
        later(() => {
          dispatchActions(script.onComplete)
          setPhase(script.result ? 'result' : 'ended')
        }, SKIP_MS)
        return
      }
      dispatchActions(script.onComplete)
      setPhase(script.result ? 'result' : 'ended')
      return
    }
    setPhase('ended')
  }, [mode, script])

  const next = useCallback(() => {
    if (phase === 'dialing') {
      setPhase('talking')
      return
    }
    if (phase === 'skip') {
      // pular a transição não atrasa o resultado: ele aparece na hora
      return
    }
    if (phase !== 'talking') return
    playSfx('ui')
    if (idx + 1 < lines.length) setIdx(idx + 1)
    else finishTalking()
  }, [phase, idx, lines.length, finishTalking])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === 'talking' && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault()
        e.stopPropagation()
        next()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [phase, next])

  const hangUp = () => {
    playSfx('hangup')
    onEnd()
  }

  const current = lines[idx]

  return (
    <div className={`cs${compact ? ' cs--compact' : ''}`} data-testid="call-session" data-phase={phase}>
      <header className="cs__head">
        <span className="cs__who">{script.speaker}</span>
        <span className="cs__state">
          {phase === 'dialing' ? 'CHAMANDO…' : phase === 'skip' ? 'EM LINHA…' : phase === 'talking' ? 'EM LIGAÇÃO' : 'ENCERRADA'}
        </span>
      </header>

      {phase === 'dialing' ? (
        <p className="cs__line cs__line--wait" data-testid="call-dialing">
          Chamando {script.speaker}…
        </p>
      ) : null}

      {phase === 'talking' && current ? (
        <div className="cs__body" onClick={next} role="presentation">
          <p className={`cs__line cs__line--${current.who}`} data-testid="call-line">
            <b>{current.who === 'augusto' ? 'Augusto' : script.speaker}</b>
            {current.text}
          </p>
          <button
            type="button"
            className="cs__btn"
            data-testid="call-next"
            onClick={(e) => {
              e.stopPropagation()
              next()
            }}
          >
            {idx + 1 < lines.length ? 'Continuar' : 'Encerrar conversa'}
          </button>
        </div>
      ) : null}

      {phase === 'skip' ? (
        <div className="cs__skip" data-testid="call-timeskip">
          <p>{script.timeSkip}</p>
        </div>
      ) : null}

      {phase === 'result' && script.result ? (
        <div className="cs__result" data-testid="call-result">
          <p className="cs__result-label">{script.result.label}</p>
          <p className="cs__result-detail">{script.result.detail}</p>
        </div>
      ) : null}

      {phase === 'result' || phase === 'ended' ? (
        <button type="button" className="cs__btn cs__btn--hang" data-testid="call-hangup" onClick={hangUp}>
          Desligar
        </button>
      ) : null}
      {phase === 'dialing' || phase === 'talking' ? (
        <button type="button" className="cs__btn cs__btn--hang cs__btn--ghost" data-testid="call-cancel" onClick={hangUp}>
          Desligar
        </button>
      ) : null}
    </div>
  )
}

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
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

  const [elapsedSec, setElapsedSec] = useState(0)

  useEffect(() => {
    if (phase !== 'talking' && phase !== 'dialing') return
    const id = window.setInterval(() => setElapsedSec((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [phase])

  const fmtElapsed = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const iosStatusLabel =
    phase === 'dialing'
      ? 'chamando…'
      : phase === 'skip'
        ? 'em linha…'
        : phase === 'talking'
          ? fmtElapsed(elapsedSec)
          : phase === 'result'
            ? 'encerrada'
            : 'encerrada'

  const showKeypad = phase === 'dialing' || phase === 'talking' || phase === 'skip'

  if (compact) {
    return (
      <div className="cs cs--compact cs--ios" data-testid="call-session" data-phase={phase}>
        <div className="cs-ios-call">
          <div className="cs-ios-call__top">
            <h2 className="cs-ios-call__name">{script.speaker}</h2>
            <p className="cs-ios-call__status" aria-live="polite">
              {iosStatusLabel}
            </p>

            {phase === 'dialing' ? (
              <p className="cs-ios-call__hint cs-ios-call__hint--pulse" data-testid="call-dialing">
                chamada de voz
              </p>
            ) : null}

            {phase === 'talking' && current ? (
              <button
                type="button"
                className="cs-ios-call__caption"
                data-testid="call-line"
                onClick={next}
              >
                <span className="cs-ios-call__caption-who">
                  {current.who === 'augusto' ? 'Augusto' : script.speaker}
                </span>
                {current.text}
              </button>
            ) : null}

            {phase === 'skip' && script.timeSkip ? (
              <p className="cs-ios-call__caption cs-ios-call__caption--static" data-testid="call-timeskip">
                {script.timeSkip}
              </p>
            ) : null}

            {phase === 'result' && script.result ? (
              <div className="cs-ios-call__sheet" data-testid="call-result">
                <p className="cs-ios-call__sheet-title">{script.result.label}</p>
                <p className="cs-ios-call__sheet-detail">{script.result.detail}</p>
              </div>
            ) : null}
          </div>

          {showKeypad ? <IosInCallKeypad /> : <div className="cs-ios-call__spacer" aria-hidden />}

          <div className="cs-ios-call__bottom">
            {phase === 'talking' && current ? (
              <button
                type="button"
                className="cs-ios-call__advance"
                data-testid="call-next"
                onClick={next}
              >
                {idx + 1 < lines.length ? 'Toque para continuar' : 'Toque para encerrar'}
              </button>
            ) : null}

            {(phase === 'dialing' || phase === 'talking' || phase === 'skip') ? (
              <button
                type="button"
                className="cs-ios-call__hang"
                data-testid="call-cancel"
                aria-label="Desligar"
                onClick={hangUp}
              >
                <span className="cs-ios-call__hang-circle">
                  <HangUpIcon />
                </span>
              </button>
            ) : null}

            {(phase === 'result' || phase === 'ended') ? (
              <button
                type="button"
                className="cs-ios-call__hang"
                data-testid="call-hangup"
                aria-label="Fechar"
                onClick={hangUp}
              >
                <span className="cs-ios-call__hang-circle">
                  <HangUpIcon />
                </span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cs" data-testid="call-session" data-phase={phase}>
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

function HangUpIcon() {
  return (
    <svg className="cs-ios-call__hang-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.4 11.4 0 003.56.57 1 1 0 011 1V20a1 1 0 01-1 1A16 16 0 013 5.68a1 1 0 011-1h3.52a1 1 0 011 .74 11.4 11.4 0 00.57 3.56 1 1 0 01-.24 1.01l-2.2 2.2z"
        transform="rotate(135 12 12)"
      />
    </svg>
  )
}

function IosInCallKeypad() {
  const controls: { label: string; icon: ReactNode }[] = [
    {
      label: 'mute',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"
          />
        </svg>
      ),
    },
    {
      label: 'keypad',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle cx="7" cy="7" r="1.4" fill="currentColor" />
          <circle cx="12" cy="7" r="1.4" fill="currentColor" />
          <circle cx="17" cy="7" r="1.4" fill="currentColor" />
          <circle cx="7" cy="12" r="1.4" fill="currentColor" />
          <circle cx="12" cy="12" r="1.4" fill="currentColor" />
          <circle cx="17" cy="12" r="1.4" fill="currentColor" />
          <circle cx="7" cy="17" r="1.4" fill="currentColor" />
          <circle cx="12" cy="17" r="1.4" fill="currentColor" />
          <circle cx="17" cy="17" r="1.4" fill="currentColor" />
        </svg>
      ),
    },
    {
      label: 'speaker',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M3 9v6h4l5 4V5L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.06A4.5 4.5 0 0016.5 12zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
          />
        </svg>
      ),
    },
    {
      label: 'add call',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      ),
    },
    {
      label: 'FaceTime',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M17 10.5V7a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h11a1 1 0 001-1v-3.5l4 4v-11l-4 4z"
          />
        </svg>
      ),
    },
    {
      label: 'contacts',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
          />
        </svg>
      ),
    },
  ]

  return (
    <div className="cs-ios-call__pad" aria-hidden>
      {controls.map((c) => (
        <div key={c.label} className="cs-ios-call__pad-btn">
          <span className="cs-ios-call__pad-icon">{c.icon}</span>
          <span className="cs-ios-call__pad-label">{c.label}</span>
        </div>
      ))}
    </div>
  )
}

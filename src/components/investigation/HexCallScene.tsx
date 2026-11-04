import { useCallback, useEffect, useRef, useState } from 'react'
import { setFullscreenScene } from '../../app/uiStore'
import { reflectionById } from '../../data/reflections'
import { assetPath } from '../../lib/assetPath'
import { onHexCallAnswered, onHexCallsPreserved } from '../../game/story/block04Handlers'
import { playSfx, startAmbientPhones, stopLoop } from '../../lib/sfx'
import { ReflectionView } from '../story/vn/SceneTransitions'

type Phase = 'silence' | 'audio' | 'dropped' | 'reflection'

const SILENCE_MS = 3200
const AUDIO_FALLBACK_MS = 8500
const DROPPED_MS = 2200

/**
 * As seis ligações — cena. O fixo toca, Augusto atende, ninguém fala. Um áudio passa pela linha, a
 * ligação cai. Pausa, Reflexão, outros telefones tocando ao fundo; as seis gravações vão para a
 * bancada.
 */
export function HexCallScene({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<Phase>('silence')
  const timers = useRef<number[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const finished = useRef(false)
  const refl = reflectionById('refl-hex-call')

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }

  useEffect(() => {
    setFullscreenScene(true)
    return () => setFullscreenScene(false)
  }, [])

  useEffect(() => {
    playSfx('pickup')
    onHexCallAnswered()
    later(() => setPhase('audio'), SILENCE_MS)
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      audioRef.current?.pause()
      stopLoop('ambient-phones')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dropped = useRef(false)
  const drop = useCallback(() => {
    if (dropped.current) return
    dropped.current = true
    audioRef.current?.pause()
    playSfx('hangup')
    setPhase('dropped')
    timers.current.push(window.setTimeout(() => setPhase('reflection'), DROPPED_MS))
  }, [])

  useEffect(() => {
    if (phase !== 'audio') return
    const a = new Audio(assetPath('/assets/audio/hex-a.wav'))
    audioRef.current = a
    a.addEventListener('ended', drop)
    void a.play().catch(() => undefined)
    const t = window.setTimeout(drop, AUDIO_FALLBACK_MS)
    return () => {
      window.clearTimeout(t)
      a.pause()
    }
  }, [phase, drop])

  useEffect(() => {
    if (phase === 'reflection') startAmbientPhones()
  }, [phase])

  const [fading, setFading] = useState(false)

  const done = () => {
    if (finished.current) return
    finished.current = true
    setFading(true)
    playSfx('scene-out')
    window.setTimeout(() => {
      stopLoop('ambient-phones')
      onHexCallsPreserved()
      onFinish()
    }, 950)
  }

  if (phase === 'reflection' && refl) {
    return (
      <div className="hexcall-overlay" data-testid="hex-call-scene" data-phase="reflection">
        <ReflectionView blocks={refl.blocks} background={refl.background} onDone={done} />
        <div className={`tr-fade${fading ? ' tr-fade--on' : ''}`} aria-hidden />
      </div>
    )
  }

  return (
    <div className="hexcall-overlay" data-testid="hex-call-scene" data-phase={phase}>
      <div className="hexcall">
        <p className="hexcall__label">LINHA ABERTA</p>
        {phase === 'silence' ? (
          <p className="hexcall__text" data-testid="hex-call-silence">
            Ninguém fala. Só a respiração da linha.
          </p>
        ) : null}
        {phase === 'audio' ? (
          <>
            <p className="hexcall__text" data-testid="hex-call-audio">
              Um áudio passa pela linha, do começo ao fim.
            </p>
            <div className="hexcall__bars" aria-hidden>
              {Array.from({ length: 24 }, (_, i) => (
                <span key={i} style={{ animationDelay: `${(i % 6) * 90}ms` }} />
              ))}
            </div>
          </>
        ) : null}
        {phase === 'dropped' ? (
          <p className="hexcall__text" data-testid="hex-call-dropped">
            A ligação cai.
          </p>
        ) : null}
        <button
          type="button"
          className="tr-skip hexcall__skip"
          data-testid="hex-call-skip"
          onClick={() => {
            audioRef.current?.pause()
            setPhase('reflection')
          }}
        >
          Pular
        </button>
      </div>
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { resolveChatMediaSrc } from '../../lib/characterSprites'
import { MORSA_CCTV_BEATS, type MorsaCctvBeat } from '../../data/block08/morsaCctvBeats'
import { RING_CONTINUITY_FRAMES } from '../../data/block08/ringsPuzzle'
import { playSfx } from '../../lib/sfx'
import '../../styles/morsa-cctv.css'

export function MorsaCctvReveal({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0)
  const [endPrimed, setEndPrimed] = useState(false)
  const [fading, setFading] = useState(false)
  const beat = MORSA_CCTV_BEATS[index]

  const finish = useCallback(() => {
    setFading(true)
    playSfx('fade')
    window.setTimeout(() => onComplete(), 600)
  }, [onComplete])

  const advance = useCallback(() => {
    if (fading) return
    if (index >= MORSA_CCTV_BEATS.length - 1) {
      if (!endPrimed) {
        setEndPrimed(true)
        return
      }
      finish()
      return
    }
    playSfx('ui')
    setIndex((i) => i + 1)
    setEndPrimed(false)
  }, [endPrimed, finish, fading, index])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        advance()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [advance])

  const frame =
    beat?.kind === 'cam' ? RING_CONTINUITY_FRAMES[beat.frameIndex] : RING_CONTINUITY_FRAMES[0]

  return (
    <div
      className={`morsa-cctv${fading ? ' morsa-cctv--out' : ''}`}
      data-testid="morsa-cctv-reveal"
      onClick={advance}
      role="presentation"
    >
      <div className="morsa-cctv__room" />
      <CctvBeatView beat={beat} frame={frame} />
      <footer className="morsa-cctv__hint">
        {index >= MORSA_CCTV_BEATS.length - 1 && endPrimed ? 'Encerrar' : 'Continuar'}
      </footer>
    </div>
  )
}

function CctvBeatView({
  beat,
  frame,
}: {
  beat: MorsaCctvBeat | undefined
  frame: (typeof RING_CONTINUITY_FRAMES)[number]
}) {
  if (!beat) return null
  if (beat.kind === 'pause') {
    return <CctvBeatView beat={{ kind: 'thought', text: '…' }} frame={frame} />
  }
  if (beat.kind === 'name') {
    return (
      <p className="morsa-cctv__name" data-testid="morsa-cctv-name">
        {beat.text}
      </p>
    )
  }
  if (beat.kind === 'thought') {
    return <p className="morsa-cctv__thought">{beat.text}</p>
  }
  return (
    <figure className="morsa-cctv__feed" data-testid={`morsa-cctv-${frame.cameraId}`}>
      <div className="morsa-cctv__screen">
        <img src={resolveChatMediaSrc(frame.imageSrc)} alt="" />
        <span className="morsa-cctv__badge">{frame.cameraId}</span>
        <span className="morsa-cctv__stamp">{frame.timeLabel}</span>
      </div>
      {beat.thought ? <figcaption>{beat.thought}</figcaption> : null}
    </figure>
  )
}

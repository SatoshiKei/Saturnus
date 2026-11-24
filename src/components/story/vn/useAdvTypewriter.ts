import { useCallback, useEffect, useMemo, useState } from 'react'
import { playVoiceBlip } from '../../../lib/sfx'
import { formatAdvDialogueText } from './advText'
import { splitPeriodParts } from './splitPeriodParts'

const CHAR_MS = 28

export type AdvTypewriterOptions = {
  enabled?: boolean
  charMs?: number
  /** Blip de voz a cada carácter visível (exceto espaço). */
  typingSfx?: boolean
  speechBlipGain?: number
  /** Espera gesto do jogador antes de começar a digitar (WebAudio). */
  pauseTyping?: boolean
}

export function useAdvTypewriter(text: string, options: AdvTypewriterOptions = {}) {
  const {
    enabled = true,
    charMs = CHAR_MS,
    typingSfx = false,
    speechBlipGain = 1,
    pauseTyping = false,
  } = options
  const normalized = useMemo(() => formatAdvDialogueText(text), [text])
  const periods = useMemo(() => splitPeriodParts(normalized), [normalized])

  const [periodIndex, setPeriodIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    setPeriodIndex(0)
    setCharIndex(0)
  }, [normalized])

  const currentPeriod = periods[periodIndex] ?? ''
  const isTyping = enabled && charIndex < currentPeriod.length

  useEffect(() => {
    if (!enabled || !isTyping || pauseTyping) return
    const timer = window.setTimeout(() => {
      setCharIndex((n) => {
        const ch = currentPeriod[n]
        const voiced = ch && !/[\s.,;:!?—–\-…]/.test(ch)
        if (typingSfx && voiced && n % 2 === 0) playVoiceBlip(speechBlipGain)
        return n + 1
      })
    }, charMs)
    return () => window.clearTimeout(timer)
  }, [charMs, charIndex, currentPeriod, enabled, isTyping, pauseTyping, speechBlipGain, typingSfx])

  /** Um único bloco na caixa: períodos já liberados + digitação do período actual. */
  const displayedText = useMemo(() => {
    if (!enabled) return normalized
    const released = periods.slice(0, periodIndex)
    const partial = currentPeriod.slice(0, charIndex)
    return [...released, partial].filter(Boolean).join(' ')
  }, [charIndex, currentPeriod, enabled, normalized, periodIndex, periods])

  const ready = !enabled || !isTyping

  const beatComplete =
    !enabled ||
    (periodIndex >= periods.length - 1 && charIndex >= currentPeriod.length && periods.length > 0)

  const consumeAdvance = useCallback((): boolean => {
    if (!enabled) return false
    if (charIndex < currentPeriod.length) {
      setCharIndex(currentPeriod.length)
      return true
    }
    if (periodIndex < periods.length - 1) {
      setPeriodIndex((p) => p + 1)
      setCharIndex(0)
      return true
    }
    return false
  }, [charIndex, currentPeriod.length, enabled, periodIndex, periods.length])

  return {
    displayedText,
    isTyping,
    ready,
    beatComplete,
    consumeAdvance,
  }
}
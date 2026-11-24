import { useCallback, useMemo, useState } from 'react'

export type SceneBeatKind = 'dialogue' | 'narration' | 'system'

/** Beat de cena (JSON ordenado); extensível com fundo, sprites e áudio depois. */
export type SceneStageBeat = {
  id: string
  kind: SceneBeatKind
  text: string
  speaker?: string
  expression?: string
  bg?: string
  location?: string
  time?: string
  characters?: string[]
  audioCues?: string[]
}

export type SceneStageOptions = {
  beats: SceneStageBeat[]
  startBeat?: number
  endBeat?: number
  onDone: () => void
}

/**
 * Percorre beats de startBeat até endBeat; ao passar do último, chama onDone.
 * Typewriter e avanço por período ficam no ADV (`VisualNovelDialog`).
 */
export function useSceneStage({ beats, startBeat = 0, endBeat, onDone }: SceneStageOptions) {
  const end = endBeat ?? beats.length - 1
  const [index, setIndex] = useState(startBeat)

  const beat = beats[index]
  const inRange = index >= startBeat && index <= end
  const atLastBeat = index >= end

  const show = useCallback((nextIndex: number) => {
    const clamped = Math.max(startBeat, Math.min(end, nextIndex))
    setIndex(clamped)
  }, [end, startBeat])

  const advanceBeat = useCallback(() => {
    if (index < end) {
      setIndex((i) => i + 1)
      return
    }
    onDone()
  }, [end, index, onDone])

  return useMemo(
    () => ({
      index,
      beat,
      inRange,
      atLastBeat,
      show,
      advanceBeat,
      startBeat,
      endBeat: end,
    }),
    [advanceBeat, atLastBeat, beat, end, inRange, index, show, startBeat],
  )
}
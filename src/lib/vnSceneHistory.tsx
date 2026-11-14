import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { VnLine } from '../components/story/VisualNovelDialog'

function lineKey(line: VnLine): string {
  return `${line.speaker ?? ''}\u0000${line.text}`
}

type VnSceneHistoryContextValue = {
  sceneTitle: string
  lines: VnLine[]
  pushLine: (line: VnLine) => void
  pushChoice: (label: string) => void
}

const VnSceneHistoryContext = createContext<VnSceneHistoryContextValue | null>(null)

/** Buffer append-only por montagem da cena (novo buffer a cada `VNSceneShell`). */
export function VnSceneHistoryProvider({
  children,
  sceneTitle = '',
}: {
  children: ReactNode
  sceneTitle?: string
}) {
  const linesRef = useRef<VnLine[]>([])
  const seenKeysRef = useRef(new Set<string>())
  const [lines, setLines] = useState<VnLine[]>([])

  const pushLine = useCallback((line: VnLine) => {
    if (!line.text && !line.speaker) return
    const key = lineKey(line)
    if (seenKeysRef.current.has(key)) return
    seenKeysRef.current.add(key)
    const next = [...linesRef.current, line]
    linesRef.current = next
    setLines(next)
  }, [])

  const pushChoice = useCallback(
    (label: string) => {
      const trimmed = label.trim()
      if (!trimmed) return
      pushLine({ speaker: undefined, text: `▸ ${trimmed}` })
    },
    [pushLine],
  )

  const value = useMemo(
    () => ({ sceneTitle, lines, pushLine, pushChoice }),
    [sceneTitle, lines, pushLine, pushChoice],
  )

  return <VnSceneHistoryContext.Provider value={value}>{children}</VnSceneHistoryContext.Provider>
}

export function useVnSceneHistory(): VnSceneHistoryContextValue | null {
  return useContext(VnSceneHistoryContext)
}

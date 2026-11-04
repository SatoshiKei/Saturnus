import { useCallback, useMemo, useState } from 'react'
import { assetPath } from '../../lib/assetPath'
import { setFlag } from '../../game/state/investigationStore'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { vnLinesThrough } from '../../lib/vnBeatLog'
import { VisualNovelDialog, VNSceneShell } from './VisualNovelDialog'
import '../../styles/visual-novel.css'

export type TopicBeat = { speaker?: string; text: string; portrait?: string }

export interface TopicInterviewConfig<T extends string> {
  testId: string
  title: string
  /** Caminho do fundo (ver `sceneBackgrounds`). */
  background: string
  portrait: string | undefined
  topicIds: readonly T[]
  labels: Record<T, string>
  flags: Record<T, string>
  beats: Record<T, TopicBeat[]>
  /** Flag que marca a conversa como concluída (não repetir o fechamento). */
  doneFlag: string
  /** Executado uma única vez, quando o último assunto termina. */
  finish: () => void
  /** Linha final se o jogador voltar à cena sem assuntos pendentes. */
  idleLine: string
  darkness?: number
}

interface Props<T extends string> {
  config: TopicInterviewConfig<T>
  onClose: () => void
}

/**
 * Cena de conversa por assuntos, reutilizada por Lucas, Nico, Lívia, Samuel e André.
 * Não existe fala de síntese aqui: conclusões ficam no modo Reflexão (SceneRunner).
 */
export function TopicInterviewScene<T extends string>({ config, onClose }: Props<T>) {
  const inv = useInvestigation()
  const [activeTopic, setActiveTopic] = useState<T | null>(null)
  const [beatIndex, setBeatIndex] = useState(0)

  const doneTopics = useMemo(() => {
    const s = new Set<T>()
    for (const id of config.topicIds) if (inv.flags[config.flags[id]]) s.add(id)
    return s
  }, [inv.flags, config])

  const bg = assetPath(config.background)
  const dark = config.darkness ?? 0.55

  const completeTopic = useCallback(
    (topic: T) => {
      setFlag(config.flags[topic], true)
      setActiveTopic(null)
      setBeatIndex(0)
      const nextDone = new Set(doneTopics)
      nextDone.add(topic)
      if (config.topicIds.every((id) => nextDone.has(id))) {
        if (!inv.flags[config.doneFlag]) config.finish()
        onClose()
      }
    },
    [config, doneTopics, inv.flags, onClose],
  )

  const pending = config.topicIds.filter((id) => !doneTopics.has(id))
  const beats = activeTopic ? config.beats[activeTopic] : []
  const currentBeat = activeTopic ? beats[beatIndex] : null

  const logLines = useMemo(
    () => (activeTopic ? vnLinesThrough(beats, beatIndex, () => config.portrait) : []),
    [activeTopic, beats, beatIndex, config.portrait],
  )

  return (
    <VNSceneShell
      title={config.title}
      onClose={onClose}
      testId={config.testId}
      backgroundStyle={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.28), rgba(0,0,0,${dark})), url(${bg})`,
      }}
    >
      {!activeTopic ? (
        pending.length ? (
          <VisualNovelDialog
            text=""
            choiceVariant="topics"
            choices={pending.map((id) => ({ id, label: config.labels[id] }))}
            onChoice={(id) => {
              setActiveTopic(id as T)
              setBeatIndex(0)
            }}
          />
        ) : (
          <VisualNovelDialog
            speaker="Augusto"
            text={config.idleLine}
            onContinue={onClose}
            continueLabel="Encerrar"
          />
        )
      ) : null}

      {activeTopic && currentBeat ? (
        <VisualNovelDialog
          speaker={currentBeat.speaker}
          text={currentBeat.text}
          portraitSrc={currentBeat.portrait ? config.portrait : undefined}
          logLines={logLines}
          onRewind={() => setBeatIndex((i) => Math.max(0, i - 1))}
          onContinue={() => {
            if (beatIndex + 1 < beats.length) setBeatIndex((i) => i + 1)
            else completeTopic(activeTopic)
          }}
        />
      ) : null}
    </VNSceneShell>
  )
}

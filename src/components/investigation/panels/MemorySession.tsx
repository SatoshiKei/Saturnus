import { useMemo, useRef, useState } from 'react'
import {
  FINAL_MESSAGE_META,
  MEMORY_DURATION_SEC,
  MEMORY_FINAL_SRC,
  MEMORY_WORD,
  caseMediaCorpusForState,
  isMemoryProvenanceComplete,
  isTemporalImpossibility,
  searchCaseMedia,
  type ProvenanceConfirmId,
  type SearchHit,
} from '../../../data/block09/memoryPuzzle'
import { onMemoryPuzzleSolved } from '../../../game/story/block09Handlers'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import { resolveChatMediaSrc } from '../../../lib/characterSprites'
import { playSfx } from '../../../lib/sfx'

const isDev = import.meta.env.DEV

const SOURCE_LABEL: Record<ProvenanceConfirmId, string> = {
  apartment: 'apartamento',
  emergency: 'emergência',
  enceladus: 'Enceladus',
  cassini_derived: 'Cassini-Huygens / derived output',
}

/**
 * Puzzle 12 — MEMÓRIA.
 * Play natural → selecionar região → Search Case Media → confirmar proveniência → grafo.
 */
export function MemorySession() {
  const inv = useInvestigation()
  const solved = Boolean(inv.flags.block09_memory_done)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [selStart, setSelStart] = useState(0.5)
  const [selEnd, setSelEnd] = useState(1.5)
  const [hits, setHits] = useState<SearchHit[]>([])
  const [openMedia, setOpenMedia] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState<Set<ProvenanceConfirmId>>(
    () =>
      solved
        ? new Set(['apartment', 'emergency', 'enceladus', 'cassini_derived'])
        : new Set(),
  )
  const [note, setNote] = useState<string | null>(null)
  const [augustoLine, setAugustoLine] = useState<string | null>(null)
  const [devOpen, setDevOpen] = useState(false)
  const [uiFade, setUiFade] = useState(solved)

  const confirmedList = useMemo(() => [...confirmed], [confirmed])
  const canFinish = isMemoryProvenanceComplete(confirmed)
  const temporal = isTemporalImpossibility(confirmed)
  const derivedBag = inv.forensicDerivedArtifacts ?? {}
  const corpus = useMemo(() => caseMediaCorpusForState(derivedBag), [derivedBag])
  const runtimeCassini = derivedBag['cassini-stream-b']
  // Runtime artifact from P09 is mandatory for region D — no static meta fallback.
  const cassiniCreatedAt = runtimeCassini
    ? new Date(runtimeCassini.createdAtMs).toISOString()
    : null
  const cassiniHash = runtimeCassini?.contentHash ?? null

  const runSearch = () => {
    if (solved) return
    playSfx('ui')
    const a = Math.min(selStart, selEnd)
    const b = Math.max(selStart, selEnd)
    const result = searchCaseMedia(a, b, derivedBag)
    setHits(result)
    setNote(null)
  }

  const confirmHit = (hit: SearchHit) => {
    if (solved || !hit.strong) return
    if (hit.source === 'other') return
    if (hit.source === 'cassini_derived' && !runtimeCassini) {
      playSfx('error')
      setNote('Região D exige o artifact runtime de Cassini-Huygens (stream B reconstruído).')
      return
    }
    playSfx('unlock')
    const src = hit.source as ProvenanceConfirmId
    setConfirmed((prev) => {
      const next = new Set(prev)
      next.add(src)
      if (next.size === 1 || next.size === 2) {
        setAugustoLine('Isso já estava nos arquivos.')
      }
      if (src === 'cassini_derived') {
        setAugustoLine(
          'Isto não estava no PCAP. É o output que eu mesmo reconstruí na bancada.',
        )
      }
      return next
    })
    setNote(`Proveniência confirmada: ${SOURCE_LABEL[src]}`)
  }

  const finish = () => {
    if (solved || !canFinish || !runtimeCassini) {
      playSfx('error')
      setNote(
        !runtimeCassini
          ? 'Sem artifact derivado persistido (cassini-stream-b) — reconstrua o stream B no Puzzle 09.'
          : 'Confirme as quatro proveniências — inclusive a dependência temporal do output derivado.',
      )
      return
    }
    playSfx('unlock')
    setUiFade(true)
    onMemoryPuzzleSolved()
  }

  const open = corpus.find((m) => m.id === openMedia)

  return (
    <div className="aw-hex" data-testid="memory-panel" style={{ opacity: uiFade && solved ? 0.92 : 1 }}>
      <p className="aw-orbit__title">Gravação atribuída a Mariana</p>
      {!solved ? (
        <p className="aw-provisional__note">
          A voz parece recente e contínua. Selecione uma janela curta e busque no acervo do caso —
          Search Case Media. Não há caixas pré-marcadas.
        </p>
      ) : (
        <p className="aw-provisional__note">
          Não é uma gravação orgânica. É uma memória recomposta a partir do material da investigação —
          incluindo um resultado que só existiu depois da bancada.
        </p>
      )}

      <div className="aw-hex__row" data-testid="memory-player">
        <audio
          ref={audioRef}
          controls
          src={resolveChatMediaSrc(MEMORY_FINAL_SRC)}
          preload="metadata"
          data-testid="memory-audio"
          style={{ maxWidth: 360 }}
        />
        <span className="aw-provisional__note">
          mariana_claim_recent.wav · {MEMORY_DURATION_SEC.toFixed(1)} s
        </span>
      </div>

      {!uiFade || !solved ? (
        <>
          <h4 className="pc-sub">Seleção de janela (s)</h4>
          <div className="fw-eq" style={{ gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <label>
              início{' '}
              <input
                data-testid="memory-sel-start"
                type="number"
                min={0}
                max={MEMORY_DURATION_SEC}
                step={0.1}
                value={selStart}
                disabled={solved}
                onChange={(e) => setSelStart(Number(e.target.value))}
              />
            </label>
            <label>
              fim{' '}
              <input
                data-testid="memory-sel-end"
                type="number"
                min={0}
                max={MEMORY_DURATION_SEC}
                step={0.1}
                value={selEnd}
                disabled={solved}
                onChange={(e) => setSelEnd(Number(e.target.value))}
              />
            </label>
            <button
              type="button"
              className="aw-provisional__go"
              data-testid="memory-search"
              disabled={solved}
              onClick={runSearch}
            >
              Search Case Media
            </button>
          </div>
          <p className="aw-provisional__note">
            Janela atual: {Math.min(selStart, selEnd).toFixed(2)}s – {Math.max(selStart, selEnd).toFixed(2)}s
          </p>
        </>
      ) : null}

      {hits.length > 0 && !solved ? (
        <div data-testid="memory-hits">
          <h4 className="pc-sub">Resultados no acervo</h4>
          <ul className="pc-ul">
            {hits.map((h) => (
              <li key={h.mediaId}>
                <button
                  type="button"
                  className="pc-inline"
                  data-testid={`memory-hit-${h.mediaId}`}
                  onClick={() => {
                    playSfx('ui')
                    setOpenMedia(h.mediaId)
                  }}
                >
                  {h.label}
                </button>
                <span className="aw-provisional__note">
                  {' '}
                  · {h.strong ? 'forte' : 'fraca'} · {h.reason}
                </span>
                {h.strong ? (
                  <button
                    type="button"
                    className="aw-provisional__go"
                    data-testid={`memory-confirm-${h.source}`}
                    data-media={h.mediaId}
                    style={{ marginLeft: 8 }}
                    onClick={() => confirmHit(h)}
                  >
                    Confirmar proveniência
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {open ? (
        <div data-testid="memory-compare" style={{ marginTop: 8 }}>
          <h4 className="pc-sub">Comparação — {open.label}</h4>
          <p className="aw-provisional__note">
            {open.kind === 'derived' ? 'derived forensic output' : open.kind}
            {open.parentLabel ? ` · parent: ${open.parentLabel}` : ''}
            {open.createdAt ? ` · created: ${open.createdAt}` : ''}
            {open.sha256 ? ` · sha256: ${open.sha256.slice(0, 16)}…` : ''}
          </p>
          {open.evidenceHint ? (
            <p className="aw-provisional__note">{open.evidenceHint}</p>
          ) : null}
          <audio controls src={resolveChatMediaSrc(open.audioSrc)} preload="metadata" style={{ maxWidth: 320 }} />
        </div>
      ) : null}

      {augustoLine ? (
        <p data-testid="memory-augusto-line" className="aw-provisional__note" style={{ fontStyle: 'italic' }}>
          {augustoLine}
        </p>
      ) : null}

      <h4 className="pc-sub">Provenance graph</h4>
      <div data-testid="memory-provenance-graph" style={{ marginBottom: 8 }}>
        <div style={{ fontWeight: 600 }}>FINAL MESSAGE</div>
        <ul className="pc-ul">
          {confirmedList.length === 0 ? (
            <li className="aw-provisional__note">Nenhuma ligação confirmada.</li>
          ) : (
            confirmedList.map((s) => (
              <li key={s} data-testid={`memory-edge-${s}`}>
                → {SOURCE_LABEL[s]}
                {s === 'cassini_derived' && cassiniCreatedAt && cassiniHash ? (
                  <span className="aw-provisional__note">
                    {' '}
                    (created {cassiniCreatedAt.slice(0, 19)} · hash {cassiniHash.slice(0, 12)}…)
                  </span>
                ) : null}
              </li>
            ))
          )}
        </ul>
        {temporal ? (
          <p data-testid="memory-temporal" className="aw-provisional__note">
            Dependência temporal: a mensagem contém um artefato que só existe no output derivado
            produzido durante a investigação ({FINAL_MESSAGE_META.createdAt.slice(0, 19)}
            {cassiniCreatedAt ? ` vs derived ${cassiniCreatedAt.slice(0, 19)}` : ''}).
          </p>
        ) : null}
      </div>

      {note ? <p data-testid="memory-note">{note}</p> : null}

      {!solved ? (
        <button
          type="button"
          className="aw-provisional__go"
          data-testid="memory-solve"
          onClick={finish}
        >
          Formalizar conclusão — {MEMORY_WORD}
        </button>
      ) : (
        <div data-testid="memory-solved">
          <p>
            A última mensagem não é uma gravação de Mariana. Também não é uma imitação genérica.
            É uma composição de coisas que realmente foram gravadas — e de um resultado que só passou
            a existir porque a bancada o reconstruiu.
          </p>
          <p className="aw-orbit__title" data-testid="memory-word">
            {MEMORY_WORD}
          </p>
        </div>
      )}

      {isDev ? (
        <div style={{ marginTop: 16 }}>
          <button type="button" className="aw-provisional__go" onClick={() => setDevOpen((v) => !v)}>
            DEV MODE
          </button>
          {devOpen ? (
            <pre data-testid="memory-dev" style={{ fontSize: 11, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(
                {
                  regionA_source: 'apartment',
                  regionB_source: 'emergency',
                  regionC_source: 'enceladus',
                  regionD_source: 'cassini_derived',
                  fingerprintMatches: hits.map((h) => ({ id: h.mediaId, score: h.score, strong: h.strong })),
                  confirmedProvenance: confirmedList,
                  cassiniDerivedCreatedAt: cassiniCreatedAt,
                  cassiniDerivedHash: cassiniHash,
                  runtimeArtifact: Boolean(runtimeCassini),
                  finalMessageCreatedAt: FINAL_MESSAGE_META.createdAt,
                  impossibleTemporalDependency: temporal,
                  memoryComplete: solved || canFinish,
                },
                null,
                2,
              )}
            </pre>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

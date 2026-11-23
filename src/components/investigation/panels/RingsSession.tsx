import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  DVR_CATALOG,
  RING_CAMERAS,
  RING_MEDIA,
  RING_ROUTES,
  compareAudioFingerprints,
  compareFramePatterns,
  inspectCam11Structure,
  searchRawStorage,
  type RingMediaId,
  type RingRouteId,
  MISSING_SEGMENT_ID,
} from '../../../data/block08/ringsPuzzle'
import {
  onMorsaContinuityConfirmed,
  onRingsTimelineSolved,
} from '../../../game/story/block08Handlers'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import { resolveChatMediaSrc } from '../../../lib/characterSprites'
import { playSfx } from '../../../lib/sfx'
import { MorsaCctvReveal } from '../MorsaCctvReveal'
import { MariWorkbenchHints } from '../MariWorkbenchHints'

type Phase =
  | 'media'
  | 'route'
  | 'cameras'
  | 'dvr'
  | 'storage'
  | 'reveal'
  | 'done'

type StillLightbox = {
  title: string
  subtitle?: string
  posterSrc?: string
  spriteSrc?: string
  camLabel?: string
  timeLabel?: string
  ambiguous?: boolean
}

function RingsStillLightbox({
  state,
  onClose,
}: {
  state: StillLightbox | null
  onClose: () => void
}) {
  useEffect(() => {
    if (!state) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state, onClose])

  if (!state) return null

  return (
    <div className="rings-ws__lightbox" role="dialog" aria-modal="true" aria-label={state.title}>
      <button
        type="button"
        className="rings-ws__lightbox-backdrop"
        onClick={onClose}
        aria-label="Fechar"
      />
      <div className="rings-ws__lightbox-panel">
        <header className="rings-ws__lightbox-head">
          <p className="rings-ws__lightbox-title">{state.title}</p>
          {state.subtitle ? <p className="fw-muted">{state.subtitle}</p> : null}
        </header>
        <figure className="rings-cctv rings-ws__lightbox-feed">
          {state.ambiguous ? (
            <div className="rings-ws__ambig" data-testid="seg-1279-thumb-full">
              <span className="fw-muted">Quadro não indexado — leitura parcial</span>
            </div>
          ) : state.posterSrc ? (
            <>
              <img
                src={resolveChatMediaSrc(state.posterSrc)}
                alt=""
                className="rings-cctv__img"
              />
              {state.spriteSrc ? (
                <img
                  src={resolveChatMediaSrc(state.spriteSrc)}
                  alt=""
                  className="rings-ws__sprite"
                />
              ) : null}
            </>
          ) : null}
          <span className="rings-cctv__fx" aria-hidden />
          <span className="rings-cctv__noise" aria-hidden />
          {state.camLabel ? <span className="rings-cctv__cam">{state.camLabel}</span> : null}
          {state.timeLabel ? <span className="rings-cctv__time">{state.timeLabel}</span> : null}
        </figure>
        <div className="rings-ws__lightbox-actions">
          <button type="button" className="fw-btn fw-btn--ghost" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

function RingsMediaThumb({
  posterSrc,
  spriteSrc,
  label,
  onExpand,
}: {
  posterSrc: string
  spriteSrc?: string
  label: string
  onExpand: () => void
}) {
  return (
    <button
      type="button"
      className="rings-ws__thumb"
      onClick={onExpand}
      aria-label={`Ampliar quadro — ${label}`}
    >
      <span className="rings-cctv rings-ws__thumb-cctv">
        <img src={resolveChatMediaSrc(posterSrc)} alt="" className="rings-cctv__img" />
        {spriteSrc ? (
          <img src={resolveChatMediaSrc(spriteSrc)} alt="" className="rings-ws__sprite" />
        ) : null}
        <span className="rings-cctv__fx" aria-hidden />
        <span className="rings-cctv__noise" aria-hidden />
      </span>
    </button>
  )
}

function RingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rings-ws__block">
      <h3 className="fw-pane-h">{title}</h3>
      {children}
    </section>
  )
}

function fmtTrackSec(sec: number): string {
  const s = Math.max(0, sec)
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return `${m}:${String(r).padStart(2, '0')}`
}

function RingsStripPlayer({ src, label }: { src: string; label: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const [dur, setDur] = useState(0)
  const resolved = resolveChatMediaSrc(src)

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onTime = () => setT(el.currentTime)
    const onMeta = () => setDur(Number.isFinite(el.duration) ? el.duration : 0)
    const onEnded = () => setPlaying(false)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onMeta)
    el.addEventListener('ended', onEnded)
    return () => {
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onMeta)
      el.removeEventListener('ended', onEnded)
    }
  }, [resolved])

  const toggle = () => {
    const el = audioRef.current
    if (!el) return
    if (playing) el.pause()
    else void el.play()
  }

  const seek = (v: number) => {
    const el = audioRef.current
    if (!el) return
    el.currentTime = v
    setT(v)
  }

  return (
    <div className="rings-ws__player">
      <audio ref={audioRef} src={resolved} preload="metadata" />
      <button
        type="button"
        className="fw-icon-btn fw-icon-btn--play rings-ws__player-play"
        onClick={toggle}
        aria-label={playing ? `Pausar — ${label}` : `Reproduzir — ${label}`}
      >
        {playing ? '❚❚' : '▶'}
      </button>
      <input
        type="range"
        className="rings-ws__player-seek"
        min={0}
        max={dur || 1}
        step={0.05}
        value={Math.min(t, dur || 1)}
        onChange={(e) => seek(Number(e.target.value))}
        aria-label={`Posição — ${label}`}
      />
      <span className="rings-ws__player-time fw-mono" aria-hidden>
        {fmtTrackSec(t)} / {fmtTrackSec(dur)}
      </span>
    </div>
  )
}

function RingsCompareTool({
  labelA,
  labelB,
  testIdA,
  testIdB,
  testIdRun,
  valueA,
  valueB,
  options,
  onA,
  onB,
  onRun,
  runLabel,
}: {
  labelA: string
  labelB: string
  testIdA: string
  testIdB: string
  testIdRun: string
  valueA: string
  valueB: string
  options: { id: string; label: string }[]
  onA: (v: string) => void
  onB: (v: string) => void
  onRun: () => void
  runLabel: string
}) {
  return (
    <div className="rings-ws__tool">
      <div className="rings-ws__tool-row">
        <label className="rings-ws__tool-field">
          <span className="rings-ws__tool-label">{labelA}</span>
          <select
            className="fw-select"
            data-testid={testIdA}
            value={valueA}
            onChange={(e) => onA(e.target.value)}
          >
            <option value="">—</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="rings-ws__tool-field">
          <span className="rings-ws__tool-label">{labelB}</span>
          <select
            className="fw-select"
            data-testid={testIdB}
            value={valueB}
            onChange={(e) => onB(e.target.value)}
          >
            <option value="">—</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="fw-btn rings-ws__tool-run" data-testid={testIdRun} onClick={onRun}>
          {runLabel}
        </button>
      </div>
    </div>
  )
}

/**
 * Puzzle 10 — Ordem dos Anéis.
 * Fingerprint → frame pattern → rota → DVR → storage → cutscene CAM11.
 */
export function RingsSession({ revealRequest = 0 }: { revealRequest?: number } = {}) {
  const inv = useInvestigation()
  const fullyDone = Boolean(inv.flags.block08_rings_done)
  const routeUnlocked = Boolean(inv.flags.block08_rings_timeline_solved) || fullyDone
  const revealDone =
    Boolean(inv.flags.block08_morsa_continuity_confirmed) || fullyDone

  const [fpA, setFpA] = useState<RingMediaId | ''>('')
  const [fpB, setFpB] = useState<RingMediaId | ''>('')
  const [fpMsg, setFpMsg] = useState<string | null>(null)
  const [fpOk, setFpOk] = useState(false)

  const [frA, setFrA] = useState<RingMediaId | ''>('')
  const [frB, setFrB] = useState<RingMediaId | ''>('')
  const [frMsg, setFrMsg] = useState<string | null>(null)
  const [frOk, setFrOk] = useState(false)

  const [routePick, setRoutePick] = useState<RingRouteId | null>(routeUnlocked ? 'service' : null)
  const [selectedRoute, setSelectedRoute] = useState<RingRouteId | null>(
    routeUnlocked ? 'service' : null,
  )
  const [routeMsg, setRouteMsg] = useState<string | null>(null)

  const [structMsg, setStructMsg] = useState<string | null>(null)
  const [structOk, setStructOk] = useState(false)
  const [query, setQuery] = useState('')
  const [rawHits, setRawHits] = useState(() =>
    revealDone ? searchRawStorage('1279') : [],
  )
  const [showCctv, setShowCctv] = useState(false)
  const [devOpen, setDevOpen] = useState(false)
  const [lightbox, setLightbox] = useState<StillLightbox | null>(null)
  const [mariActivity, setMariActivity] = useState(0)
  const bumpMariActivity = () => setMariActivity((n) => n + 1)

  useEffect(() => {
    if (revealRequest > 0 && routeUnlocked && !revealDone) setShowCctv(true)
  }, [revealRequest, routeUnlocked, revealDone])

  useEffect(() => {
    if (routeUnlocked) {
      setRoutePick('service')
      setSelectedRoute('service')
    }
  }, [routeUnlocked])

  const camerasOpen = routeUnlocked
  const canInspectDvr = camerasOpen
  const phase: Phase = fullyDone
    ? 'done'
    : revealDone
      ? 'done'
      : showCctv
        ? 'reveal'
        : structOk || rawHits.some((h) => h.segmentId === MISSING_SEGMENT_ID)
          ? 'storage'
          : canInspectDvr
            ? 'dvr'
            : fpOk && frOk
              ? 'route'
              : 'media'

  const runFingerprint = () => {
    if (!fpA || !fpB || fpA === fpB) {
      setFpMsg('Escolha duas fontes distintas.')
      return
    }
    playSfx('ui')
    bumpMariActivity()
    const r = compareAudioFingerprints(fpA, fpB)
    setFpMsg(r.message)
    setFpOk(r.match)
    playSfx(r.match ? 'unlock' : 'error')
  }

  const runFrame = () => {
    if (!frA || !frB || frA === frB) {
      setFrMsg('Escolha dois vídeos distintos.')
      return
    }
    playSfx('ui')
    bumpMariActivity()
    const r = compareFramePatterns(frA, frB)
    setFrMsg(r.message)
    setFrOk(r.match)
    playSfx(r.match ? 'unlock' : 'error')
  }

  const confirmRoute = () => {
    if (routeUnlocked || fullyDone || !routePick) return
    if (!fpOk || !frOk) {
      setRouteMsg('Os vínculos temporais entre as mídias ainda estão incompletos.')
      return
    }
    bumpMariActivity()
    setSelectedRoute(routePick)
    const route = RING_ROUTES.find((r) => r.id === routePick)!
    if (!route.compatible) {
      playSfx('error')
      setRouteMsg('Incompatível com o tempo registrado e com os obstáculos físicos conhecidos.')
      return
    }
    playSfx('unlock')
    setRouteMsg(
      'A passagem de serviço é a única trajetória coerente com o tempo e com as barreiras.',
    )
    onRingsTimelineSolved()
  }

  const inspectStructure = () => {
    if (!canInspectDvr) return
    playSfx('ui')
    bumpMariActivity()
    const r = inspectCam11Structure()
    setStructMsg(r.message)
    setStructOk(true)
  }

  const runSearch = () => {
    playSfx('ui')
    bumpMariActivity()
    setRawHits(searchRawStorage(query))
  }

  const openSegment = (segmentId: string) => {
    if (segmentId !== MISSING_SEGMENT_ID || revealDone) return
    playSfx('unlock')
    setShowCctv(true)
  }

  const mediaIds = Object.keys(RING_MEDIA) as RingMediaId[]
  const videoIds = mediaIds.filter((id) => RING_MEDIA[id].kind === 'video')

  const knownPositions = useMemo(
    () =>
      [
        fpOk ? 'Lívia↔Samuel temporal link' : null,
        frOk ? 'Samuel↔secondary illumination link' : null,
        selectedRoute ? `route:${selectedRoute}` : null,
      ].filter(Boolean),
    [fpOk, frOk, selectedRoute],
  )

  const mariRingsProgress = useMemo(
    () => ({
      fpOk,
      frOk,
      routeResolved: routeUnlocked || (fpOk && frOk && selectedRoute === 'service'),
      dvrInspected: structOk,
      storageSearched: rawHits.length > 0,
    }),
    [fpOk, frOk, routeUnlocked, selectedRoute, structOk, rawHits.length],
  )

  const openStill = (payload: StillLightbox) => {
    playSfx('ui')
    setLightbox(payload)
  }

  return (
    <div className="rings-ws" data-testid="rings-panel">
      <header className="rings-ws__intro">
        <p className="rings-ws__lede">Percurso de Morsa — materiais heterogêneos</p>
        <p className="fw-muted">
          Mariana reconstruía deslocamentos. Cruzar mídias, eliminar rotas impossíveis e inspecionar
          o arquivo de CFTV da passagem — sem pressupor identidade.
        </p>
      </header>

      <RingsSection title="Manifesto do pacote">
        <table className="fw-table rings-ws__manifest" data-testid="rings-media-list">
          <thead>
            <tr>
              <th>Ref.</th>
              <th>Modalidade</th>
              <th>Registro</th>
              <th>Duração</th>
              <th>Quadro</th>
              <th>Faixa</th>
            </tr>
          </thead>
          <tbody>
            {mediaIds.map((id) => {
              const m = RING_MEDIA[id]
              const poster = m.kind === 'video' && 'posterSrc' in m ? m.posterSrc : null
              const sprite =
                m.kind === 'video' && 'spriteSrc' in m ? m.spriteSrc : undefined
              const audio = 'audioSrc' in m && m.audioSrc ? m.audioSrc : null
              return (
                <tr key={id}>
                  <td className="fw-mono">{id}</td>
                  <td>{m.kind === 'audio' ? 'Áudio' : 'Vídeo'}</td>
                  <td className="rings-ws__reg">
                    <span className="rings-ws__reg-title">{m.label}</span>
                    <span className="fw-muted">{m.note}</span>
                  </td>
                  <td className="fw-mono">{m.durationSec}s</td>
                  <td className="rings-ws__cell-quadro">
                    {poster ? (
                      <RingsMediaThumb
                        posterSrc={poster}
                        spriteSrc={sprite}
                        label={m.label}
                        onExpand={() =>
                          openStill({
                            title: m.label,
                            subtitle: m.note,
                            posterSrc: poster,
                            spriteSrc: sprite,
                          })
                        }
                      />
                    ) : (
                      <span className="fw-muted rings-ws__na">—</span>
                    )}
                  </td>
                  <td className="rings-ws__cell-faixa">
                    {audio ? <RingsStripPlayer src={audio} label={m.label} /> : (
                      <span className="fw-muted rings-ws__na">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </RingsSection>

      <RingsSection title="Correlação de impressão digital (áudio)">
        <RingsCompareTool
          labelA="Fonte A"
          labelB="Fonte B"
          testIdA="fp-a"
          testIdB="fp-b"
          testIdRun="fp-run"
          valueA={fpA}
          valueB={fpB}
          options={mediaIds.map((id) => ({ id, label: RING_MEDIA[id].label }))}
          onA={(v) => setFpA(v as RingMediaId | '')}
          onB={(v) => setFpB(v as RingMediaId | '')}
          onRun={runFingerprint}
          runLabel="Executar correlação"
        />
        {fpMsg ? (
          <p className="rings-ws__report" data-testid="fp-status" role="status">
            {fpMsg}
          </p>
        ) : null}
      </RingsSection>

      <RingsSection title="Padrão de quadro (vídeo)">
        <RingsCompareTool
          labelA="Vídeo A"
          labelB="Vídeo B"
          testIdA="fr-a"
          testIdB="fr-b"
          testIdRun="fr-run"
          valueA={frA}
          valueB={frB}
          options={videoIds.map((id) => ({ id, label: RING_MEDIA[id].label }))}
          onA={(v) => setFrA(v as RingMediaId | '')}
          onB={(v) => setFrB(v as RingMediaId | '')}
          onRun={runFrame}
          runLabel="Executar comparação de quadros"
        />
        {frMsg ? (
          <p className="rings-ws__report" data-testid="fr-status" role="status">
            {frMsg}
          </p>
        ) : null}
      </RingsSection>

      <RingsSection title="Mapa — rotas candidatas">
        <table className="fw-table fw-page-table rings-ws__route-table" data-testid="rings-routes">
          <thead>
            <tr>
              <th>Rota</th>
              <th>Observação</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {RING_ROUTES.map((r) => {
              const confirmed = routeUnlocked && r.id === 'service'
              const picked = routePick === r.id
              const status = confirmed
                ? 'confirmada'
                : picked
                  ? 'em análise'
                  : selectedRoute === r.id
                    ? 'descartada'
                    : '—'
              return (
                <tr
                  key={r.id}
                  data-testid={`route-${r.id}`}
                  data-active={picked || confirmed ? 'true' : undefined}
                  className="rings-ws__route-row"
                  onClick={() => {
                    if (!routeUnlocked && !fullyDone) setRoutePick(r.id)
                  }}
                >
                  <td>{r.label}</td>
                  <td className="fw-muted">{r.detail}</td>
                  <td className="fw-mono">{status}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(routePick === 'service' || routeUnlocked) && !fullyDone ? (
          <div className="rings-ws__route-stills">
            {RING_ROUTES.find((r) => r.id === 'service')!.backgrounds.map((src) => (
              <button
                key={src}
                type="button"
                className="rings-ws__route-thumb"
                onClick={() =>
                  openStill({
                    title: 'Passagem de serviço',
                    subtitle: 'Trecho reconstruído a partir do pacote',
                    posterSrc: src,
                  })
                }
              >
                <img src={resolveChatMediaSrc(src)} alt="" />
              </button>
            ))}
          </div>
        ) : null}
        {!routeUnlocked ? (
          <div className="rings-ws__tool-actions">
            <button
              type="button"
              className="fw-btn"
              disabled={!routePick}
              onClick={confirmRoute}
            >
              Registrar conclusão de rota
            </button>
          </div>
        ) : null}
        {routeMsg ? (
          <p className="rings-ws__report" data-testid="route-status" role="status">
            {routeMsg}
          </p>
        ) : null}
      </RingsSection>

      {camerasOpen ? (
        <>
          <RingsSection title="Cobertura CFTV — passagem de serviço">
            <p className="fw-muted">Câmeras que cobriam aquele trecho:</p>
            <table className="fw-table" data-testid="rings-cameras">
              <thead>
                <tr>
                  <th>Câmera</th>
                  <th>Cobertura</th>
                  <th>Referência</th>
                </tr>
              </thead>
              <tbody>
                {RING_CAMERAS.map((c) => (
                  <tr key={c.id}>
                    <td className="fw-mono">{c.id}</td>
                    <td>{c.covers}</td>
                    <td className="fw-mono">{c.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </RingsSection>

          <RingsSection title="Catálogo DVR">
            <table className="fw-table" data-testid="dvr-catalog">
              <thead>
                <tr>
                  <th>Câmera</th>
                  <th>Segmento</th>
                  <th>Início</th>
                  <th>Duração</th>
                  <th>Codec</th>
                  <th>Indexado</th>
                </tr>
              </thead>
              <tbody>
                {DVR_CATALOG.map((s) => (
                  <tr key={s.segmentId}>
                    <td>{s.camera}</td>
                    <td className="fw-mono">{s.segmentId}</td>
                    <td className="fw-mono">{s.startTime}</td>
                    <td>{s.durationSec}s</td>
                    <td>{s.codec}</td>
                    <td>{s.indexed ? 'sim' : 'não'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="rings-ws__tool-actions">
              <button
                type="button"
                className="fw-btn"
                data-testid="inspect-media-structure"
                onClick={inspectStructure}
              >
                Verificar continuidade do índice
              </button>
            </div>
            {structMsg ? (
              <p className="rings-ws__report" data-testid="struct-status" role="status">
                {structMsg}
              </p>
            ) : null}
          </RingsSection>

          <RingsSection title="Navegador de armazenamento (exportação bruta)">
            <div className="rings-ws__tool">
              <div className="rings-ws__tool-row">
                <label className="rings-ws__tool-field rings-ws__tool-field--wide">
                  <span className="rings-ws__tool-label">Consulta</span>
                  <input
                    className="fw-compare-bar__input"
                    data-testid="storage-query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="câmera / segmento / prefixo"
                  />
                </label>
                <button
                  type="button"
                  className="fw-btn rings-ws__tool-run"
                  data-testid="storage-search"
                  onClick={runSearch}
                >
                  Consultar armazenamento
                </button>
              </div>
            </div>
            <table className="fw-table rings-ws__storage" data-testid="storage-hits">
              <thead>
                <tr>
                  <th>Segmento</th>
                  <th>Índice</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {rawHits.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="fw-muted">
                      Nenhum resultado.
                    </td>
                  </tr>
                ) : (
                  rawHits.map((h) => (
                    <tr key={h.segmentId}>
                      <td className="fw-mono">{h.segmentId}</td>
                      <td>{h.indexed ? 'indexado' : 'não indexado'}</td>
                      <td>
                        {h.thumbnailAmbiguous ? (
                          <button
                            type="button"
                            className="fw-btn fw-btn--ghost rings-ws__ambig-btn"
                            data-testid="seg-1279-thumb"
                            onClick={() =>
                              openStill({
                                title: h.segmentId,
                                subtitle: 'Exportação bruta — quadro parcial',
                                camLabel: 'CAM 11',
                                timeLabel: '21:15:12',
                                ambiguous: true,
                              })
                            }
                          >
                            Ver quadro
                          </button>
                        ) : null}
                        {h.segmentId === MISSING_SEGMENT_ID ? (
                          <button
                            type="button"
                            className="fw-btn"
                            data-testid="open-cam11-1279"
                            onClick={() => openSegment(h.segmentId)}
                          >
                            Abrir exportação
                          </button>
                        ) : (
                          !h.thumbnailAmbiguous ? (
                            <span className="fw-muted">—</span>
                          ) : null
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </RingsSection>
        </>
      ) : (
        <p className="fw-muted rings-ws__locked" data-testid="cameras-locked">
          Cobertura de CFTV permanece inacessível até a rota física ser estabelecida.
        </p>
      )}

      {import.meta.env.DEV ? (
        <div className="rings-ws__dev">
          <button type="button" className="fw-btn fw-btn--dev" onClick={() => setDevOpen((v) => !v)}>
            DEV
          </button>
          {devOpen ? (
            <pre data-testid="rings-dev" className="rings-ws__dev-pre">
              {JSON.stringify(
                {
                  liviaSamuelFingerprint: fpOk,
                  videoFramePatternMatch: frOk,
                  knownMorsaPositions: knownPositions,
                  routeCandidates: RING_ROUTES.map((r) => r.id),
                  selectedRoute,
                  servicePassageInferred: routeUnlocked,
                  cameraCoverageUnlocked: camerasOpen,
                  missingSegmentExpected: structOk,
                  rawSegmentFound: rawHits.some((h) => h.segmentId === MISSING_SEGMENT_ID),
                  revealPlayed: revealDone,
                  morsaWasAndre: Boolean(inv.evidenceOwned.includes('morsa_was_andre')),
                  phase,
                },
                null,
                2,
              )}
            </pre>
          ) : null}
        </div>
      ) : null}

      <RingsStillLightbox state={lightbox} onClose={() => setLightbox(null)} />

      {showCctv && !revealDone ? (
        <MorsaCctvReveal
          onComplete={() => {
            setShowCctv(false)
            onMorsaContinuityConfirmed()
          }}
        />
      ) : null}

      {revealDone ? (
        <p className="rings-ws__report rings-ws__solved" data-testid="rings-solved">
          Segmento CAM11 inspecionado. O caderno registra a continuação.
        </p>
      ) : null}
      <MariWorkbenchHints
        puzzleId="puzzle-10-rings"
        activityCount={mariActivity}
        puzzleCompleted={fullyDone || revealDone}
        ringsProgress={mariRingsProgress}
      />
    </div>
  )
}
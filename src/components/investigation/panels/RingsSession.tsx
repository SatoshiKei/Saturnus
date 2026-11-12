import { useMemo, useState } from 'react'
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

type Phase =
  | 'media'
  | 'route'
  | 'cameras'
  | 'dvr'
  | 'storage'
  | 'reveal'
  | 'done'

/**
 * Puzzle 10 — Ordem dos Anéis.
 * Fingerprint → frame pattern → rota → DVR → storage → cutscene CAM11.
 */
export function RingsSession() {
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
      setFpMsg('Select two different media.')
      return
    }
    playSfx('ui')
    const r = compareAudioFingerprints(fpA, fpB)
    setFpMsg(r.message)
    setFpOk(r.match)
    playSfx(r.match ? 'unlock' : 'error')
  }

  const runFrame = () => {
    if (!frA || !frB || frA === frB) {
      setFrMsg('Select two different videos.')
      return
    }
    playSfx('ui')
    const r = compareFramePatterns(frA, frB)
    setFrMsg(r.message)
    setFrOk(r.match)
    playSfx(r.match ? 'unlock' : 'error')
  }

  const confirmRoute = (id: RingRouteId) => {
    if (routeUnlocked || fullyDone) return
    if (!fpOk || !frOk) {
      setRouteMsg('Temporal links between media are still incomplete.')
      return
    }
    setSelectedRoute(id)
    const route = RING_ROUTES.find((r) => r.id === id)!
    if (!route.compatible) {
      playSfx('error')
      setRouteMsg('Physically / temporally incompatible with the known appearances.')
      return
    }
    playSfx('unlock')
    setRouteMsg('Service passage is the only route consistent with time and barriers.')
    onRingsTimelineSolved()
  }

  const inspectStructure = () => {
    if (!canInspectDvr) return
    playSfx('ui')
    const r = inspectCam11Structure()
    setStructMsg(r.message)
    setStructOk(true)
  }

  const runSearch = () => {
    playSfx('ui')
    setRawHits(searchRawStorage(query))
  }

  const openSegment = (segmentId: string) => {
    if (segmentId !== MISSING_SEGMENT_ID || revealDone) return
    playSfx('unlock')
    setShowCctv(true)
  }

  const mediaIds = Object.keys(RING_MEDIA) as RingMediaId[]

  const knownPositions = useMemo(
    () => [
      fpOk ? 'Lívia↔Samuel temporal link' : null,
      frOk ? 'Samuel↔secondary illumination link' : null,
      selectedRoute ? `route:${selectedRoute}` : null,
    ].filter(Boolean),
    [fpOk, frOk, selectedRoute],
  )

  return (
    <div className="aw-hex" data-testid="rings-panel">
      <p className="aw-orbit__title">Percurso de Morsa — materiais heterogêneos</p>
      <p className="aw-provisional__note">
        Mariana reconstruía deslocamentos. Cruzar mídias, eliminar rotas impossíveis e inspecionar o
        arquivo de CFTV da passagem — sem pressupor identidade.
      </p>

      <h4 className="pc-sub">Materiais</h4>
      <ul className="pc-ul" data-testid="rings-media-list">
        {mediaIds.map((id) => {
          const m = RING_MEDIA[id]
          return (
            <li key={id}>
              <strong>{m.label}</strong>
              <span className="aw-provisional__note"> — {m.note}</span>
              {m.kind === 'video' && 'posterSrc' in m ? (
                <div className="rings-thumb" style={{ marginTop: 6 }}>
                  <div
                    style={{
                      position: 'relative',
                      width: 160,
                      height: 90,
                      overflow: 'hidden',
                      filter: 'contrast(1.1) saturate(0.7)',
                      background: '#111',
                    }}
                  >
                    <img
                      src={resolveChatMediaSrc(m.posterSrc)}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                    />
                    {'spriteSrc' in m && m.spriteSrc ? (
                      <img
                        src={resolveChatMediaSrc(m.spriteSrc)}
                        alt=""
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: '35%',
                          height: '70%',
                          imageRendering: 'pixelated',
                          filter: 'blur(0.4px) contrast(1.2)',
                          opacity: 0.9,
                        }}
                      />
                    ) : null}
                  </div>
                </div>
              ) : null}
              {'audioSrc' in m && m.audioSrc ? (
                <audio controls src={resolveChatMediaSrc(m.audioSrc)} preload="metadata" style={{ display: 'block', marginTop: 4, maxWidth: 280 }} />
              ) : null}
            </li>
          )
        })}
      </ul>

      <h4 className="pc-sub">Audio Fingerprint Compare</h4>
      <div className="fw-eq" style={{ gap: 8, flexWrap: 'wrap' }}>
        <select data-testid="fp-a" value={fpA} onChange={(e) => setFpA(e.target.value as RingMediaId | '')}>
          <option value="">Source A</option>
          {mediaIds.map((id) => (
            <option key={id} value={id}>
              {RING_MEDIA[id].label}
            </option>
          ))}
        </select>
        <select data-testid="fp-b" value={fpB} onChange={(e) => setFpB(e.target.value as RingMediaId | '')}>
          <option value="">Source B</option>
          {mediaIds.map((id) => (
            <option key={id} value={id}>
              {RING_MEDIA[id].label}
            </option>
          ))}
        </select>
        <button type="button" className="aw-provisional__go" data-testid="fp-run" onClick={runFingerprint}>
          Compare fingerprints
        </button>
      </div>
      {fpMsg ? <p data-testid="fp-status">{fpMsg}</p> : null}

      <h4 className="pc-sub">Compare Frame Pattern</h4>
      <div className="fw-eq" style={{ gap: 8, flexWrap: 'wrap' }}>
        <select data-testid="fr-a" value={frA} onChange={(e) => setFrA(e.target.value as RingMediaId | '')}>
          <option value="">Video A</option>
          {mediaIds.filter((id) => RING_MEDIA[id].kind === 'video').map((id) => (
            <option key={id} value={id}>
              {RING_MEDIA[id].label}
            </option>
          ))}
        </select>
        <select data-testid="fr-b" value={frB} onChange={(e) => setFrB(e.target.value as RingMediaId | '')}>
          <option value="">Video B</option>
          {mediaIds.filter((id) => RING_MEDIA[id].kind === 'video').map((id) => (
            <option key={id} value={id}>
              {RING_MEDIA[id].label}
            </option>
          ))}
        </select>
        <button type="button" className="aw-provisional__go" data-testid="fr-run" onClick={runFrame}>
          Compare frame pattern
        </button>
      </div>
      {frMsg ? <p data-testid="fr-status">{frMsg}</p> : null}

      <h4 className="pc-sub">Mapa — rotas candidatas</h4>
      <ul className="pc-ul" data-testid="rings-routes">
        {RING_ROUTES.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              className="pc-inline"
              data-testid={`route-${r.id}`}
              data-selected={selectedRoute === r.id}
              disabled={routeUnlocked && r.id !== 'service'}
              onClick={() => confirmRoute(r.id)}
            >
              {r.label}
            </button>
            <span className="aw-provisional__note"> — {r.detail}</span>
            {selectedRoute === r.id || (routeUnlocked && r.id === 'service') ? (
              <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                {r.backgrounds.map((src) => (
                  <img
                    key={src}
                    src={resolveChatMediaSrc(src)}
                    alt=""
                    style={{ width: 72, height: 40, objectFit: 'cover', filter: 'grayscale(0.2) contrast(1.05)' }}
                  />
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {routeMsg ? <p data-testid="route-status">{routeMsg}</p> : null}

      {camerasOpen ? (
        <>
          <h4 className="pc-sub">Cobertura CFTV — passagem de serviço</h4>
          <p className="aw-provisional__note">Câmeras que cobriam aquele trecho:</p>
          <ul className="pc-ul" data-testid="rings-cameras">
            {RING_CAMERAS.map((c) => (
              <li key={c.id}>
                {c.id} — {c.covers}
              </li>
            ))}
          </ul>

          <h4 className="pc-sub">DVR catalog</h4>
          <table className="fw-table" data-testid="dvr-catalog">
            <thead>
              <tr>
                <th>Camera</th>
                <th>Segment</th>
                <th>Start</th>
                <th>Dur</th>
                <th>Codec</th>
                <th>Indexed</th>
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
                  <td>{s.indexed ? 'yes' : 'no'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            className="aw-provisional__go"
            data-testid="inspect-media-structure"
            onClick={inspectStructure}
          >
            Inspect Media Structure
          </button>
          {structMsg ? <p data-testid="struct-status">{structMsg}</p> : null}

          <h4 className="pc-sub">Storage browser (raw export)</h4>
          <div className="fw-eq" style={{ gap: 8 }}>
            <input
              data-testid="storage-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="camera / segment / prefix"
              style={{ minWidth: 180 }}
            />
            <button type="button" className="pc-inline" data-testid="storage-search" onClick={runSearch}>
              Search storage
            </button>
          </div>
          <ul className="pc-ul" data-testid="storage-hits">
            {rawHits.map((h) => (
              <li key={h.segmentId}>
                <span className="fw-mono">{h.segmentId}</span>
                {!h.indexed ? ' · unindexed' : ''}
                {h.thumbnailAmbiguous ? (
                  <div
                    style={{
                      width: 96,
                      height: 54,
                      marginTop: 4,
                      background: '#1a1a1a',
                      border: '1px solid #333',
                    }}
                    data-testid="seg-1279-thumb"
                    title="Ambiguous frame"
                  />
                ) : null}
                {h.segmentId === MISSING_SEGMENT_ID ? (
                  <button
                    type="button"
                    className="aw-provisional__go"
                    data-testid="open-cam11-1279"
                    style={{ marginLeft: 8 }}
                    onClick={() => openSegment(h.segmentId)}
                  >
                    Open segment
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="aw-provisional__note" data-testid="cameras-locked">
          Cobertura de CFTV permanece inacessível até a rota física ser estabelecida.
        </p>
      )}

      {import.meta.env.DEV ? (
        <div style={{ marginTop: 12 }}>
          <button type="button" className="pc-inline" onClick={() => setDevOpen((v) => !v)}>
            DEV
          </button>
          {devOpen ? (
            <pre data-testid="rings-dev" style={{ fontSize: 11, opacity: 0.8 }}>
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

      {showCctv && !revealDone ? (
        <MorsaCctvReveal
          onComplete={() => {
            setShowCctv(false)
            onMorsaContinuityConfirmed()
          }}
        />
      ) : null}

      {revealDone ? (
        <p data-testid="rings-solved">Segmento CAM11 inspecionado. O caderno registra a continuação.</p>
      ) : null}
    </div>
  )
}

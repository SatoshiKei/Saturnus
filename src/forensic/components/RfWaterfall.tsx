import { useMemo, useRef } from 'react'
import type { RfCaptureConfig } from '../forensicTypes'

/**
 * Waterfall genérico: eixo X = frequência, Y = tempo, brilho = energia.
 * Sem labels de canal oculto — o jogador precisa perceber.
 */
export function RfWaterfall({
  rf,
  centerMhz,
  bandwidthMhz,
  onSelectBand,
}: {
  rf: RfCaptureConfig
  centerMhz: number | null
  bandwidthMhz: number | null
  onSelectBand: (centerMhz: number, bandwidthMhz: number) => void
}) {
  const drag = useRef<{ a: number; b: number } | null>(null)
  const { waterfall } = rf
  const cells = useMemo(() => {
    const out: { c: number; r: number; v: number }[] = []
    for (let i = 0; i < waterfall.values.length; i++) {
      const c = i % waterfall.cols
      const r = Math.floor(i / waterfall.cols)
      const v = waterfall.values[i] ?? 0
      if (v < 0.08) continue
      out.push({ c, r, v })
    }
    return out
  }, [waterfall])

  const freqAt = (clientX: number, el: Element) => {
    const rect = el.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    return waterfall.freqMinMhz + x * (waterfall.freqMaxMhz - waterfall.freqMinMhz)
  }

  const selLo =
    centerMhz != null && bandwidthMhz != null ? centerMhz - bandwidthMhz / 2 : null
  const selHi =
    centerMhz != null && bandwidthMhz != null ? centerMhz + bandwidthMhz / 2 : null

  return (
    <div className="fw-rf" data-testid="rf-waterfall">
      <div className="fw-rf__legend">
        <span>{waterfall.freqMinMhz.toFixed(3)} MHz</span>
        <span>Spectrum / Waterfall</span>
        <span>{waterfall.freqMaxMhz.toFixed(3)} MHz</span>
      </div>
      <svg
        className="fw-rf__plot"
        viewBox={`0 0 ${waterfall.cols} ${waterfall.rows}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="RF waterfall — frequency horizontal, time vertical"
        data-testid="rf-waterfall-plot"
        onPointerDown={(e) => {
          const el = e.currentTarget
          el.setPointerCapture(e.pointerId)
          const f = freqAt(e.clientX, el)
          drag.current = { a: f, b: f }
        }}
        onPointerMove={(e) => {
          if (!drag.current) return
          drag.current.b = freqAt(e.clientX, e.currentTarget)
        }}
        onPointerUp={(e) => {
          if (!drag.current) return
          const a = drag.current.a
          const b = freqAt(e.clientX, e.currentTarget)
          drag.current = null
          const lo = Math.min(a, b)
          const hi = Math.max(a, b)
          const bw = Math.max(0.008, hi - lo)
          const center = (lo + hi) / 2
          onSelectBand(Number(center.toFixed(4)), Number(bw.toFixed(4)))
        }}
      >
        {cells.map(({ c, r, v }) => (
          <rect
            key={`${c}-${r}`}
            x={c}
            y={r}
            width="1"
            height="1"
            opacity={0.15 + v * 0.85}
            fill={`rgb(${Math.floor(40 + v * 215)}, ${Math.floor(20 + v * 100)}, ${Math.floor(10 + v * 40)})`}
          />
        ))}
        {selLo != null && selHi != null
          ? (() => {
              const x0 =
                ((selLo - waterfall.freqMinMhz) / (waterfall.freqMaxMhz - waterfall.freqMinMhz)) *
                waterfall.cols
              const x1 =
                ((selHi - waterfall.freqMinMhz) / (waterfall.freqMaxMhz - waterfall.freqMinMhz)) *
                waterfall.cols
              return (
                <rect
                  className="fw-rf__sel"
                  x={Math.min(x0, x1)}
                  y={0}
                  width={Math.max(0.5, Math.abs(x1 - x0))}
                  height={waterfall.rows}
                  fill="rgba(180, 200, 255, 0.12)"
                  stroke="rgba(200, 220, 255, 0.55)"
                  strokeWidth={0.4}
                />
              )
            })()
          : null}
      </svg>
      <p className="fw-rf__hint">
        Drag horizontally to set center frequency and bandwidth. Time runs top → bottom.
      </p>
      {/* Marcadores só dos canais catalogados — sem destacar o oculto */}
      <div className="fw-rf__known" data-testid="rf-known-channels">
        {rf.channels
          .filter((c) => c.known)
          .map((c) => (
            <span key={c.id}>
              Catalogued · {c.centerMhz.toFixed(3)} MHz
            </span>
          ))}
      </div>
    </div>
  )
}

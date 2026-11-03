import { useState } from 'react'
import { contradictionDefs } from '../../../data/game/seedStory'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import { tryConfirmContradiction } from '../../../game/state/investigationStore'

type Tab = 'people' | 'evidence' | 'locations' | 'timeline' | 'hypotheses' | 'contradictions'

export function CasebookPanel() {
  const inv = useInvestigation()
  const [tab, setTab] = useState<Tab>('people')
  const [contraA, setContraA] = useState('')
  const [contraB, setContraB] = useState('')

  return (
    <div className="inv-casebook" data-testid="casebook">
      <nav className="inv-tabs" aria-label="Abas do caderno">
        {(
          [
            ['people', 'Pessoas'],
            ['evidence', 'Evidências'],
            ['locations', 'Locais'],
            ['timeline', 'Timeline'],
            ['hypotheses', 'Hipóteses'],
            ['contradictions', 'Contradições'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={tab === id ? 'inv-tabs__active' : ''}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === 'people' ? (
        <ul className="inv-list">
          {Object.values(inv.people).map((p) => (
            <li key={p.id} data-testid={`person-${p.id}`}>
              <strong>{p.name}</strong> — {p.status}
              {p.occupation ? ` · ${p.occupation}` : ''}
            </li>
          ))}
        </ul>
      ) : null}

      {tab === 'evidence' ? (
        <ul className="inv-list">
          {inv.evidenceOwned.map((id) => {
            const e = inv.evidence[id]
            return (
              <li key={id}>
                {e?.title ?? id} · {e?.originalOrDerived} · {e?.sourceType}
              </li>
            )
          })}
        </ul>
      ) : null}

      {tab === 'locations' ? (
        <ul className="inv-list">
          {Object.values(inv.locations).map((l) => (
            <li key={l.id}>
              {l.status === 'unknown' ? '???' : l.name} — {l.status}
            </li>
          ))}
        </ul>
      ) : null}

      {tab === 'timeline' ? (
        <ul className="inv-list" data-testid="timeline-list">
          {inv.timeline.map((e) => (
            <li key={e.id}>
              {e.start}
              {e.end ? `–${e.end}` : ''} · {e.label}
            </li>
          ))}
        </ul>
      ) : null}

      {tab === 'hypotheses' ? (
        <ul className="inv-list">
          {Object.values(inv.hypotheses).map((h) => (
            <li key={h.id}>
              {h.title} — {h.state}
            </li>
          ))}
        </ul>
      ) : null}

      {tab === 'contradictions' ? (
        <div className="inv-contra" data-testid="contradiction-panel">
          <p>Cruzar duas evidências que você possui:</p>
          <select value={contraA} onChange={(e) => setContraA(e.target.value)} aria-label="Evidência A">
            <option value="">—</option>
            {inv.evidenceOwned.map((id) => (
              <option key={id} value={id}>
                {inv.evidence[id]?.title ?? id}
              </option>
            ))}
          </select>
          <select value={contraB} onChange={(e) => setContraB(e.target.value)} aria-label="Evidência B">
            <option value="">—</option>
            {inv.evidenceOwned.map((id) => (
              <option key={id} value={id}>
                {inv.evidence[id]?.title ?? id}
              </option>
            ))}
          </select>
          <button
            type="button"
            data-testid="contradiction-submit"
            disabled={!contraA || !contraB || contraA === contraB}
            onClick={() => tryConfirmContradiction(contraA, contraB)}
          >
            Marcar como contradição
          </button>
          <ul>
            {inv.contradictionsConfirmed.map((c) => {
              const def = contradictionDefs.find((d) => d.id === c.id)
              return <li key={c.id}>{def?.summary ?? c.id}</li>
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

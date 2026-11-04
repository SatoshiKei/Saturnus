import { useMemo, useState, type CSSProperties } from 'react'
import { contradictionDefs } from '../../../data/game/seedStory'
import { seedDocuments } from '../../../data/game/seedDocuments'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import { isPersonVisibleInRegistry } from '../../../game/personRegistryGates'
import { takeNotebookFocus } from '../../../app/uiStore'
import type { Evidence, InvestigationState, Location, Person } from '../../../game/types'
import {
  confidenceLabel,
  evidenceOriginLabel,
  evidenceSourceLabel,
  evidenceTypeLabel,
  hypothesisStateLabel,
  integrityLabel,
  locationStatusLabel,
  personStatusLabel,
  precisionLabel,
} from '../../../lib/labels'
import { GamePanel } from '../../ui/GamePanel'

type Tab = 'people' | 'evidence' | 'locations' | 'timeline' | 'hypotheses' | 'contradictions'

const tabs: { id: Tab; label: string; hue: string }[] = [
  { id: 'people', label: 'Pessoas', hue: '#8f6a2c' },
  { id: 'evidence', label: 'Evidências', hue: '#3d6663' },
  { id: 'locations', label: 'Locais', hue: '#6b5a3e' },
  { id: 'timeline', label: 'Timeline', hue: '#4b5a6e' },
  { id: 'hypotheses', label: 'Hipóteses', hue: '#6e4b4b' },
  { id: 'contradictions', label: 'Contradições', hue: '#7a3a32' },
]

/** Nunca vaza o id interno: itens ainda não reunidos aparecem como registro genérico. */
function titleOf(inv: InvestigationState, id: string) {
  const owned = inv.evidenceOwned.includes(id)
  return owned ? (inv.evidence[id]?.title ?? 'Registro sem título') : 'Evidência ainda não reunida'
}

function Chips({ items, empty, limit = 5 }: { items: string[]; empty: string; limit?: number }) {
  const [open, setOpen] = useState(false)
  if (!items.length) return <p className="nb-muted">{empty}</p>
  const shown = open ? items : items.slice(0, limit)
  const hidden = items.length - shown.length
  return (
    <div className="nb-chips">
      {shown.map((i, n) => (
        <span key={`${i}-${n}`} className="nb-chip">
          {i}
        </span>
      ))}
      {hidden > 0 ? (
        <button type="button" className="nb-chip nb-chip--more" onClick={() => setOpen(true)}>
          +{hidden}
        </button>
      ) : null}
    </div>
  )
}

/* ---------------- Pessoas ---------------- */
function PeopleTab({ inv }: { inv: InvestigationState }) {
  const people = Object.values(inv.people).filter((p) => isPersonVisibleInRegistry(p.id, inv))
  const [sel, setSel] = useState<string | null>(null)
  const person: Person | undefined = people.find((p) => p.id === sel) ?? people[0]
  if (!person) return <p className="nb-muted">Nenhuma pessoa registrada ainda.</p>

  const relatedEvidence = inv.evidenceOwned
    .map((id) => inv.evidence[id])
    .filter((e): e is Evidence => Boolean(e) && e.relatedPersonIds.includes(person.id))
  const relatedPeople = person.relatedPersonIds
    .map((id) => inv.people[id])
    .filter((p): p is Person => Boolean(p))
  const places = Object.values(inv.locations).filter(
    (l) => l.status !== 'unknown' && (l.id === person.locationId || l.relatedPersonIds.includes(person.id)),
  )

  return (
    <div className="nb-split">
      <ul className="nb-list">
        {people.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className="nb-list__item"
              data-active={p.id === person.id}
              data-testid={`person-${p.id}`}
              onClick={() => setSel(p.id)}
            >
              <span>{p.name}</span>
              <small>{personStatusLabel[p.status]}</small>
            </button>
          </li>
        ))}
      </ul>
      <article className="nb-page nb-ficha">
        <h3 className="nb-name">{person.name}</h3>
        {person.occupation ? <p className="nb-role">{person.occupation}</p> : null}
        <p className="nb-status">Situação: {personStatusLabel[person.status]}</p>
        {person.aliases?.length ? <p className="nb-muted">Também conhecido(a) como {person.aliases.join(', ')}</p> : null}

        <h4>Relação com o caso</h4>
        {relatedPeople.length ? (
          <p>
            Ligado(a) a {relatedPeople.map((p) => p.name).join(', ')}.
          </p>
        ) : (
          <p className="nb-muted">Nenhuma relação confirmada.</p>
        )}

        {person.notes?.length ? (
          <>
            <h4>Informações registradas</h4>
            <ul className="nb-bullets">
              {person.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </>
        ) : null}

        <h4>Evidências relacionadas</h4>
        <Chips items={relatedEvidence.map((e) => e.title)} empty="Nenhuma evidência vinculada ainda." />

        <h4>Locais relacionados</h4>
        <Chips items={places.map((l) => l.name)} empty="Nenhum local associado." />
      </article>
    </div>
  )
}

/* ---------------- Evidências ---------------- */
function EvidenceTab({ inv, focusId }: { inv: InvestigationState; focusId: string | null }) {
  const items = inv.evidenceOwned.map((id) => inv.evidence[id]).filter((e): e is Evidence => Boolean(e))
  const [sel, setSel] = useState<string | null>(focusId)
  const ev = items.find((e) => e.id === sel) ?? items[0]
  if (!ev) return <p className="nb-muted">Nenhuma evidência reunida ainda.</p>

  const doc = ev.contentRef ? seedDocuments.find((d) => d.id === ev.contentRef) : undefined
  const content = ev.description ?? doc?.blocks[0]?.text
  const people = ev.relatedPersonIds.map((id) => inv.people[id]?.name).filter(Boolean) as string[]
  const places = ev.relatedLocationIds
    .map((id) => inv.locations[id])
    .filter((l): l is Location => Boolean(l) && l.status !== 'unknown')
    .map((l) => l.name)
  const parent = ev.sourceId ? inv.evidence[ev.sourceId] : undefined
  const protectedItem = ev.exportable === false || ev.deviceLocked

  return (
    <div className="nb-split">
      <ul className="nb-list">
        {items.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              className="nb-list__item"
              data-active={e.id === ev.id}
              onClick={() => setSel(e.id)}
            >
              <span>{e.title}</span>
              <small>
                {evidenceTypeLabel[e.type]} · {evidenceOriginLabel(e.originalOrDerived)}
              </small>
            </button>
          </li>
        ))}
      </ul>
      <article className="nb-page">
        <h3 className="nb-name">{ev.title}</h3>
        <p className="nb-role">{evidenceTypeLabel[ev.type]}</p>
        <dl className="nb-dl">
          <dt>Origem</dt>
          <dd>{evidenceSourceLabel(ev)}</dd>
          <dt>Natureza</dt>
          <dd>
            {evidenceOriginLabel(ev.originalOrDerived)}
            {parent ? ` — a partir de “${parent.title}”` : ''}
          </dd>
          <dt>Integridade</dt>
          <dd data-integrity={ev.integrity ?? 'none'}>{integrityLabel(ev.integrity)}</dd>
          {ev.obtainedAt ? (
            <>
              <dt>Obtida em</dt>
              <dd>{ev.obtainedAt}</dd>
            </>
          ) : null}
          {protectedItem ? (
            <>
              <dt>Acesso</dt>
              <dd>Somente no aparelho de origem — não exportável</dd>
            </>
          ) : null}
        </dl>
        {content ? (
          <>
            <h4>Conteúdo</h4>
            <blockquote className="nb-quote">{content}</blockquote>
          </>
        ) : null}
        <h4>Pessoas</h4>
        <Chips items={people} empty="—" />
        <h4>Locais</h4>
        <Chips items={places} empty="—" />
      </article>
    </div>
  )
}

/* ---------------- Locais ---------------- */
function LocationsTab({ inv }: { inv: InvestigationState }) {
  const places = Object.values(inv.locations).filter((l) => l.status !== 'unknown')
  const [sel, setSel] = useState<string | null>(null)
  const place = places.find((l) => l.id === sel) ?? places[0]
  if (!place) return <p className="nb-muted">Nenhum local conhecido.</p>
  const people = place.relatedPersonIds.map((id) => inv.people[id]?.name).filter(Boolean) as string[]
  const evidence = inv.evidenceOwned
    .map((id) => inv.evidence[id])
    .filter((e): e is Evidence => Boolean(e) && e.relatedLocationIds.includes(place.id))
    .map((e) => e.title)
  return (
    <div className="nb-split">
      <ul className="nb-list">
        {places.map((l) => (
          <li key={l.id}>
            <button type="button" className="nb-list__item" data-active={l.id === place.id} onClick={() => setSel(l.id)}>
              <span>{l.name}</span>
              <small>{locationStatusLabel[l.status]}</small>
            </button>
          </li>
        ))}
      </ul>
      <article className="nb-page">
        <h3 className="nb-name">{place.name}</h3>
        <p className="nb-role">{locationStatusLabel[place.status]}</p>
        {place.description ? <p>{place.description}</p> : null}
        <h4>Pessoas relacionadas</h4>
        <Chips items={people} empty="—" />
        <h4>Evidências</h4>
        <Chips items={evidence} empty="Nenhuma evidência ligada a este local." />
        <h4>Visitas</h4>
        <p className="nb-muted">
          {place.status === 'visitAvailable'
            ? 'Endereço anotado. Para ir até lá, abra o mapa.'
            : place.status === 'visited'
              ? 'Local já visitado.'
              : 'Anotado no caderno.'}
        </p>
      </article>
    </div>
  )
}

/* ---------------- Timeline ---------------- */
function TimelineTab({ inv }: { inv: InvestigationState }) {
  return (
    <ol className="nb-timeline" data-testid="timeline-list">
      {inv.timeline.map((e) => (
        <li key={e.id} className="nb-timeline__item" data-precision={e.precision}>
          <span className="nb-timeline__time">
            {e.start ?? '—'}
            {e.end ? `–${e.end}` : ''}
          </span>
          <span className="nb-timeline__dot" aria-hidden />
          <div className="nb-timeline__body">
            <strong>{e.label}</strong>
            <small>
              {precisionLabel(e.precision)} · {confidenceLabel(e.confidence)}
              {e.sourceIds.length ? ` · ${e.sourceIds.length} fonte(s)` : ''}
            </small>
            {e.sourceIds.length ? (
              <span className="nb-timeline__src">{e.sourceIds.map((id) => titleOf(inv, id)).join(' · ')}</span>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}

/* ---------------- Hipóteses ---------------- */
function HypothesesTab({ inv }: { inv: InvestigationState }) {
  const list = Object.values(inv.hypotheses)
  if (!list.length) return <p className="nb-muted">Nenhuma hipótese registrada.</p>
  return (
    <div className="nb-cards">
      {list.map((h) => (
        <article key={h.id} className="nb-page nb-hyp" data-state={h.state}>
          <header>
            <h3 className="nb-name">{h.title}</h3>
            <span className="nb-badge" data-state={h.state}>
              {hypothesisStateLabel[h.state]}
            </span>
          </header>
          <div className="nb-hyp__cols">
            <div>
              <h4>Evidências que apoiam</h4>
              <Chips items={h.supportingEvidenceIds.map((id) => titleOf(inv, id))} empty="Nenhuma até agora." />
            </div>
            <div>
              <h4>Evidências que contradizem</h4>
              <Chips items={h.contradictingEvidenceIds.map((id) => titleOf(inv, id))} empty="Nenhuma até agora." />
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

/* ---------------- Contradições ---------------- */
/** As contradições são detectadas pelo caderno ao reunir as duas evidências (sem seleção manual). */
function ContradictionsTab({ inv }: { inv: InvestigationState }) {
  const list = inv.contradictionsConfirmed
  return (
    <div className="nb-contra" data-testid="contradiction-panel">
      {list.length ? (
        <ul className="nb-confirmed" data-testid="contradiction-list">
          {list.map((c) => {
            const def = contradictionDefs.find((d) => d.id === c.id)
            return (
              <li key={c.id} data-testid={`contradiction-${c.id}`}>
                <span className="nb-badge nb-badge--stamp">Contradição registrada</span>
                <strong>{def?.summary ?? 'Registro sem descrição'}</strong>
                {def ? (
                  <small>
                    {titleOf(inv, def.evidenceAId)} × {titleOf(inv, def.evidenceBId)}
                  </small>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="nb-muted">
          Nenhuma contradição registrada. O caderno confronta as evidências automaticamente à medida que são
          reunidas.
        </p>
      )}
    </div>
  )
}

export function InvestigationNotebook({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  const [focus] = useState(() => takeNotebookFocus())
  const [tab, setTab] = useState<Tab>((focus?.tab as Tab | undefined) ?? 'people')
  const current = useMemo(() => tabs.find((t) => t.id === tab)!, [tab])

  return (
    <GamePanel
      title="Caderno de investigação"
      kicker="Caso Mariana Silva"
      variant="paper"
      testId="hub-casebook"
      onClose={onClose}
    >
      <div className="nb" data-testid="casebook">
        <nav className="nb-tabs" aria-label="Seções do caderno">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className="nb-tab"
              data-active={tab === t.id}
              style={{ '--tab-hue': t.hue } as CSSProperties}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="nb-sheet" style={{ '--tab-hue': current.hue } as CSSProperties}>
          {tab === 'people' ? <PeopleTab inv={inv} /> : null}
          {tab === 'evidence' ? <EvidenceTab inv={inv} focusId={focus?.id ?? null} /> : null}
          {tab === 'locations' ? <LocationsTab inv={inv} /> : null}
          {tab === 'timeline' ? (
            <div className="nb-scroll">
              <TimelineTab inv={inv} />
            </div>
          ) : null}
          {tab === 'hypotheses' ? (
            <div className="nb-scroll">
              <HypothesesTab inv={inv} />
            </div>
          ) : null}
          {tab === 'contradictions' ? (
            <div className="nb-scroll">
              <ContradictionsTab inv={inv} />
            </div>
          ) : null}
        </div>
      </div>
    </GamePanel>
  )
}

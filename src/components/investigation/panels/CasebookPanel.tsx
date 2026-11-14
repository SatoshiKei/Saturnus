import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { visibleMarianaContactChronology } from '../../../data/block05/contactChronology'
import { contradictionDefs } from '../../../data/game/seedStory'
import { seedDocuments } from '../../../data/game/seedDocuments'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import { isPersonVisibleInRegistry } from '../../../game/personRegistryGates'
import { organizeMarianaContactChronology } from '../../../game/story/block05Handlers'
import { organizeMemoryOnset } from '../../../game/story/block07Handlers'
import { takeNotebookFocus } from '../../../app/uiStore'
import { CasebookFilterBar } from '../CasebookFilterBar'
import type { Evidence, EvidenceType, InvestigationState, Location, Person } from '../../../game/types'
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
import { personPortraitSrc } from '../../../lib/personPortraits'
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

/** Resumo curto para cartões — nunca o texto completo. */
export function clampSummary(text: string | undefined, max = 110): string {
  if (!text) return ''
  const flat = text.replace(/\s+/g, ' ').trim()
  if (flat.length <= max) return flat
  const cut = flat.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.\-–—]+$/, '')}…`
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

/* ---------------- Estrutura compartilhada (grade de cartões) ---------------- */

/** Painel de aba: barra de título fixa + área rolável independente (grade ou detalhe). */
function Pane({
  title,
  count,
  filter,
  testId,
  children,
}: {
  title: string
  count?: number
  filter?: ReactNode
  testId?: string
  children: ReactNode
}) {
  return (
    <div className="nb-pane" data-testid={testId}>
      <header className="nb-toolbar">
        <h3 className="nb-toolbar__title">
          {title}
          {count !== undefined ? <span className="nb-toolbar__count"> · {count}</span> : null}
        </h3>
        {filter}
      </header>
      <div className="nb-scroll" data-testid={testId ? `${testId}-scroll` : undefined}>
        {children}
      </div>
    </div>
  )
}

/** Vista de detalhe aberta ao clicar num cartão. */
function Detail({
  backLabel,
  onBack,
  testId,
  children,
}: {
  backLabel: string
  onBack: () => void
  testId: string
  children: ReactNode
}) {
  return (
    <div className="nb-detail" data-testid={testId}>
      <button type="button" className="nb-back" data-testid="nb-detail-back" onClick={onBack}>
        ← {backLabel}
      </button>
      {children}
    </div>
  )
}

/** Retrato com sprite existente; sem sprite → placeholder neutro consistente. */
function Portrait({ person, decorative = false }: { person: Pick<Person, 'id' | 'name'>; decorative?: boolean }) {
  const src = personPortraitSrc(person.id)
  return (
    <span
      className="nb-portrait"
      data-testid={`portrait-${person.id}`}
      data-fallback={src ? undefined : 'true'}
    >
      {src ? (
        <img src={src} alt={decorative ? '' : `Retrato de ${person.name}`} loading="lazy" draggable={false} />
      ) : (
        <span className="nb-portrait__ph" aria-hidden />
      )}
    </span>
  )
}

/* ---------------- Pessoas ---------------- */
function personRelationLine(person: Person, inv: InvestigationState): string {
  if (person.occupation) return person.occupation
  const rel = person.relatedPersonIds
    .filter((id) => isPersonVisibleInRegistry(id, inv))
    .map((id) => inv.people[id])
    .find((p): p is Person => Boolean(p))
  return rel ? `Ligado(a) a ${rel.name}` : 'Relação ainda não confirmada'
}

function PeopleTab({ inv }: { inv: InvestigationState }) {
  const people = Object.values(inv.people).filter((p) => isPersonVisibleInRegistry(p.id, inv))
  const [sel, setSel] = useState<string | null>(null)
  const person: Person | undefined = sel ? people.find((p) => p.id === sel) : undefined

  if (person) {
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
      <Pane title="Pessoas" count={people.length} testId="nb-people">
        <Detail backLabel="Todas as pessoas" onBack={() => setSel(null)} testId="nb-person-detail">
          <article className="nb-page nb-ficha" data-testid={`person-detail-${person.id}`}>
            <div className="nb-ficha__photo">
              <Portrait person={person} />
            </div>
            <h3 className="nb-name">{person.name}</h3>
            {person.occupation ? <p className="nb-role">{person.occupation}</p> : null}
            <p className="nb-status">Situação: {personStatusLabel[person.status]}</p>
            {person.aliases?.length ? (
              <p className="nb-muted">Também conhecido(a) como {person.aliases.join(', ')}</p>
            ) : null}

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
        </Detail>
      </Pane>
    )
  }

  return (
    <Pane title="Pessoas" count={people.length} testId="nb-people">
      {!people.length ? (
        <p className="nb-muted nb-empty">Nenhuma pessoa registrada ainda.</p>
      ) : (
        <ul className="nb-cards nb-cards--people" data-testid="people-grid">
          {people.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className="nb-hyp nb-card nb-card--person"
                data-state={p.status}
                data-testid={`person-${p.id}`}
                onClick={() => setSel(p.id)}
              >
                <Portrait person={p} decorative />
                <span className="nb-card__body">
                  <span className="nb-name nb-card__title">{p.name}</span>
                  <span className="nb-card__meta">{personRelationLine(p, inv)}</span>
                  <span
                    className="nb-badge nb-badge--flat nb-badge--person"
                    data-person-status={p.status}
                    data-testid={`person-status-${p.id}`}
                  >
                    {personStatusLabel[p.status]}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Pane>
  )
}

/* ---------------- Evidências ---------------- */
type EvidenceFilter = 'all' | 'source' | 'fact'

const EVIDENCE_FILTERS = [
  { id: 'all' as const, label: 'Tudo' },
  { id: 'source' as const, label: 'Fontes' },
  { id: 'fact' as const, label: 'Fatos' },
]

/** "Fatos" = material derivado (análise/extração); "Fontes" = originais/incertos. */
function isDerivedFact(e: Evidence) {
  return e.originalOrDerived === 'derived' || e.type === 'derived'
}

const EVIDENCE_GLYPH: Record<EvidenceType, string> = {
  document: '▤',
  audio: '♪',
  photo: '▣',
  message: '✉',
  physical: '◈',
  digital: '▥',
  derived: '◇',
  other: '•',
}

function EvidenceTab({ inv, focusId }: { inv: InvestigationState; focusId: string | null }) {
  const owned = useMemo(
    () =>
      inv.evidenceOwned
        .map((id) => inv.evidence[id])
        .filter((e): e is Evidence => Boolean(e) && !e.catalogHidden),
    [inv.evidenceOwned, inv.evidence],
  )
  const hasFacts = owned.some(isDerivedFact)
  const hasSources = owned.some((e) => !isDerivedFact(e))
  // O filtro só tem função quando existem as duas classes; senão fica oculto e nunca bloqueia conteúdo.
  const filterUseful = hasFacts && hasSources
  const [filter, setFilter] = useState<EvidenceFilter>('all')
  const activeFilter: EvidenceFilter = filterUseful ? filter : 'all'
  const items = useMemo(
    () =>
      owned.filter((e) =>
        activeFilter === 'all' ? true : activeFilter === 'fact' ? isDerivedFact(e) : !isDerivedFact(e),
      ),
    [owned, activeFilter],
  )
  const [sel, setSel] = useState<string | null>(focusId)
  useEffect(() => {
    if (focusId) setSel(focusId)
  }, [focusId])
  // Foco vindo de fora abre a evidência mesmo que o filtro a esconda.
  const ev = sel ? owned.find((e) => e.id === sel) : undefined

  const summaries = useMemo(() => {
    const docs = new Map(seedDocuments.map((d) => [d.id, d]))
    return new Map(
      items.map((e) => {
        const doc = e.contentRef ? docs.get(e.contentRef) : undefined
        return [e.id, clampSummary(e.description ?? doc?.blocks[0]?.text)] as const
      }),
    )
  }, [items])

  const filterNode = filterUseful ? (
    <CasebookFilterBar
      compact
      ariaLabel="Filtrar evidências"
      options={EVIDENCE_FILTERS}
      value={filter}
      onChange={setFilter}
      testIdPrefix="evidence-filter"
    />
  ) : undefined

  if (ev) {
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
      <Pane title="Evidências" count={items.length} testId="nb-evidence">
        <Detail backLabel="Todas as evidências" onBack={() => setSel(null)} testId="nb-evidence-detail">
          <article className="nb-page" data-testid={`evidence-detail-${ev.id}`}>
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
        </Detail>
      </Pane>
    )
  }

  return (
    <Pane title="Evidências" count={items.length} filter={filterNode} testId="nb-evidence">
      {!owned.length ? (
        <p className="nb-muted nb-empty">Nenhuma evidência reunida ainda.</p>
      ) : !items.length ? (
        <p className="nb-muted nb-empty">Nenhuma evidência desta categoria foi registrada.</p>
      ) : (
        <ul className="nb-cards nb-cards--tiles" data-testid="evidence-grid">
          {items.map((e) => {
            const summary = summaries.get(e.id) ?? ''
            const protectedItem = e.exportable === false || e.deviceLocked
            const integrity = e.integrity ? integrityLabel(e.integrity) : null
            return (
              <li key={e.id}>
                <button
                  type="button"
                  className="nb-hyp nb-card nb-card--evidence"
                  data-state={e.originalOrDerived}
                  data-type={e.type}
                  data-testid={`nb-evidence-${e.id}`}
                  onClick={() => setSel(e.id)}
                >
                  <span className="nb-card__icon" aria-hidden>
                    {EVIDENCE_GLYPH[e.type]}
                  </span>
                  <span className="nb-card__body">
                    <span className="nb-card__kicker">
                      {evidenceTypeLabel[e.type]} · {evidenceSourceLabel(e)}
                    </span>
                    <span className="nb-name nb-card__title">{e.title}</span>
                    {summary ? <span className="nb-card__summary">{summary}</span> : null}
                    <span className="nb-card__states">
                      <span className="nb-badge nb-badge--flat" data-state-origin={e.originalOrDerived}>
                        {evidenceOriginLabel(e.originalOrDerived)}
                      </span>
                      {integrity ? (
                        <span className="nb-badge nb-badge--flat" data-integrity={e.integrity}>
                          {integrity}
                        </span>
                      ) : null}
                      {protectedItem ? <span className="nb-badge nb-badge--flat">No aparelho</span> : null}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Pane>
  )
}

/* ---------------- Locais ---------------- */
function LocationsTab({ inv }: { inv: InvestigationState }) {
  const places = Object.values(inv.locations).filter((l) => l.status !== 'unknown')
  const [sel, setSel] = useState<string | null>(null)
  const place = sel ? places.find((l) => l.id === sel) : undefined

  const evidenceFor = (placeId: string) =>
    inv.evidenceOwned
      .map((id) => inv.evidence[id])
      .filter((e): e is Evidence => Boolean(e) && !e.catalogHidden && e.relatedLocationIds.includes(placeId))
  const peopleFor = (l: Location) =>
    l.relatedPersonIds.map((id) => inv.people[id]?.name).filter(Boolean) as string[]

  if (place) {
    const people = peopleFor(place)
    const evidence = evidenceFor(place.id).map((e) => e.title)
    return (
      <Pane title="Locais" count={places.length} testId="nb-locations">
        <Detail backLabel="Todos os locais" onBack={() => setSel(null)} testId="nb-location-detail">
          <article className="nb-page" data-testid={`location-detail-${place.id}`}>
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
        </Detail>
      </Pane>
    )
  }

  return (
    <Pane title="Locais" count={places.length} testId="nb-locations">
      {!places.length ? (
        <p className="nb-muted nb-empty">Nenhum local conhecido.</p>
      ) : (
        <ul className="nb-cards nb-cards--tiles" data-testid="locations-grid">
          {places.map((l) => {
            const nPeople = peopleFor(l).length
            const nEvidence = evidenceFor(l.id).length
            const summary = clampSummary(l.description, 100)
            return (
              <li key={l.id}>
                <button
                  type="button"
                  className="nb-hyp nb-card nb-card--location"
                  data-state={l.status}
                  data-testid={`nb-location-${l.id}`}
                  onClick={() => setSel(l.id)}
                >
                  <span className="nb-card__body">
                    <span className="nb-card__kicker">Local</span>
                    <span className="nb-name nb-card__title">{l.name}</span>
                    {summary ? <span className="nb-card__summary">{summary}</span> : null}
                    <span className="nb-card__states">
                      <span className="nb-badge nb-badge--flat">{locationStatusLabel[l.status]}</span>
                      {nPeople ? (
                        <span className="nb-card__count">
                          {nPeople} {nPeople === 1 ? 'pessoa' : 'pessoas'}
                        </span>
                      ) : null}
                      {nEvidence ? (
                        <span className="nb-card__count">
                          {nEvidence} {nEvidence === 1 ? 'evidência' : 'evidências'}
                        </span>
                      ) : null}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Pane>
  )
}

/* ---------------- Timeline ---------------- */
function TimelineTab({ inv }: { inv: InvestigationState }) {
  const contacts = visibleMarianaContactChronology(inv)
  const showContacts =
    inv.flags.block05_chronology_action_unlocked || inv.flags.block05_chronology_done
  const showMemoryOnset =
    inv.flags.block07_memory_onset_unlocked || inv.flags.block07_memory_onset_done

  // Gates: só dispara com as flags de unlock — Timeline aberta cedo demais não marca progresso.
  useEffect(() => {
    if (inv.flags.block05_chronology_action_unlocked && !inv.flags.block05_chronology_done) {
      organizeMarianaContactChronology()
    }
  }, [inv.flags.block05_chronology_action_unlocked, inv.flags.block05_chronology_done])

  useEffect(() => {
    if (inv.flags.block07_memory_onset_unlocked && !inv.flags.block07_memory_onset_done) {
      organizeMemoryOnset()
    }
  }, [inv.flags.block07_memory_onset_unlocked, inv.flags.block07_memory_onset_done])

  return (
    <div className="nb-timeline-wrap" data-testid="timeline-panel">
      {showContacts ? (
        <section className="nb-timeline-section" data-testid="timeline-mariana-contacts">
          <h4>Contatos recentes de Mariana</h4>
          <p className="nb-muted">
            Sequência aproximada a partir do que já está no caderno — pessoas que ela procurou antes do
            desaparecimento.
          </p>
          {contacts.length ? (
            <ol className="nb-timeline">
              {contacts.map((c, i) => (
                <li key={c.personId} className="nb-timeline__item" data-precision="approximate">
                  <span className="nb-timeline__time">{i + 1}</span>
                  <span className="nb-timeline__dot" aria-hidden />
                  <div className="nb-timeline__body">
                    <strong>{c.label}</strong>
                    <small>aproximado · reunido na investigação</small>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="nb-muted">Ainda sem contatos suficientes registrados.</p>
          )}
        </section>
      ) : null}

      {showMemoryOnset ? (
        <section className="nb-timeline-section" data-testid="timeline-memory-onset">
          <h4>Início dos lapsos de memória</h4>
          <ol className="nb-timeline">
            <li className="nb-timeline__item" data-precision="interval">
              <span className="nb-timeline__time">meses antes</span>
              <span className="nb-timeline__dot" aria-hidden />
              <div className="nb-timeline__body">
                <strong>Primeiros registros anormais de memória</strong>
                <small>
                  intervalo · diário, notas e relatos — concentrados num período de plantões no hospital,
                  sem evento dramático óbvio nos registros
                </small>
              </div>
            </li>
          </ol>
        </section>
      ) : null}

      <section className="nb-timeline-section">
        <h4>Linha do tempo do caso</h4>
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
                  <span className="nb-timeline__src">
                    {e.sourceIds.map((id) => titleOf(inv, id)).join(' · ')}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
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
        <ul className="nb-cards nb-cards--tiles" data-testid="contradiction-list">
          {list.map((c) => {
            const def = contradictionDefs.find((d) => d.id === c.id)
            return (
              <li key={c.id} className="nb-hyp nb-card nb-card--static" data-testid={`contradiction-${c.id}`}>
                <span className="nb-badge nb-badge--stamp">Contradição registrada</span>
                <strong className="nb-name nb-card__title">{def?.summary ?? 'Registro sem descrição'}</strong>
                {def ? (
                  <small className="nb-card__meta">
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
  const [focusId] = useState<string | null>(focus?.id ?? null)
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
          {tab === 'evidence' ? <EvidenceTab inv={inv} focusId={focusId} /> : null}
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

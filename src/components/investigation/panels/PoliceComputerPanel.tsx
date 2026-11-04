import { useEffect, useState, type FormEvent } from 'react'
import { seedDocuments } from '../../../data/game/seedDocuments'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import { runPoliceSearch } from '../../../game/search/runSearch'
import { dispatchActions } from '../../../game/state/investigationStore'
import { applyPoliceSearchHit } from '../../../game/story/block02Handlers'
import { applyBlock03SearchHit } from '../../../game/story/block03Handlers'
import {
  applyBlock04SearchHit,
  runPhoneHiddenAppForensics,
} from '../../../game/story/block04Handlers'
import { useGameHub } from '../../../app/GameHubContext'
import {
  canInterviewAndre,
  canInterviewLivia,
  canInterviewLucas,
  canInterviewNico,
  canInterviewSamuel,
  isPersonVisibleInRegistry,
} from '../../../game/personRegistryGates'
import { personStatusLabel } from '../../../lib/labels'
import { GamePanel } from '../../ui/GamePanel'

type Section = 'busca' | 'caso' | 'pessoas' | 'veiculos' | 'arquivos'

const sections: { id: Section; label: string }[] = [
  { id: 'caso', label: 'Caso' },
  { id: 'pessoas', label: 'Pessoas' },
  { id: 'veiculos', label: 'Veículos' },
  { id: 'arquivos', label: 'Arquivos' },
  { id: 'busca', label: 'Busca' },
]

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(t)
  }, [])
  return now
}

interface SearchHit {
  title: string
  snippet: string
}

export function PoliceComputer({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  const { openLocationScene } = useGameHub()
  const [section, setSection] = useState<Section>('busca')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchHit[]>([])
  const [searched, setSearched] = useState(false)
  const [recent, setRecent] = useState<string[]>([])
  const clock = useClock()

  const search = (e?: FormEvent) => {
    e?.preventDefault()
    const q = query.trim()
    if (!q) return
    const { hits, newTerms } = runPoliceSearch(q, inv)
    setResults(hits.map(({ title, snippet }) => ({ title, snippet })))
    for (const h of hits) {
      if (h.evidenceId) {
        applyPoliceSearchHit(h.evidenceId)
        applyBlock03SearchHit(h.evidenceId)
        applyBlock04SearchHit(h.evidenceId)
      }
    }
    setSearched(true)
    setRecent((r) => [q, ...r.filter((x) => x !== q)].slice(0, 5))
    if (newTerms.length) {
      dispatchActions(newTerms.map((term) => ({ type: 'discoverSearchTerm', term })))
    }
  }

  const people = Object.values(inv.people).filter((p) => isPersonVisibleInRegistry(p.id, inv))
  const pending = inv.tasks.filter((t) => !t.completed)

  return (
    <GamePanel
      title="Sistema de consulta"
      kicker="Polícia Civil"
      variant="terminal"
      testId="hub-computer"
      onClose={onClose}
      backLabel="Sair"
      barExtra={
        <span className="pc-session">
          Insp. Augusto Nogueira · designação interina ·{' '}
          {clock.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      }
    >
      <div className="pc" data-testid="police-computer">
        <nav className="pc-nav" aria-label="Seções do sistema">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              className="pc-nav__item"
              data-active={section === s.id}
              onClick={() => setSection(s.id)}
            >
              {s.label}
            </button>
          ))}
          <p className="pc-nav__foot">Acesso restrito.<br />Consultas são registradas.</p>
        </nav>

        <div className="pc-main">
          {section === 'busca' ? (
            <>
              <h3 className="pc-h">Consulta geral</h3>
              <form className="pc-term" onSubmit={search}>
                <span className="pc-term__prompt" aria-hidden>
                  ›
                </span>
                <input
                  className="pc-term__input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="nome, apelido, placa ou termo do caso"
                  data-testid="police-search-input"
                  spellCheck={false}
                  autoComplete="off"
                />
                <button type="submit" className="pc-term__go" data-testid="police-search-submit">
                  Consultar
                </button>
              </form>
              {recent.length ? (
                <p className="pc-recent">
                  Recentes:{' '}
                  {recent.map((r) => (
                    <button key={r} type="button" onClick={() => setQuery(r)}>
                      {r}
                    </button>
                  ))}
                </p>
              ) : null}
              <div className="pc-results" aria-live="polite">
                {results.map((r) => (
                  <article key={r.title} className="pc-record" data-testid={`search-hit-${r.title}`}>
                    <h4>{r.title}</h4>
                    <p>{r.snippet}</p>
                  </article>
                ))}
                {searched && results.length === 0 ? (
                  <p className="pc-empty">Nenhum registro encontrado para os termos informados.</p>
                ) : null}
                {!searched ? (
                  <p className="pc-empty">
                    A consulta só retorna registros que combinem com os termos digitados. Combine
                    nomes e palavras conhecidas.
                  </p>
                ) : null}
              </div>
            </>
          ) : null}

          {section === 'caso' ? (
            <>
              <h3 className="pc-h">Caso 0001/2026</h3>
              <dl className="pc-dl">
                <dt>Natureza</dt>
                <dd>Desaparecimento de pessoa</dd>
                <dt>Vítima</dt>
                <dd>Mariana Silva</dd>
                <dt>Situação</dt>
                <dd>Em apuração</dd>
                <dt>Responsável</dt>
                <dd>Augusto Nogueira (designação interina)</dd>
                <dt>Elementos reunidos</dt>
                <dd>
                  {inv.evidenceOwned.length} evidência(s) · {Object.values(inv.documents).filter((d) => d.read).length} documento(s) lido(s)
                </dd>
              </dl>
              <h4 className="pc-sub">Pendências do responsável</h4>
              {pending.length ? (
                <ul className="pc-ul">
                  {pending.map((t) => (
                    <li key={t.id}>{t.label}</li>
                  ))}
                </ul>
              ) : (
                <p className="pc-empty">Sem pendências registradas.</p>
              )}
            </>
          ) : null}

          {section === 'pessoas' ? (
            <>
              <h3 className="pc-h">Pessoas vinculadas</h3>
              <table className="pc-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Ocupação</th>
                    <th>Situação no caso</th>
                  </tr>
                </thead>
                <tbody>
                  {people.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.occupation ?? '—'}</td>
                      <td>
                        <div className="pc-status">
                          <span>{personStatusLabel[p.status]}</span>
                          {p.id === 'lucas' &&
                          canInterviewLucas(inv) &&
                          !inv.flags.block02_lucas_interview_done ? (
                            <button
                              type="button"
                              className="pc-inline"
                              data-testid="lucas-interview-open"
                              onClick={() => {
                                onClose()
                                openLocationScene('lucas')
                              }}
                            >
                              Entrevistar
                            </button>
                          ) : null}
                          {p.id === 'nico' &&
                          canInterviewNico(inv) &&
                          !inv.flags.block03_nico_interview_done ? (
                            <button
                              type="button"
                              className="pc-inline"
                              data-testid="nico-interview-open"
                              onClick={() => {
                                onClose()
                                openLocationScene('nico')
                              }}
                            >
                              Entrevistar
                            </button>
                          ) : null}
                          {p.id === 'livia' &&
                          canInterviewLivia(inv) &&
                          !inv.flags.block03_livia_interview_done ? (
                            <button
                              type="button"
                              className="pc-inline"
                              data-testid="livia-interview-open"
                              onClick={() => {
                                onClose()
                                openLocationScene('livia')
                              }}
                            >
                              Entrevistar
                            </button>
                          ) : null}
                          {p.id === 'samuel' &&
                          canInterviewSamuel(inv) &&
                          !inv.flags.block04_samuel_interview_done ? (
                            <button
                              type="button"
                              className="pc-inline"
                              data-testid="samuel-interview-open"
                              onClick={() => {
                                onClose()
                                openLocationScene('samuel')
                              }}
                            >
                              Entrevistar
                            </button>
                          ) : null}
                          {p.id === 'andre' &&
                          canInterviewAndre(inv) &&
                          !inv.flags.block04_andre_interview_done ? (
                            <button
                              type="button"
                              className="pc-inline"
                              data-testid="andre-interview-open"
                              onClick={() => {
                                onClose()
                                openLocationScene('andre')
                              }}
                            >
                              Entrevistar
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : null}

          {section === 'veiculos' ? (
            <>
              <h3 className="pc-h">Veículos</h3>
              <p className="pc-empty">Nenhum veículo vinculado ao caso até o momento.</p>
            </>
          ) : null}

          {section === 'arquivos' ? (
            <>
              <h3 className="pc-h">Arquivos do caso</h3>
              <table className="pc-table">
                <thead>
                  <tr>
                    <th>Documento</th>
                    <th>Tipo</th>
                    <th>Leitura</th>
                  </tr>
                </thead>
                <tbody>
                  {seedDocuments.map((d) => (
                    <tr key={d.id}>
                      <td>{d.title}</td>
                      <td>{d.category}</td>
                      <td>{inv.documents[d.id]?.read ? 'Lido' : 'Não lido'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="pc-empty">Para ler e extrair trechos, abra a pasta do caso na mesa.</p>
              {inv.flags.block04_forensics_unlocked ? (
                <div className="pc-forensics" data-testid="phone-forensics-panel">
                  <h4 className="pc-sub">Perícia digital — aparelho apreendido</h4>
                  <p className="pc-empty">
                    Instrução recuperada: procurar o que a interface comum não lista. Varredura de
                    packages / diretórios privados / bases locais.
                  </p>
                  <button
                    type="button"
                    className="pc-inline"
                    data-testid="phone-forensics-run"
                    disabled={Boolean(inv.flags.block04_forensics_done)}
                    onClick={() => runPhoneHiddenAppForensics()}
                  >
                    {inv.flags.block04_forensics_done
                      ? 'Varredura concluída — app oculto listado'
                      : 'Executar varredura (launcher omitido)'}
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </GamePanel>
  )
}

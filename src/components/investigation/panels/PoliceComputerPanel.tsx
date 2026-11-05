import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { getDocument } from '../../../data/game/seedDocuments'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import { runPoliceSearch, type SearchHit } from '../../../game/search/runSearch'
import { dispatchActions, tryDiaryPin } from '../../../game/state/investigationStore'
import { isPersonVisibleInRegistry } from '../../../game/personRegistryGates'
import {
  comparePhoneFilesSequence,
  organizeMarianaContactChronology,
  onMaraltoLineWeighed,
  revisitEmergencyEntry,
} from '../../../game/story/block05Handlers'
import {
  finishJuliaCamilaOnsetCheck,
  organizeMemoryOnset,
  reviewMorsaDuration,
  unlockHenriqueDump,
} from '../../../game/story/block07Handlers'
import { DiaryReader } from '../../../apps/device/HiddenDiaryApp'
import { playSfx } from '../../../lib/sfx'
import { GamePanel } from '../../ui/GamePanel'
import { DocumentSheet } from '../DocumentSheet'

type Section = 'consultas' | 'ocorrencias' | 'autos' | 'documentos' | 'pericia' | 'caso'

const sections: { id: Section; label: string }[] = [
  { id: 'consultas', label: 'Consultas' },
  { id: 'ocorrencias', label: 'Ocorrências' },
  { id: 'autos', label: 'Processos / Autos' },
  { id: 'documentos', label: 'Documentos' },
  { id: 'pericia', label: 'Perícia' },
  { id: 'caso', label: 'Caso' },
]

type Scope = 'geral' | 'pessoas' | 'empresas' | 'veiculos' | 'enderecos'

const scopes: { id: Scope; label: string; placeholder: string }[] = [
  { id: 'geral', label: 'Geral', placeholder: 'nome, razão social, placa, endereço ou termo' },
  { id: 'pessoas', label: 'Pessoas', placeholder: 'nome completo ou apelido' },
  { id: 'empresas', label: 'Empresas', placeholder: 'razão social ou nome fantasia' },
  { id: 'veiculos', label: 'Veículos', placeholder: 'placa' },
  { id: 'enderecos', label: 'Endereços', placeholder: 'logradouro e número' },
]

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(t)
  }, [])
  return now
}

function scopeAllows(scope: Scope, documentId: string | undefined): boolean {
  if (scope === 'geral') return true
  if (scope === 'veiculos' || scope === 'enderecos') return false
  const doc = documentId ? getDocument(documentId) : undefined
  if (!doc) return false
  if (scope === 'pessoas') return doc.category.toLowerCase().includes('pessoas')
  return doc.category.toLowerCase().includes('empresas')
}

export function PoliceComputer({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  const [section, setSection] = useState<Section>('consultas')
  const [scope, setScope] = useState<Scope>('geral')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchHit[]>([])
  const [searched, setSearched] = useState(false)
  const [recent, setRecent] = useState<string[]>([])
  const [openDoc, setOpenDoc] = useState<string | null>(null)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState<string | null>(null)
  const [pkgOpen, setPkgOpen] = useState(false)
  const clock = useClock()

  const search = (e?: FormEvent) => {
    e?.preventDefault()
    const q = query.trim()
    if (!q) return
    const { hits, newTerms } = runPoliceSearch(q, inv)
    setResults(hits.filter((h) => scopeAllows(scope, h.documentId)))
    setSearched(true)
    playSfx('keyboard')
    setRecent((r) => [q, ...r.filter((x) => x !== q)].slice(0, 5))
    if (newTerms.length) {
      dispatchActions(newTerms.map((term) => ({ type: 'discoverSearchTerm', term })))
    }
  }

  const docsFor = (system: string) =>
    inv.documentsOwned
      .map((id) => getDocument(id))
      .filter((d): d is NonNullable<typeof d> => Boolean(d) && d!.system === system)

  const people = useMemo(
    () => Object.values(inv.people).filter((p) => isPersonVisibleInRegistry(p.id, inv)),
    [inv],
  )
  const pending = inv.tasks.filter((t) => !t.completed)
  const mariana = inv.phones.mariana
  const scopeDef = scopes.find((s) => s.id === scope) ?? scopes[0]

  const go = (s: Section) => {
    setSection(s)
    setOpenDoc(null)
  }

  const submitPin = (e: FormEvent) => {
    e.preventDefault()
    const res = tryDiaryPin(pin)
    if (res === 'wrong') {
      playSfx('error')
      setPinError('Código incorreto.')
    } else if (res === 'unlocked') {
      playSfx('unlock')
      setPinError(null)
      setPin('')
    } else {
      setPinError('Acesso forense não liberado.')
    }
  }

  const docList = (system: string, emptyText: string) => {
    const list = docsFor(system)
    return list.length ? (
      <table className="pc-table" data-testid={`pc-docs-${system}`}>
        <thead>
          <tr>
            <th>Documento</th>
            <th>Origem</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {list.map((d) => (
            <tr key={d.id}>
              <td>{d.title}</td>
              <td>{d.issuer ?? d.category}</td>
              <td>
                <button type="button" className="pc-inline" data-testid={`pc-open-${d.id}`} onClick={() => setOpenDoc(d.id)}>
                  Abrir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p className="pc-empty">{emptyText}</p>
    )
  }

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
              data-testid={`pc-nav-${s.id}`}
              onClick={() => go(s.id)}
            >
              {s.label}
            </button>
          ))}
          <p className="pc-nav__foot">
            Acesso restrito.
            <br />
            Consultas são registradas.
          </p>
        </nav>

        <div className="pc-main">
          {openDoc ? (
            <div className="pc-doc" data-testid="pc-doc-view">
              <button
                type="button"
                className="pc-back"
                data-testid="pc-doc-back"
                aria-label="Voltar"
                onClick={() => setOpenDoc(null)}
              >
                ‹
              </button>
              <DocumentSheet docId={openDoc} />
            </div>
          ) : null}

          {!openDoc && section === 'consultas' ? (
            <>
              <h3 className="pc-h">Consultas</h3>
              <div className="pc-scope" role="tablist" aria-label="Tipo de consulta">
                {scopes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={scope === s.id}
                    className="pc-scope__item"
                    data-active={scope === s.id}
                    onClick={() => setScope(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <form className="pc-term" onSubmit={search}>
                <span className="pc-term__prompt" aria-hidden>
                  ›
                </span>
                <input
                  className="pc-term__input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={scopeDef.placeholder}
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
                  <article key={r.ruleId + r.title} className="pc-record" data-testid={`search-hit-${r.title}`}>
                    <h4>{r.title}</h4>
                    <p>{r.snippet}</p>
                    {r.documentId ? (
                      <button
                        type="button"
                        className="pc-inline"
                        data-testid={`search-open-${r.documentId}`}
                        onClick={() => setOpenDoc(r.documentId!)}
                      >
                        Abrir registro
                      </button>
                    ) : null}
                  </article>
                ))}
                {searched && results.length === 0 ? (
                  <p className="pc-empty">Nenhum registro encontrado para os termos informados.</p>
                ) : null}
                {!searched ? (
                  <p className="pc-empty">
                    A consulta só retorna registros que combinem com os termos digitados.
                  </p>
                ) : null}
              </div>
              {docsFor('consultas').length ? (
                <>
                  <h4 className="pc-sub">Consultas já realizadas</h4>
                  {docList('consultas', '')}
                </>
              ) : null}
            </>
          ) : null}

          {!openDoc && section === 'ocorrencias' ? (
            <>
              <h3 className="pc-h">Ocorrências</h3>
              {docList('ocorrencias', 'Nenhuma ocorrência arquivada neste terminal.')}
            </>
          ) : null}

          {!openDoc && section === 'autos' ? (
            <>
              <h3 className="pc-h">Processos / Autos</h3>
              {docList('autos', 'Nenhum processo ou autos consultado até agora.')}
            </>
          ) : null}

          {!openDoc && section === 'documentos' ? (
            <>
              <h3 className="pc-h">Documentos</h3>
              {docList('documentos', 'Nenhum documento arquivado neste terminal.')}
            </>
          ) : null}

          {!openDoc && section === 'pericia' ? (
            <>
              <h3 className="pc-h">Perícia</h3>
              {docList('pericia', 'Nenhum laudo recebido.')}
              {inv.flags.block04_forensics_access ? (
                <div className="pc-forensics" data-testid="forensic-access-panel">
                  <h4 className="pc-sub">Acesso forense — aparelho de Mariana</h4>
                  <p className="pc-empty">
                    Pacote <code>local.priv.journal</code> · base local protegida por código numérico de 6
                    dígitos.
                  </p>
                  {mariana.diaryUnlocked ? (
                    <DiaryReader />
                  ) : pkgOpen ? (
                    <form className="pc-pin" onSubmit={submitPin} data-testid="forensic-pin-screen">
                      <label htmlFor="forensic-pin" className="pc-pin__label">
                        Código de acesso
                      </label>
                      <input
                        id="forensic-pin"
                        className="pc-term__input pc-pin__input"
                        value={pin}
                        onChange={(e) => {
                          setPin(e.target.value.replace(/\D/g, '').slice(0, 6))
                          setPinError(null)
                        }}
                        inputMode="numeric"
                        autoComplete="off"
                        maxLength={6}
                        placeholder="••••••"
                        data-testid="forensic-pin-input"
                      />
                      <button type="submit" className="pc-term__go" data-testid="forensic-pin-submit">
                        Acessar
                      </button>
                      {pinError ? (
                        <p className="pc-pin__error" role="alert" data-testid="forensic-pin-error">
                          {pinError}
                        </p>
                      ) : null}
                    </form>
                  ) : (
                    <button
                      type="button"
                      className="pc-inline"
                      data-testid="forensic-open-package"
                      onClick={() => setPkgOpen(true)}
                    >
                      Abrir pacote
                    </button>
                  )}
                </div>
              ) : null}
            </>
          ) : null}

          {!openDoc && section === 'caso' ? (
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
                  {inv.evidenceOwned.length} evidência(s) ·{' '}
                  {Object.values(inv.documents).filter((d) => d.read).length} documento(s) lido(s)
                </dd>
              </dl>
              <h4 className="pc-sub">Pessoas citadas nos autos</h4>
              <table className="pc-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Ocupação</th>
                  </tr>
                </thead>
                <tbody>
                  {people.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.occupation ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              {inv.flags.block05_maralto_review_unlocked && !inv.flags.block05_maralto_weighed ? (
                <div className="pc-caso-actions">
                  <h4 className="pc-sub">Ação investigativa</h4>
                  <button
                    type="button"
                    className="pc-inline"
                    data-testid="b05-weigh-maralto"
                    onClick={() => onMaraltoLineWeighed()}
                  >
                    Reavaliar linha Maralto / protestos
                  </button>
                </div>
              ) : null}
              {inv.flags.block05_chronology_action_unlocked && !inv.flags.block05_chronology_done ? (
                <div className="pc-caso-actions">
                  <h4 className="pc-sub">Ação investigativa</h4>
                  <button
                    type="button"
                    className="pc-inline"
                    data-testid="b05-organize-chronology"
                    onClick={() => {
                      organizeMarianaContactChronology()
                      setOpenDoc('doc-mariana-contact-chronology')
                    }}
                  >
                    Organizar cronologia dos contatos recentes de Mariana
                  </button>
                </div>
              ) : null}
              {inv.flags.block05_compare_unlocked && !inv.flags.block05_compare_done ? (
                <div className="pc-caso-actions">
                  <h4 className="pc-sub">Ação investigativa</h4>
                  <button
                    type="button"
                    className="pc-inline"
                    data-testid="b05-compare-files"
                    onClick={() => {
                      comparePhoneFilesSequence()
                      setOpenDoc('doc-phone-file-dependencies')
                    }}
                  >
                    Comparar cronologia com arquivos do celular
                  </button>
                </div>
              ) : null}
              {inv.flags.block05_emergency_revisit_unlocked && !inv.flags.block05_emergency_revisited ? (
                <div className="pc-caso-actions">
                  <h4 className="pc-sub">Ação investigativa</h4>
                  <button
                    type="button"
                    className="pc-inline"
                    data-testid="b05-revisit-emergency"
                    onClick={() => {
                      revisitEmergencyEntry()
                      setOpenDoc('doc-emergency-reassessment')
                    }}
                  >
                    Reabrir chamada de emergência e entrada no apartamento
                  </button>
                </div>
              ) : null}
              {inv.flags.block05_chronology_done ? (
                <div className="pc-caso-actions" data-testid="b05-chronology-notes">
                  <h4 className="pc-sub">Notas montadas</h4>
                  <ul className="pc-ul">
                    <li>
                      <button
                        type="button"
                        className="pc-inline"
                        onClick={() => setOpenDoc('doc-mariana-contact-chronology')}
                      >
                        Cronologia dos contatos recentes
                      </button>
                    </li>
                    {inv.flags.block05_compare_done ? (
                      <li>
                        <button
                          type="button"
                          className="pc-inline"
                          onClick={() => setOpenDoc('doc-phone-file-dependencies')}
                        >
                          Dependências dos arquivos do celular
                        </button>
                      </li>
                    ) : null}
                    {inv.flags.block05_emergency_revisited ? (
                      <li>
                        <button
                          type="button"
                          className="pc-inline"
                          onClick={() => setOpenDoc('doc-emergency-reassessment')}
                        >
                          Releitura da chamada / entrada / apreensão
                        </button>
                      </li>
                    ) : null}
                  </ul>
                  {inv.flags.block05_emergency_revisited ? (
                    <>
                      <h4 className="pc-sub">Peças iniciais reabertas</h4>
                      <ul className="pc-ul">
                        {(
                          [
                            ['doc-central-chamada', 'Registro da central'],
                            ['doc-entrada-apartamento', 'Entrada no apartamento'],
                            ['doc-apreensao-celular', 'Termo de apreensão'],
                          ] as const
                        ).map(([id, label]) => (
                          <li key={id}>
                            <button type="button" className="pc-inline" onClick={() => setOpenDoc(id)}>
                              {label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              ) : null}
              {inv.flags.block07_morsa_review_unlocked && !inv.flags.block07_morsa_duration_done ? (
                <div className="pc-caso-actions">
                  <h4 className="pc-sub">Ação investigativa</h4>
                  <button
                    type="button"
                    className="pc-inline"
                    data-testid="b07-review-morsa-duration"
                    onClick={() => {
                      reviewMorsaDuration()
                      setOpenDoc('doc-morsa-duration-note')
                    }}
                  >
                    Reavaliar duração da atividade de Morsa (arquivos dos protestos)
                  </button>
                </div>
              ) : null}
              {inv.flags.block07_memory_onset_unlocked && !inv.flags.block07_memory_onset_done ? (
                <div className="pc-caso-actions">
                  <h4 className="pc-sub">Ação investigativa</h4>
                  <button
                    type="button"
                    className="pc-inline"
                    data-testid="b07-memory-onset"
                    onClick={() => {
                      organizeMemoryOnset()
                      setOpenDoc('doc-memory-onset-chronology')
                    }}
                  >
                    Organizar quando começaram os primeiros registros anormais de memória
                  </button>
                </div>
              ) : null}
              {inv.flags.block07_julia_camila_check_unlocked &&
              !inv.flags.block07_julia_camila_checked ? (
                <div className="pc-caso-actions">
                  <h4 className="pc-sub">Ação investigativa</h4>
                  <button
                    type="button"
                    className="pc-inline"
                    data-testid="b07-julia-camila-onset"
                    onClick={() => finishJuliaCamilaOnsetCheck()}
                  >
                    Conferir com Júlia/Camila o período dos plantões
                  </button>
                </div>
              ) : null}
              {inv.flags.block07_henrique_dump_unlocked && !inv.flags.block07_cassini_available ? (
                <div className="pc-caso-actions">
                  <h4 className="pc-sub">Ação investigativa</h4>
                  <button
                    type="button"
                    className="pc-inline"
                    data-testid="b07-henrique-dump"
                    onClick={() => {
                      unlockHenriqueDump()
                      setOpenDoc('doc-henrique-pcap-note')
                    }}
                  >
                    Localizar material digital antigo de Henrique
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

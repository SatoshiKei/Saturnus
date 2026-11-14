import { act, cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InvestigationNotebook, clampSummary } from '../../src/components/investigation/panels/CasebookPanel'
import { seedEvidenceCatalog } from '../../src/data/game/seedEvidence'
import { seedPeople } from '../../src/data/game/seedPeople'
import { isPersonVisibleInRegistry } from '../../src/game/personRegistryGates'
import {
  dispatchActions,
  getInvestigationState,
  resetGame,
} from '../../src/game/state/investigationStore'
import { CHARACTER_SPRITE_URLS } from '../../src/lib/characterSprites'
import { MISSING_PERSON_PORTRAIT, personPortraitSrc } from '../../src/lib/personPortraits'

const visibleCatalog = seedEvidenceCatalog.filter((e) => !e.catalogHidden)

function give(ids: string[]) {
  act(() => dispatchActions(ids.map((id) => ({ type: 'addEvidence' as const, id }))))
}

function discoverAllPeople() {
  act(() =>
    dispatchActions(
      seedPeople.map((p) => ({ type: 'discoverPerson' as const, id: p.id, status: 'identified' as const })),
    ),
  )
}

afterEach(() => cleanup())

async function openTab(name: string) {
  const user = userEvent.setup()
  render(<InvestigationNotebook onClose={() => {}} />)
  const nav = screen.getByRole('navigation', { name: 'Seções do caderno' })
  await user.click(within(nav).getByRole('button', { name }))
  return user
}

describe('caderno: cartões de evidências', () => {
  beforeEach(() => resetGame())

  it('renderiza um cartão por evidência, sem o texto completo', async () => {
    const long = visibleCatalog.find((e) => (e.description?.length ?? 0) > 220)
    expect(long, 'precisa existir evidência com descrição longa no catálogo').toBeTruthy()
    give([long!.id])
    await openTab('Evidências')
    const grid = screen.getByTestId('evidence-grid')
    const card = within(grid).getByTestId(`nb-evidence-${long!.id}`)
    expect(card).toHaveTextContent(long!.title)
    expect(card.textContent).not.toContain(long!.description!)
    expect(card.textContent!.length).toBeLessThan(long!.description!.length + long!.title.length)
    // categoria / origem + estado + ícone
    expect(card.querySelector('.nb-card__kicker')).toBeTruthy()
    expect(card.querySelector('.nb-badge')).toBeTruthy()
    expect(card.querySelector('.nb-card__icon')).toBeTruthy()
  })

  it('estado inicial já mostra os cartões das evidências pré-reunidas', async () => {
    const owned = getInvestigationState().evidenceOwned.filter((id) => visibleCatalog.some((e) => e.id === id))
    await openTab('Evidências')
    expect(within(screen.getByTestId('evidence-grid')).getAllByRole('button')).toHaveLength(owned.length)
  })

  it('filtros Tudo/Fontes/Fatos nunca bloqueiam conteúdo', async () => {
    // Estado inicial: só fontes originais → filtro escondido (sem função) e cartões visíveis.
    const startCount = getInvestigationState().evidenceOwned.filter((id) =>
      visibleCatalog.some((e) => e.id === id),
    ).length
    const user = await openTab('Evidências')
    expect(screen.queryByRole('tablist', { name: 'Filtrar evidências' })).not.toBeInTheDocument()
    expect(screen.getByTestId('evidence-grid').querySelectorAll('li')).toHaveLength(startCount)

    // Com uma derivada: chips compactos; cada filtro mostra cartões e "Tudo" mostra todos.
    const derived = visibleCatalog.find((e) => e.originalOrDerived === 'derived' || e.type === 'derived')!
    give([derived.id])
    const bar = await screen.findByRole('tablist', { name: 'Filtrar evidências' })
    expect(bar).toHaveClass('cb-filter-bar--compact')
    expect(screen.getByTestId('evidence-grid').querySelectorAll('li')).toHaveLength(startCount + 1)
    await user.click(screen.getByTestId('evidence-filter-fact'))
    expect(screen.getByTestId('evidence-grid').querySelectorAll('li')).toHaveLength(1)
    expect(screen.getByTestId(`nb-evidence-${derived.id}`)).toBeInTheDocument()
    await user.click(screen.getByTestId('evidence-filter-source'))
    expect(screen.getByTestId('evidence-grid').querySelectorAll('li')).toHaveLength(startCount)
    expect(screen.queryByTestId(`nb-evidence-${derived.id}`)).not.toBeInTheDocument()
    await user.click(screen.getByTestId('evidence-filter-all'))
    expect(screen.getByTestId('evidence-grid').querySelectorAll('li')).toHaveLength(startCount + 1)
  })

  it('clicar no cartão abre o detalhe completo e voltar restaura a grade', async () => {
    const withText = visibleCatalog.find((e) => (e.description?.length ?? 0) > 120)!
    give([withText.id])
    const user = await openTab('Evidências')
    await user.click(screen.getByTestId(`nb-evidence-${withText.id}`))
    const detail = screen.getByTestId('nb-evidence-detail')
    expect(within(detail).getByRole('heading', { name: withText.title })).toBeInTheDocument()
    expect(detail.textContent).toContain(withText.description!)
    expect(screen.queryByTestId('evidence-grid')).not.toBeInTheDocument()
    await user.click(screen.getByTestId('nb-detail-back'))
    expect(screen.getByTestId('evidence-grid')).toBeInTheDocument()
    expect(screen.queryByTestId('nb-evidence-detail')).not.toBeInTheDocument()
  })

  it('lista grande continua navegável: todos os cartões, rolagem própria e detalhe do último', async () => {
    give(visibleCatalog.map((e) => e.id))
    const owned = getInvestigationState().evidenceOwned.filter((id) => visibleCatalog.some((e) => e.id === id))
    expect(owned.length).toBeGreaterThan(40)
    const user = await openTab('Evidências')
    const grid = screen.getByTestId('evidence-grid')
    const cards = within(grid).getAllByRole('button')
    expect(cards).toHaveLength(owned.length)
    cards.forEach((c) => expect(c).toHaveAttribute('data-testid', expect.stringMatching(/^nb-evidence-/)))
    // Área rolável independente + contagem no cabeçalho
    expect(screen.getByTestId('nb-evidence-scroll')).toHaveClass('nb-scroll')
    expect(screen.getByTestId('nb-evidence').querySelector('.nb-toolbar__count')).toHaveTextContent(
      String(owned.length),
    )
    // Último cartão é alcançável e abre detalhe; voltar mantém a lista inteira
    await user.click(cards[cards.length - 1])
    expect(screen.getByTestId('nb-evidence-detail')).toBeInTheDocument()
    await user.click(screen.getByTestId('nb-detail-back'))
    expect(within(screen.getByTestId('evidence-grid')).getAllByRole('button')).toHaveLength(owned.length)
    // Filtros nunca zeram a lista
    for (const id of ['fact', 'source', 'all']) {
      await user.click(screen.getByTestId(`evidence-filter-${id}`))
      expect(within(screen.getByTestId('evidence-grid')).getAllByRole('button').length).toBeGreaterThan(0)
    }
  })

  it('clampSummary encurta sem cortar palavras e preserva textos curtos', () => {
    expect(clampSummary('curto')).toBe('curto')
    expect(clampSummary(undefined)).toBe('')
    const out = clampSummary('palavra '.repeat(40), 50)
    expect(out.length).toBeLessThanOrEqual(51)
    expect(out.endsWith('…')).toBe(true)
  })
})

describe('caderno: cartões de pessoas', () => {
  beforeEach(() => resetGame())

  it('renderiza cartões com nome, situação e abre a ficha completa', async () => {
    discoverAllPeople()
    const inv = getInvestigationState()
    const visible = Object.values(inv.people).filter((p) => isPersonVisibleInRegistry(p.id, inv))
    expect(visible.length).toBeGreaterThan(3)
    const user = await openTab('Pessoas')
    const grid = screen.getByTestId('people-grid')
    expect(within(grid).getAllByRole('button')).toHaveLength(visible.length)
    for (const p of visible) {
      const card = within(grid).getByTestId(`person-${p.id}`)
      expect(card).toHaveTextContent(p.name)
      expect(screen.getByTestId(`person-status-${p.id}`)).toHaveAttribute('data-person-status', p.status)
    }
    const first = visible[0]
    await user.click(screen.getByTestId(`person-${first.id}`))
    const ficha = screen.getByTestId(`person-detail-${first.id}`)
    expect(within(ficha).getByRole('heading', { name: first.name })).toBeInTheDocument()
    expect(screen.queryByTestId('people-grid')).not.toBeInTheDocument()
    await user.click(screen.getByTestId('nb-detail-back'))
    expect(screen.getByTestId('people-grid')).toBeInTheDocument()
  })

  it('usa o sprite existente como foto e um placeholder neutro quando falta', async () => {
    discoverAllPeople()
    const inv = getInvestigationState()
    const visible = Object.values(inv.people).filter((p) => isPersonVisibleInRegistry(p.id, inv))
    await openTab('Pessoas')
    let photos = 0
    let fallbacks = 0
    for (const p of visible) {
      const portrait = screen.getByTestId(`portrait-${p.id}`)
      if (personPortraitSrc(p.id)) {
        photos++
        expect(portrait.querySelector('img')).toHaveAttribute('src', personPortraitSrc(p.id))
        expect(portrait).not.toHaveAttribute('data-fallback')
      } else {
        fallbacks++
        expect(portrait.querySelector('img')).toBeNull()
        expect(portrait).toHaveAttribute('data-fallback', 'true')
        expect(portrait.querySelector('.nb-portrait__ph')).toBeTruthy()
      }
    }
    expect(photos).toBeGreaterThan(0)
    expect(fallbacks).toBeGreaterThan(0)
  })

  it('a ficha mostra a mesma foto do cartão', async () => {
    discoverAllPeople()
    const user = await openTab('Pessoas')
    await user.click(screen.getByTestId('person-mariana'))
    const ficha = screen.getByTestId('person-detail-mariana')
    expect(within(ficha).getByTestId('portrait-mariana').querySelector('img')).toHaveAttribute(
      'src',
      CHARACTER_SPRITE_URLS.mariana,
    )
  })

  it('MISSING_PERSON_PORTRAIT lista exatamente os ids de seedPeople sem sprite', () => {
    const computed = seedPeople.map((p) => p.id).filter((id) => !CHARACTER_SPRITE_URLS[id])
    expect([...MISSING_PERSON_PORTRAIT].sort()).toEqual(computed.sort())
  })
})

describe('caderno: locais e timeline', () => {
  beforeEach(() => resetGame())

  it('locais usam grade de cartões com detalhe', async () => {
    const user = await openTab('Locais')
    const grid = screen.getByTestId('locations-grid')
    const cards = within(grid).getAllByRole('button')
    expect(cards.length).toBeGreaterThan(0)
    await user.click(cards[0])
    expect(screen.getByTestId('nb-location-detail')).toBeInTheDocument()
    await user.click(screen.getByTestId('nb-detail-back'))
    expect(screen.getByTestId('locations-grid')).toBeInTheDocument()
  })

  it('timeline continua sendo uma linha do tempo (não cartões)', async () => {
    await openTab('Timeline')
    const panel = screen.getByTestId('timeline-panel')
    expect(within(panel).getByTestId('timeline-list').tagName).toBe('OL')
    expect(panel.querySelector('.nb-cards')).toBeNull()
  })
})

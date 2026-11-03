import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { GameHubProvider } from '../../src/app/GameHubContext'
import { CaseNotepad } from '../../src/components/investigation/CaseNotepad'
import { InvestigationNotebook } from '../../src/components/investigation/panels/CasebookPanel'
import { LocationsMap } from '../../src/components/investigation/panels/LocationsPanel'
import { PoliceLandline } from '../../src/components/investigation/panels/PoliceLandlinePanel'
import { resetGame } from '../../src/game/state/investigationStore'
import {
  hypothesisStateLabel,
  locationStatusLabel,
  personStatusLabel,
} from '../../src/lib/labels'

const internalIds = /\b(identified|mentioned|contactable|visitAvailable|located|interviewed)\b/

describe('interface diegética', () => {
  beforeEach(() => resetGame())

  it('rótulos em português nunca expõem estados internos', () => {
    const all = [
      ...Object.values(personStatusLabel),
      ...Object.values(locationStatusLabel),
      ...Object.values(hypothesisStateLabel),
    ]
    for (const label of all) expect(label).not.toMatch(internalIds)
  })

  it('mapa não mostra locais desconhecidos e permite escolher um conhecido', async () => {
    const user = userEvent.setup()
    render(
      <GameHubProvider>
        <LocationsMap onClose={() => {}} />
      </GameHubProvider>,
    )
    expect(screen.queryByText('Boate Vértice')).not.toBeInTheDocument()
    expect(screen.getByTestId('map-pin-delegacia')).toBeInTheDocument()
    await user.click(screen.getByTestId('map-pin-delegacia'))
    expect(screen.getByText('Você está aqui.')).toBeInTheDocument()
  })

  it('caderno usa rótulos em português nas fichas de pessoas', () => {
    render(<InvestigationNotebook onClose={() => {}} />)
    const book = screen.getByTestId('casebook')
    expect(within(book).getByRole('button', { name: 'Contradições' })).toBeInTheDocument()
    expect(book.textContent ?? '').not.toMatch(internalIds)
  })

  it('telefone fixo tem interface própria (teclado e ramais), não a de um smartphone', () => {
    render(<PoliceLandline onClose={() => {}} />)
    const panel = screen.getByTestId('landline-panel')
    expect(within(panel).getByText('Ramais')).toBeInTheDocument()
    expect(within(panel).getByRole('button', { name: 'Ligar' })).toBeDisabled()
    expect(screen.queryByTestId('phone-home')).not.toBeInTheDocument()
  })

  it('pendências ficam em um bloco de notas fechado por padrão', async () => {
    const user = userEvent.setup()
    render(<CaseNotepad />)
    const pad = screen.getByTestId('objectives-strip')
    expect(pad).toHaveAttribute('data-open', 'false')
    expect(pad).toHaveTextContent('CASO MARIANA SILVA')
    await user.click(screen.getByTestId('notepad-toggle'))
    expect(pad).toHaveAttribute('data-open', 'true')
  })
})

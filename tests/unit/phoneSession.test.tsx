import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PhoneSessionProvider, usePhoneSession } from '../../src/app/PhoneSessionContext'

function TogglePhone() {
  const { phoneOpen, openPhone, closePhone } = usePhoneSession()
  return (
    <div>
      <span data-testid="open-state">{phoneOpen ? 'open' : 'closed'}</span>
      <button type="button" onClick={openPhone}>
        Abrir
      </button>
      <button type="button" onClick={closePhone}>
        Fechar
      </button>
    </div>
  )
}

describe('PhoneSession', () => {
  it('opens and closes phone', async () => {
    const user = userEvent.setup()
    render(
      <PhoneSessionProvider>
        <TogglePhone />
      </PhoneSessionProvider>,
    )
    expect(screen.getByTestId('open-state')).toHaveTextContent('closed')
    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    expect(screen.getByTestId('open-state')).toHaveTextContent('open')
    await user.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(screen.getByTestId('open-state')).toHaveTextContent('closed')
  })
})

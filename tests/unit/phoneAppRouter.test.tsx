import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PhoneSessionProvider } from '../../src/app/PhoneSessionContext'
import { PhoneAppRouter } from '../../src/phone/PhoneAppRouter'

function renderPhone() {
  return render(
    <PhoneSessionProvider>
      <div style={{ width: 360, height: 720 }}>
        <PhoneAppRouter />
      </div>
    </PhoneSessionProvider>,
  )
}

describe('PhoneAppRouter', () => {
  it('shows home then opens WhatsApp and Mariana chat', async () => {
    const user = userEvent.setup()
    renderPhone()
    expect(screen.getByTestId('phone-home')).toBeInTheDocument()
    await user.click(screen.getByTestId('app-whatsapp'))
    expect(screen.getByTestId('whatsapp-home')).toBeInTheDocument()
    await user.click(screen.getByTestId('chat-row-mariana'))
    expect(screen.getByTestId('whatsapp-chat-view')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Voltar à lista' }))
    expect(screen.getByTestId('whatsapp-home')).toBeInTheDocument()
  })
})

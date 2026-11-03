import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { GameHubProvider } from '../../src/app/GameHubContext'
import { PhoneSessionProvider } from '../../src/app/PhoneSessionContext'
import { resetGame } from '../../src/game/state/investigationStore'
import { PhoneAppRouter } from '../../src/phone/PhoneAppRouter'

function renderPhone() {
  return render(
    <GameHubProvider>
      <PhoneSessionProvider>
        <div style={{ width: 360, height: 720 }}>
          <PhoneAppRouter />
        </div>
      </PhoneSessionProvider>
    </GameHubProvider>,
  )
}

describe('PhoneAppRouter', () => {
  beforeEach(() => resetGame())

  it('shows home then opens WhatsApp and Julia chat', async () => {
    const user = userEvent.setup()
    renderPhone()
    expect(screen.getByTestId('phone-home')).toBeInTheDocument()
    await user.click(screen.getByTestId('app-whatsapp'))
    expect(screen.getByTestId('whatsapp-home')).toBeInTheDocument()
    await user.click(screen.getByTestId('chat-row-julia'))
    expect(screen.getByTestId('whatsapp-chat-view')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Voltar à lista' }))
    expect(screen.getByTestId('whatsapp-home')).toBeInTheDocument()
  })
})

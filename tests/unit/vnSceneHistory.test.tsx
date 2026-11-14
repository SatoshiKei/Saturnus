import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { VisualNovelDialog, VNSceneShell } from '../../src/components/story/VisualNovelDialog'

const BEATS = Array.from({ length: 30 }, (_, i) => ({
  speaker: i % 2 === 0 ? 'Augusto' : 'Testemunha',
  text: `Linha de teste número ${i + 1}.`,
}))

function PlaythroughHarness() {
  const [index, setIndex] = useState(0)
  const beat = BEATS[index]!
  return (
    <VNSceneShell
      title="Teste"
      onClose={() => {}}
      testId="vn-history-test"
      backgroundStyle={{ background: '#111' }}
    >
      <VisualNovelDialog
        speaker={beat.speaker}
        text={beat.text}
        onContinue={() => setIndex((i) => Math.min(BEATS.length - 1, i + 1))}
      />
    </VNSceneShell>
  )
}

afterEach(() => cleanup())

describe('VN scene scroll-up history', () => {
  it('keeps all 30 seen lines in the scroll-up panel', async () => {
    render(<PlaythroughHarness />)
    const user = userEvent.setup()
    const scene = screen.getByTestId('vn-history-test')
    for (let i = 0; i < 29; i++) {
      await user.click(within(scene).getByTestId('vn-advance-zone'))
    }
    await user.keyboard('{PageUp}')
    const backlog = within(scene).getByTestId('vn-backlog')
    const blocks = backlog.querySelectorAll('.vn-nvl__block')
    expect(blocks.length).toBe(30)
    for (let i = 0; i < 30; i++) {
      expect(blocks[i]!.textContent).toContain(`Linha de teste número ${i + 1}.`)
    }
  })

  it('does not advance dialogue when opening history', async () => {
    render(<PlaythroughHarness />)
    const user = userEvent.setup()
    const scene = screen.getByTestId('vn-history-test')
    expect(within(scene).getByTestId('vn-dialog')).toHaveAttribute('data-mode', 'adv')
    await user.keyboard('{ArrowUp}')
    expect(within(scene).getByTestId('vn-dialog')).toHaveAttribute('data-mode', 'backlog')
    expect(within(scene).getByText(BEATS[0]!.text)).toBeInTheDocument()
  })

  it('records topic choice labels in scene buffer', async () => {
    function ChoiceFlow() {
      const [picked, setPicked] = useState(false)
      return picked ? (
        <VisualNovelDialog speaker="Testemunha" text="Resposta curta." onContinue={() => {}} />
      ) : (
        <VisualNovelDialog
          text=""
          choiceVariant="topics"
          choices={[{ id: 'a', label: 'Perguntar sobre o alibi' }]}
          onChoice={() => setPicked(true)}
        />
      )
    }
    render(
      <VNSceneShell
        title="Teste"
        onClose={() => {}}
        testId="vn-choice-test"
        backgroundStyle={{ background: '#111' }}
      >
        <ChoiceFlow />
      </VNSceneShell>,
    )
    const user = userEvent.setup()
    const scene = screen.getByTestId('vn-choice-test')
    await user.click(
      within(scene).getByRole('button', { name: 'Perguntar sobre o alibi' }),
    )
    await user.keyboard('{PageUp}')
    expect(within(scene).getByText('▸ Perguntar sobre o alibi')).toBeInTheDocument()
    expect(within(scene).getByText('Resposta curta.')).toBeInTheDocument()
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ForensicWorkbench } from '../../src/forensic/ForensicWorkbench'
import { puzzle01CassiniSession, puzzle01Ideal } from '../../src/forensic/puzzles/puzzle01Cassini'
import { INSPECTOR_TABS } from '../../src/forensic/forensicTypes'

class FakeAudioContext {
  state = 'running'
  currentTime = 0
  destination = {}
  sampleRate = 44100
  createGain() {
    return {
      gain: { value: 1 },
      connect() {
        return this
      },
      disconnect() {},
    }
  }
  createStereoPanner() {
    return {
      pan: { value: 0 },
      connect() {
        return this
      },
      disconnect() {},
    }
  }
  createBiquadFilter() {
    return {
      type: 'lowpass',
      frequency: { value: 1000 },
      Q: { value: 1 },
      gain: { value: 0 },
      connect() {
        return this
      },
      disconnect() {},
    }
  }
  createOscillator() {
    return {
      type: 'sine',
      frequency: { value: 440 },
      connect() {
        return this
      },
      start() {},
      stop() {},
    }
  }
  createBuffer(_c: number, frames: number, _sr: number) {
    return {
      getChannelData: () => new Float32Array(frames),
      duration: frames / 44100,
      length: frames,
      numberOfChannels: 1,
      sampleRate: 44100,
    }
  }
  createBufferSource() {
    return {
      buffer: null,
      playbackRate: { value: 1 },
      connect() {
        return this
      },
      start() {},
      stop() {},
    }
  }
  resume() {
    return Promise.resolve()
  }
  close() {
    return Promise.resolve()
  }
  decodeAudioData(buf: ArrayBuffer) {
    return Promise.resolve({
      duration: 1,
      getChannelData: () => new Float32Array(8),
      length: 8,
      numberOfChannels: 1,
      sampleRate: 44100,
    })
  }
}

function stubAudio() {
  vi.stubGlobal('AudioContext', FakeAudioContext)
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
    })),
  )
}

afterEach(() => cleanup())

describe('ForensicWorkbench UI', () => {
  it('keeps all inspector tabs available for WAV puzzle 1', async () => {
    stubAudio()
    render(<ForensicWorkbench session={puzzle01CassiniSession} onClose={() => {}} />)
    for (const tab of INSPECTOR_TABS) {
      expect(screen.getByRole('tab', { name: tab.label })).toBeInTheDocument()
    }
    await userEvent.click(screen.getByRole('tab', { name: 'Structure' }))
    expect(screen.getByText(/não possui estrutura editável|No editable structure/i)).toBeInTheDocument()
  })

  it('shows one master source, Recovered Speech empty, and no answer input', async () => {
    stubAudio()
    const { container } = render(
      <ForensicWorkbench session={puzzle01CassiniSession} onClose={() => {}} />,
    )
    expect(screen.getAllByRole('button', { name: /EMG_0803\.wav/ })).toHaveLength(1)
    expect(screen.getByText('MASTER')).toBeInTheDocument()
    expect(container.textContent).not.toMatch(/CORRUPTED_BASE|CLEAN_VOICE|p01_mariana|p01_corrupted/)
    expect(container.textContent).not.toMatch(/Augusto|Rui|Elisa|você não lembra/)
    await userEvent.click(screen.getByRole('tab', { name: 'Notes' }))
    expect(screen.getByTestId('recovered-speech-empty')).toHaveTextContent(
      /No intelligible speech recovered/i,
    )
    expect(screen.queryByPlaceholderText(/Registre trechos/)).toBeNull()
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('does not unlock from ideal notch settings alone without listening', async () => {
    stubAudio()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const onSeg = vi.fn()
    render(
      <ForensicWorkbench
        session={puzzle01CassiniSession}
        onClose={() => {}}
        onSegmentRecovered={onSeg}
      />,
    )
    const center = screen.getByText('Center').closest('.fw-param')?.querySelector('input')
    const width = screen.getByText('Width').closest('.fw-param')?.querySelector('input')
    const reduction = screen.getAllByText('Reduction')[0]?.closest('.fw-param')?.querySelector('input')
    fireEvent.change(center!, { target: { value: String(puzzle01Ideal.notchCenterHz) } })
    fireEvent.change(width!, { target: { value: String(puzzle01Ideal.notchWidthHz) } })
    fireEvent.change(reduction!, { target: { value: String(puzzle01Ideal.notchReductionDb) } })
    await act(async () => {
      vi.advanceTimersByTime(2000)
      await Promise.resolve()
    })
    expect(onSeg).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('tab', { name: 'Notes' }))
    expect(screen.getByTestId('recovered-speech-empty')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('completes when all segments were already recovered (after listening)', async () => {
    stubAudio()
    const onDone = vi.fn()
    const recovered = puzzle01CassiniSession.sources[0]!.speechSegments!.map((s) => ({
      segmentId: s.id,
      text: s.text,
      startSec: s.startSec,
      unlockedAt: Date.now(),
    }))
    render(
      <ForensicWorkbench
        session={puzzle01CassiniSession}
        onClose={() => {}}
        onPuzzleComplete={onDone}
        recoveredSpeech={recovered}
        completed={false}
      />,
    )
    await waitFor(() => expect(onDone).toHaveBeenCalled(), { timeout: 3000 })
    await userEvent.click(screen.getByRole('tab', { name: 'Notes' }))
    expect(screen.getByTestId('recovered-speech-list').textContent).toMatch(/eu não lembro/)
    expect(screen.getByTestId('recovered-speech-list').textContent).toMatch(/escute isso até o fim/)
  })

  it('reset processing keeps recovered fragments', async () => {
    stubAudio()
    render(
      <ForensicWorkbench
        session={puzzle01CassiniSession}
        onClose={() => {}}
        recoveredSpeech={[
          {
            segmentId: 'seg_lembro',
            text: 'eu não lembro',
            startSec: 38.5,
            unlockedAt: 1,
          },
        ]}
      />,
    )
    await userEvent.click(screen.getByRole('tab', { name: 'Notes' }))
    expect(screen.getByText(/eu não lembro/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
    await userEvent.click(screen.getByRole('tab', { name: 'Notes' }))
    expect(screen.getByText(/eu não lembro/)).toBeInTheDocument()
  })
})

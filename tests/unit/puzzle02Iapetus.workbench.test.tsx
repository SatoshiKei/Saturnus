import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ForensicWorkbench } from '../../src/forensic/ForensicWorkbench'
import {
  puzzle02CorruptPageId,
  puzzle02IapetusSession,
} from '../../src/forensic/puzzles/puzzle02Iapetus'
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
  decodeAudioData() {
    return Promise.resolve({
      duration: 31.086,
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

describe('Puzzle 02 — IAPETUS workbench', () => {
  it('keeps all inspector tabs and shows Ogg structure table', async () => {
    stubAudio()
    render(<ForensicWorkbench session={puzzle02IapetusSession} onClose={() => {}} />)
    for (const tab of INSPECTOR_TABS) {
      expect(screen.getByRole('tab', { name: tab.label })).toBeInTheDocument()
    }
    await userEvent.click(screen.getByRole('tab', { name: 'File' }))
    expect(screen.getByText('Container duration')).toBeInTheDocument()
    expect(screen.getByText('Decoded duration')).toBeInTheDocument()
    expect(screen.getByText(/Decode ended before container EOF/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: 'Structure' }))
    expect(screen.getByTestId('structure-page-table')).toBeInTheDocument()
    expect(screen.getByTestId('structure-page-5').textContent).toMatch(/12/)
    expect(screen.getByTestId('structure-page-5').textContent).toMatch(/mismatch/)
    expect(screen.getByTestId('structure-page-5').textContent).toMatch(/CONTINUED/)
  })

  it('C — Rebuild without edit keeps truncated decode note', async () => {
    stubAudio()
    render(<ForensicWorkbench session={puzzle02IapetusSession} onClose={() => {}} />)
    await userEvent.click(screen.getByRole('tab', { name: 'Structure' }))
    await userEvent.click(screen.getByRole('button', { name: /Rebuild container/i }))
    expect(screen.getAllByText(/structural warnings/i).length).toBeGreaterThan(0)
    await userEvent.click(screen.getByRole('tab', { name: 'File' }))
    expect(screen.getByText(/Decode ended before container EOF/i)).toBeInTheDocument()
  })

  it('E/F — edit sequence then rebuild unlocks full decode', async () => {
    stubAudio()
    const onContainer = vi.fn()
    render(
      <ForensicWorkbench
        session={puzzle02IapetusSession}
        onClose={() => {}}
        onContainerStateChange={onContainer}
      />,
    )
    await userEvent.click(screen.getByRole('tab', { name: 'Structure' }))
    await userEvent.click(screen.getByTestId('structure-page-5'))
    const seqInput = screen.getByDisplayValue('12')
    fireEvent.change(seqInput, { target: { value: '5' } })
    expect(onContainer).toHaveBeenCalledWith(
      expect.objectContaining({
        rebuilt: false,
        sequences: expect.objectContaining({ [puzzle02CorruptPageId]: 5 }),
      }),
    )
    await userEvent.click(screen.getByRole('button', { name: /Rebuild container/i }))
    expect(screen.getAllByText(/Decode map reconstructed/i).length).toBeGreaterThan(0)
    expect(onContainer).toHaveBeenCalledWith(
      expect.objectContaining({
        rebuilt: true,
        sequences: expect.objectContaining({ [puzzle02CorruptPageId]: 5 }),
      }),
    )
    await userEvent.click(screen.getByRole('tab', { name: 'File' }))
    expect(screen.getByText(/Decode complete/i)).toBeInTheDocument()
  })

  it('G — completes when rebuilt + vertice finding already present', async () => {
    stubAudio()
    const onDone = vi.fn()
    render(
      <ForensicWorkbench
        session={puzzle02IapetusSession}
        onClose={() => {}}
        onPuzzleComplete={onDone}
        containerRebuilt
        structureSequences={{ [puzzle02CorruptPageId]: 5 }}
        recoveredSpeech={[
          {
            segmentId: 'seg_vertice',
            text: 'isso aí foi gravado no Vértice',
            startSec: 21.4,
            unlockedAt: 1,
          },
        ]}
      />,
    )
    await act(async () => {
      await Promise.resolve()
    })
    expect(onDone).toHaveBeenCalled()
  })

  it('H — UI copy does not mention Nico or Elisa', async () => {
    stubAudio()
    const { container } = render(
      <ForensicWorkbench session={puzzle02IapetusSession} onClose={() => {}} />,
    )
    expect(container.textContent).not.toMatch(/Nico|Elisa|nico|elisa/)
  })

  it('does not show expected sequence outside DEV page inspector field label for players', async () => {
    stubAudio()
    render(<ForensicWorkbench session={puzzle02IapetusSession} onClose={() => {}} />)
    await userEvent.click(screen.getByRole('tab', { name: 'Structure' }))
    // Table must not print "Expected: 5" as a player hint.
    expect(screen.getByTestId('structure-page-table').textContent).not.toMatch(/Expected:\s*5/)
  })
})

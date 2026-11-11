import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ForensicWorkbench } from '../../src/forensic/ForensicWorkbench'
import { puzzle01CassiniSession } from '../../src/forensic/puzzles/puzzle01Cassini'
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

describe('ForensicWorkbench UI', () => {
  it('keeps all inspector tabs available for WAV puzzle 1', async () => {
    vi.stubGlobal('AudioContext', FakeAudioContext)
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        arrayBuffer: async () => new ArrayBuffer(8),
      })),
    )

    render(
      <ForensicWorkbench
        session={puzzle01CassiniSession}
        onClose={() => {}}
      />,
    )

    for (const tab of INSPECTOR_TABS) {
      expect(screen.getByRole('tab', { name: tab.label })).toBeInTheDocument()
    }

    await userEvent.click(screen.getByRole('tab', { name: 'STRUCTURE' }))
    expect(screen.getByText(/não possui estrutura editável/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: 'PACKETS' }))
    expect(screen.getByText(/Nenhuma estrutura de pacotes/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: 'COMPARE' }))
    expect(screen.getByText(/Selecione duas fontes/i)).toBeInTheDocument()
  })

  it('does not reveal final narrative context in the workbench', () => {
    vi.stubGlobal('AudioContext', FakeAudioContext)
    const { container } = render(
      <ForensicWorkbench session={puzzle01CassiniSession} onClose={() => {}} />,
    )
    expect(container.textContent).not.toMatch(/Augusto|Rui|Elisa/)
  })
})
